import { createClient } from "@supabase/supabase-js"

// Types for our database tables
export type Session = {
  id: string
  title: string
  created_at: string
  updated_at: string
}

export type ChipColor = {
  id: string
  session_id: string
  color: string
  value: number
  is_active: boolean
  created_at?: string
}

export type Player = {
  id: string
  session_id: string
  name: string
  buy_in: number
  created_at: string
}

export type ChipCount = {
  id: string
  player_id: string
  color: string
  count: number
  created_at?: string
}

// Create a mock client for development/preview
function createMockClient() {
  console.warn("Using mock Supabase client. Database operations will return mock data.")

  // This is a simple mock implementation that returns empty arrays or success messages
  return {
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: null }),
          data: [],
          error: null,
        }),
        order: () => ({
          data: [],
          error: null,
        }),
        data: [],
        error: null,
      }),
      insert: () => ({
        select: () => ({
          single: async () => ({
            data: { id: "00000000-0000-0000-0000-000000000001" },
            error: null,
          }),
        }),
        error: null,
      }),
      update: () => ({
        eq: () => ({ error: null }),
      }),
      delete: () => ({
        eq: () => ({ error: null }),
      }),
    }),
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
    },
  } as any
}

// Create a function to get the Supabase client
// This allows us to handle cases where the environment variables might not be available
let supabaseInstance: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (!supabaseInstance) {
    // Check if we have the required environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn("Supabase credentials not found. Using mock client.")
      return createMockClient()
    }

    // Create the real Supabase client
    try {
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
      console.log("Supabase client initialized successfully")
    } catch (error) {
      console.error("Error initializing Supabase client:", error)
      return createMockClient()
    }
  }

  return supabaseInstance
}

// Export the supabase client for convenience
export const supabase = getSupabaseClient()
