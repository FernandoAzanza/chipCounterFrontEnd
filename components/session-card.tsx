import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { CalendarIcon, Users } from "lucide-react"

interface SessionCardProps {
  id: string
  title: string
  date: string
  players: number
}

export function SessionCard({ id, title, date, players }: SessionCardProps) {
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
              <span>{players}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
