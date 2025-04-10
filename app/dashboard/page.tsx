"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Users } from "lucide-react"
import Link from "next/link"
import { SessionCard } from "@/components/session-card"
import { LogoutButton } from "@/components/logout-button"
import { getUserSessions } from "@/lib/db"
import { supabase } from "@/lib/supabase"

interface Session {
  id: string
  title: string
  created_at: string
}

export default function Dashboard() {
  const [username, setUsername] = useState<string>("Demo User")
  const [recentSessions, setRecentSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserAndSessions = async () => {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        // Fetch user info
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError) {
          console.error("Error fetching user:", userError.message)
          setErrorMessage("Failed to fetch user")
        }

        if (user) {
          const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email || "User"
          const firstName = name.split(" ")[0]
          setUsername(firstName)
        }

        // Fetch recent sessions
        const sessions = await getUserSessions()
        setRecentSessions(sessions.slice(0, 2))
      } catch (error) {
        console.error("Error fetching data:", error)
        setErrorMessage("Failed to load dashboard data")
        setRecentSessions([])
      }

      setIsLoading(false)
    }

    fetchUserAndSessions()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 flex flex-col">
      <header className="mb-8 relative">
        <h1 className="text-3xl font-bold text-center">Chip Counter</h1>
        <div className="absolute top-0 right-0">
          <LogoutButton />
        </div>
      </header>

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">{errorMessage}</div>
      )}

      <div className="flex-1 flex flex-col gap-6">
        {/* Welcome Message */}
        <div className="text-center mb-2">
          <p className="text-lg">Welcome, {username}!</p>
        </div>

        {/* Recent Sessions Section */}
        {recentSessions.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Recent Sessions</h2>
            {recentSessions.map((session) => (
              <SessionCard
                key={session.id}
                id={session.id}
                title={session.title}
                date={new Date(session.created_at).toLocaleDateString()}
                players={0}
              />
            ))}

            {/* <Link href="/previous-sessions" className="block text-center text-sm text-blue-600 hover:underline mt-2">
              View all sessions
            </Link> */}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-auto space-y-4">
          <Button asChild className="w-full h-14 gap-2 bg-green-600 hover:bg-green-700">
            <Link href="/new-session">
              <Plus className="h-5 w-5" />
              Start New Session
            </Link>
          </Button>

          <Button asChild variant="outline" className="w-full h-14 gap-2">
            <Link href="/join-session">
              <Users className="h-5 w-5" />
              Join Existing Session
            </Link>
          </Button>

          <Button asChild variant="ghost" className="w-full h-14">
            <Link href="/previous-sessions">View Previous Sessions</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
