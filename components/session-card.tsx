"use client"

import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { CalendarIcon, Users } from "lucide-react"
import { useEffect, useState } from "react"
import { getSessionPlayers } from "@/lib/db"

interface SessionCardProps {
  id: string
  title: string
  date: string
  players?: number
}

export function SessionCard({ id, title, date, players: initialPlayerCount = 0 }: SessionCardProps) {
  const [playerCount, setPlayerCount] = useState(initialPlayerCount)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPlayerCount = async () => {
      try {
        const sessionPlayers = await getSessionPlayers(id)
        setPlayerCount(sessionPlayers.length)
      } catch (error) {
        console.error("Error fetching player count:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlayerCount()
  }, [id])

  return (
    <Link href={`/session/${id}/stats`} className="block">
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium text-lg">{title}</h3>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                <span>{date}</span>
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Users className="h-4 w-4 mr-1" />
              <span>{isLoading ? "..." : playerCount}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
