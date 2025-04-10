"use client"

import { Button } from "@/components/ui/button"
import { Plus, Users, LogIn } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen p-6 flex flex-col">
      <header className="mb-8 relative">
        <h1 className="text-3xl font-bold text-center">Chip Counter</h1>
        <div className="absolute top-0 right-0">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">
              <LogIn className="mr-2 h-4 w-4" />
              Log In
            </Link>
          </Button>
        </div>
      </header>

      <div className="flex-1 flex flex-col">
        <div className="text-center mb-8">
          <p className="text-gray-500 italic">"Count chips, not mistakes"</p>
        </div>

        {/* Action Buttons - Direct links bypassing authentication */}
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
        </div>
      </div>
    </div>
  )
}
