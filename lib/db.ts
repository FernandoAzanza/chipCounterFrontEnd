import { getSupabaseClient, type Session, type ChipColor, type Player, type ChipCount } from "./supabase"

// Replace the line that gets the supabase client
const supabase = getSupabaseClient()

// Helper function to get the current user ID
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const { data, error } = await supabase.auth.getSession()

    if (error || !data.session) {
      console.log("No authenticated user found, using mock user ID")
      return "mock-user-id" // Use a consistent mock ID for development
    }

    return data.session.user.id
  } catch (error) {
    console.error("Error getting current user:", error)
    return "mock-user-id" // Fallback to mock ID
  }
}

// Session operations
export async function createSession(title: string): Promise<string | null> {
  // Get the current user ID
  const userId = await getCurrentUserId()

  const { data, error } = await supabase
    .from("sessions")
    .insert([{ title, user_id: userId }])
    .select("id")
    .single()

  if (error) {
    console.error("Error creating session:", error)
    return null
  }

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

  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching user sessions:", error)
    return []
  }

  return data || []
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
