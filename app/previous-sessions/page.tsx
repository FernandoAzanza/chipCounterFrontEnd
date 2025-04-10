"use client"

import { useState, useEffect } from "react"
import { SessionCard } from "@/components/session-card"
import { getUserSessions } from "@/lib/db"
import { useRouter } from "next/navigation"
import { AuthCheck } from "@/components/auth-check"

interface Session {
  id: string
  title: string
  created_at: string
  updated_at: string
}

export default function PreviousSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Fetch user sessions
    const fetchSessions = async () => {
      try {
        setIsLoading(true)
        setErrorMessage(null)
        const userSessions = await getUserSessions()
        setSessions(userSessions)
      } catch (error) {
        console.error("Error fetching sessions:", error)
        setErrorMessage("Failed to load your sessions")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSessions()
  }, [router])

  if (isLoading) {
    return (
      <AuthCheck>
        <div className="min-h-screen p-6 flex items-center justify-center">
          <p>Loading your sessions...</p>
        </div>
      </AuthCheck>
    )
  }

  return (
    <AuthCheck>
      <div className="min-h-screen p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Previous Sessions</h1>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">{errorMessage}</div>
        )}

        <div className="space-y-4">
          {sessions.length > 0 ? (
            sessions.map((session) => (
              <SessionCard
                key={session.id}
                id={session.id}
                title={session.title}
                date={new Date(session.created_at).toLocaleDateString()}
                players={0} // We'll need to fetch this separately or add it to the query
              />
            ))
          ) : (
            <p className="text-center text-gray-500">No previous sessions found</p>
          )}
        </div>
      </div>
    </AuthCheck>
  )
}
