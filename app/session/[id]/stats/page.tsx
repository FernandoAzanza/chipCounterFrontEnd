"use client"

import { use, useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getSession, getSessionStats } from "@/lib/db"
import { AuthCheck } from "@/components/auth-check"
import { Home, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Player {
  id: string
  name: string
  chipValue: number
  buyIn: number
  netProfit: number
}

interface StatsPageProps {
  params: Promise<{ id: string }>
}

export default function StatsPage({ params }: StatsPageProps) {
  const { id } = use(params)
  const [sessionTitle, setSessionTitle] = useState("Loading...")
  const [players, setPlayers] = useState<Player[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    // Fetch session data from Supabase
    const fetchSessionData = async () => {
      try {
        setIsLoading(true)
        setErrorMessage(null)

        // Get session details
        const session = await getSession(id)
        if (session) {
          setSessionTitle(session.title)
        } else {
          setErrorMessage("Session not found")
          return
        }

        // Get session stats
        const stats = await getSessionStats(id)
        setPlayers(stats)
      } catch (error) {
        console.error("Error fetching session data:", error)
        setErrorMessage("Failed to load session data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSessionData()
  }, [id])

  if (isLoading) {
    return (
      <AuthCheck>
        <div className="min-h-screen p-6 flex items-center justify-center">
          <p>Loading session stats...</p>
        </div>
      </AuthCheck>
    )
  }

  return (
    <AuthCheck>
      <div className="min-h-screen p-6 relative">
        {/* Home Button */}
        <Button variant="outline" size="sm" className="absolute top-2 left-2 flex items-center gap-1" asChild>
          <Link href="/dashboard">
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Home</span>
          </Link>
        </Button>

        {/* Back to Session Button */}
        <Button variant="outline" size="sm" className="absolute top-2 right-2 flex items-center gap-1" asChild>
          <Link href={`/session/${id}`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Session</span>
          </Link>
        </Button>

        <h1 className="text-2xl font-bold mb-6 text-center pt-10">{sessionTitle}</h1>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">{errorMessage}</div>
        )}

        <div className="space-y-4">
          {players.length > 0 ? (
            players.map((player) => (
              <Card key={player.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">{player.name}</span>
                    <span
                      className={`text-xl font-bold ${(player.netProfit || 0) >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      ${(player.netProfit || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Buy In: ${(player.buyIn || 0).toFixed(2)}</span>
                    <span>Chip Value: ${(player.chipValue || 0).toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-center text-gray-500">No players have joined this session yet.</p>
          )}
        </div>
      </div>
    </AuthCheck>
  )
}
