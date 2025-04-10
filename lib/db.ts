import { getSupabaseClient, type Session, type ChipColor, type Player, type ChipCount } from "./supabase"

// Get the supabase client
const supabase = getSupabaseClient()

// Session operations
export async function createSession(title: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.from("sessions").insert([{ title }]).select("id").single()

    if (error) {
      console.error("Error creating session:", error)
      return null
    }

    return data?.id || null
  } catch (error) {
    console.error("Exception in createSession:", error)
    return null
  }
}

export async function getSession(id: string): Promise<Session | null> {
  try {
    const { data, error } = await supabase.from("sessions").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching session:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Exception in getSession:", error)
    return null
  }
}

export async function getUserSessions(): Promise<Session[]> {
  try {
    const { data, error } = await supabase.from("sessions").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching user sessions:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Exception in getUserSessions:", error)
    return []
  }
}

// Chip color operations
export async function setChipColors(
  sessionId: string,
  colors: { color: string; value: number; isActive: boolean }[],
): Promise<boolean> {
  try {
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
  } catch (error) {
    console.error("Exception in setChipColors:", error)
    return false
  }
}

export async function getChipColors(sessionId: string): Promise<ChipColor[]> {
  try {
    const { data, error } = await supabase.from("chip_colors").select("*").eq("session_id", sessionId)

    if (error) {
      console.error("Error fetching chip colors:", error)
      return []
    }

    if (!data || data.length === 0) {
      // If no colors found, return default colors
      return [
        { id: "1", session_id: sessionId, color: "red", value: 0.5, is_active: true },
        { id: "2", session_id: sessionId, color: "green", value: 0.2, is_active: true },
        { id: "3", session_id: sessionId, color: "blue", value: 0, is_active: true },
        { id: "4", session_id: sessionId, color: "white", value: 0.1, is_active: true },
        { id: "5", session_id: sessionId, color: "black", value: 1, is_active: true },
      ]
    }

    return data
  } catch (error) {
    console.error("Exception in getChipColors:", error)
    // Return default colors on error
    return [
      { id: "1", session_id: sessionId, color: "red", value: 0.5, is_active: true },
      { id: "2", session_id: sessionId, color: "green", value: 0.2, is_active: true },
      { id: "3", session_id: sessionId, color: "blue", value: 0, is_active: true },
      { id: "4", session_id: sessionId, color: "white", value: 0.1, is_active: true },
      { id: "5", session_id: sessionId, color: "black", value: 1, is_active: true },
    ]
  }
}

// Player operations
export async function createPlayer(sessionId: string, name: string, buyIn = 0): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from("players")
      .insert([{ session_id: sessionId, name, buy_in: buyIn }])
      .select("id")
      .single()

    if (error) {
      console.error("Error creating player:", error)
      return null
    }

    return data?.id || null
  } catch (error) {
    console.error("Exception in createPlayer:", error)
    return null
  }
}

export async function getSessionPlayers(sessionId: string): Promise<Player[]> {
  try {
    const { data, error } = await supabase.from("players").select("*").eq("session_id", sessionId)

    if (error) {
      console.error("Error fetching session players:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Exception in getSessionPlayers:", error)
    return []
  }
}

export async function updatePlayerBuyIn(playerId: string, buyIn: number): Promise<boolean> {
  try {
    const { error } = await supabase.from("players").update({ buy_in: buyIn }).eq("id", playerId)

    if (error) {
      console.error("Error updating player buy-in:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Exception in updatePlayerBuyIn:", error)
    return false
  }
}

// Chip count operations
export async function updateChipCounts(playerId: string, counts: { color: string; count: number }[]): Promise<boolean> {
  try {
    // First, delete existing counts for this player
    const { error: deleteError } = await supabase.from("chip_counts").delete().eq("player_id", playerId)

    if (deleteError) {
      console.error("Error deleting existing chip counts:", deleteError)
      return false
    }

    // If there are no counts to add, we're done
    if (counts.length === 0) {
      return true
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
  } catch (error) {
    console.error("Exception in updateChipCounts:", error)
    return false
  }
}

export async function getPlayerChipCounts(playerId: string): Promise<ChipCount[]> {
  try {
    const { data, error } = await supabase.from("chip_counts").select("*").eq("player_id", playerId)

    if (error) {
      console.error("Error fetching player chip counts:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Exception in getPlayerChipCounts:", error)
    return []
  }
}

// Helper function to get session stats (players with their chip counts and values)
export async function getSessionStats(sessionId: string): Promise<any[]> {
  try {
    // Get session players
    const players = await getSessionPlayers(sessionId)
    if (players.length === 0) {
      return []
    }

    // Get chip colors for this session
    const chipColors = await getChipColors(sessionId)

    // For each player, get their chip counts
    const playerStats = await Promise.all(
      players.map(async (player) => {
        try {
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
        } catch (error) {
          console.error(`Error processing player ${player.id}:`, error)
          return {
            ...player,
            chipValue: 0,
            buyIn: player.buy_in || 0,
            netProfit: -(player.buy_in || 0),
            chipCounts: [],
          }
        }
      }),
    )

    return playerStats
  } catch (error) {
    console.error("Exception in getSessionStats:", error)
    return []
  }
}

// New function to update a session
export async function updateSession(id: string, data: Partial<Session>): Promise<boolean> {
  try {
    const { error } = await supabase.from("sessions").update(data).eq("id", id)

    if (error) {
      console.error("Error updating session:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Exception in updateSession:", error)
    return false
  }
}

// New function to delete a session
export async function deleteSession(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("sessions").delete().eq("id", id)

    if (error) {
      console.error("Error deleting session:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Exception in deleteSession:", error)
    return false
  }
}

// New function to get player details
export async function getPlayer(id: string): Promise<Player | null> {
  try {
    const { data, error } = await supabase.from("players").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching player:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Exception in getPlayer:", error)
    return null
  }
}
