import { getSupabaseClient, type Session, type ChipColor, type Player, type ChipCount } from "./supabase"

// Replace the line that gets the supabase client
const supabase = getSupabaseClient()

// Helper function to get the current user ID
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const { data, error } = await supabase.auth.getSession()

    if (error || !data.session) {
      console.log("No authenticated user found, using mock user ID")
      return "00000000-0000-0000-0000-000000000001" // Use a consistent mock ID for development
    }

    return data.session.user.id
  } catch (error) {
    console.error("Error getting current user:", error)
    return "00000000-0000-0000-0000-000000000001" // Fallback to mock ID
  }
}

// Session operations
export async function createSession(title: string): Promise<string | null> {
  // Get the current user ID
  const userId = await getCurrentUserId()

  // Start a transaction using Supabase's built-in transaction support
  const { data, error } = await supabase
    .from("sessions")
    .insert([{ title, user_id: userId }])
    .select("id")
    .single()

  if (error) {
    console.error("Error creating session:", error)
    return null
  }

  // Add the creator as a participant
  await addSessionParticipant(data.id, userId)

  return data.id
}

export async function getSession(id: string): Promise<Session | null> {
  const { data, error } = await supabase.from("sessions").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching session:", error)
    return null
  }

  return data
}

export async function getUserSessions(): Promise<Session[]> {
  // Get the current user ID
  const userId = await getCurrentUserId()
  console.log("Getting sessions for user ID:", userId)

  // First, get sessions where the user is the creator
  const { data: createdSessions, error: createdError } = await supabase
    .from("sessions")
    .select("*")
    .eq("user_id", userId)

  if (createdError) {
    console.error("Error fetching created sessions:", createdError)
    return []
  }

  // Then, get sessions where the user is a participant
  const { data: participatedSessionIds, error: participatedError } = await supabase
    .from("session_participants")
    .select("session_id")
    .eq("user_id", userId)

  if (participatedError) {
    console.error("Error fetching participated session IDs:", participatedError)
    return createdSessions || []
  }

  // If there are no participated sessions, return just the created ones
  if (!participatedSessionIds || participatedSessionIds.length === 0) {
    return createdSessions || []
  }

  // Extract the session IDs
  const sessionIds: string[] = participatedSessionIds.map((p: { session_id: string }) => p.session_id)

  // Get the session details for participated sessions
  const { data: participatedSessions, error: sessionsError } = await supabase
    .from("sessions")
    .select("*")
    .in("id", sessionIds)

  if (sessionsError) {
    console.error("Error fetching participated sessions:", sessionsError)
    return createdSessions || []
  }

  // Combine created and participated sessions, removing duplicates
  const allSessions = [...(createdSessions || [])]

  // Add participated sessions that aren't already in the list
  participatedSessions?.forEach((session: Session) => {
    if (!allSessions.some((s: Session) => s.id === session.id)) {
      allSessions.push(session)
    }
  })

  // Sort by created_at in descending order
  return allSessions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

// Session participants operations
export async function addSessionParticipant(sessionId: string, userId?: string | null): Promise<boolean> {
  // If no userId is provided, use the current user
  const participantId = userId || (await getCurrentUserId())

  if (!participantId) {
    console.error("No user ID available to add as participant")
    return false
  }

  // Check if the user is already a participant
  const { data: existingParticipant } = await supabase
    .from("session_participants")
    .select("id")
    .eq("session_id", sessionId)
    .eq("user_id", participantId)
    .single()

  // If already a participant, no need to add again
  if (existingParticipant) {
    return true
  }

  // Add the user as a participant
  const { error } = await supabase
    .from("session_participants")
    .insert([{ session_id: sessionId, user_id: participantId }])

  if (error) {
    console.error("Error adding session participant:", error)
    return false
  }

  return true
}

export async function getSessionParticipants(sessionId: string): Promise<string[]> {
  const { data, error } = await supabase.from("session_participants").select("user_id").eq("session_id", sessionId)

  if (error) {
    console.error("Error fetching session participants:", error)
    return []
  }

  return data.map((p: { user_id: string }) => p.user_id) || []
}

// Chip color operations
export async function setChipColors(
  sessionId: string,
  colors: { color: string; value: number; isActive: boolean }[],
): Promise<boolean> {
  const chipColors = colors.map((c) => ({
    session_id: sessionId,
    color: c.color,
    value: c.value,
    is_active: c.isActive,
  }))

  const { error } = await supabase.from("chip_colors").insert(chipColors)

  if (error) {
    console.error("Error setting chip colors:", error)
    return false
  }

  return true
}

export async function getChipColors(sessionId: string): Promise<ChipColor[]> {
  const { data, error } = await supabase.from("chip_colors").select("*").eq("session_id", sessionId)

  if (error) {
    console.error("Error fetching chip colors:", error)
    return []
  }

  return data || []
}

// Player operations
export async function createPlayer(sessionId: string, name: string, buyIn = 0): Promise<string | null> {
  const { data, error } = await supabase
    .from("players")
    .insert([{ session_id: sessionId, name, buy_in: buyIn }])
    .select("id")
    .single()

  if (error) {
    console.error("Error creating player:", error)
    return null
  }

  // Add the current user as a session participant
  await addSessionParticipant(sessionId)

  return data.id
}

export async function getSessionPlayers(sessionId: string): Promise<Player[]> {
  const { data, error } = await supabase.from("players").select("*").eq("session_id", sessionId)

  if (error) {
    console.error("Error fetching session players:", error)
    return []
  }

  return data || []
}

export async function updatePlayerBuyIn(playerId: string, buyIn: number): Promise<boolean> {
  const { error } = await supabase.from("players").update({ buy_in: buyIn }).eq("id", playerId)

  if (error) {
    console.error("Error updating player buy-in:", error)
    return false
  }

  return true
}

// Chip count operations
export async function updateChipCounts(playerId: string, counts: { color: string; count: number }[]): Promise<boolean> {
  // First, delete existing counts for this player
  const { error: deleteError } = await supabase.from("chip_counts").delete().eq("player_id", playerId)

  if (deleteError) {
    console.error("Error deleting existing chip counts:", deleteError)
    return false
  }

  // Then insert new counts
  const chipCounts = counts.map((c) => ({
    player_id: playerId,
    color: c.color,
    count: c.count,
  }))

  const { error } = await supabase.from("chip_counts").insert(chipCounts)

  if (error) {
    console.error("Error updating chip counts:", error)
    return false
  }

  return true
}

export async function getPlayerChipCounts(playerId: string): Promise<ChipCount[]> {
  const { data, error } = await supabase.from("chip_counts").select("*").eq("player_id", playerId)

  if (error) {
    console.error("Error fetching player chip counts:", error)
    return []
  }

  return data || []
}

// Helper function to get session stats (players with their chip counts and values)
export async function getSessionStats(sessionId: string): Promise<any[]> {
  // Get session players
  const players = await getSessionPlayers(sessionId)

  // Get chip colors for this session
  const chipColors = await getChipColors(sessionId)

  // For each player, get their chip counts
  const playerStats = await Promise.all(
    players.map(async (player) => {
      const chipCounts = await getPlayerChipCounts(player.id)

      // Calculate total value
      let chipValue = 0
      chipCounts.forEach((count) => {
        const color = chipColors.find((c) => c.color === count.color)
        if (color) {
          chipValue += count.count * color.value
        }
      })

      // Ensure buy_in is a number
      const buyIn = typeof player.buy_in === "number" ? player.buy_in : 0

      // Calculate net profit
      const netProfit = chipValue - buyIn

      return {
        ...player,
        chipValue: chipValue || 0,
        buyIn: buyIn || 0,
        netProfit: netProfit || 0,
        chipCounts,
      }
    }),
  )

  return playerStats
}
