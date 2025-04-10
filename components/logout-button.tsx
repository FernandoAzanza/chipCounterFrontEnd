"use client"

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

export function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    // Bypass actual logout - just redirect
    router.push("/")
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-500">
      <LogOut className="h-4 w-4 mr-2" />
      Log Out
    </Button>
  )
}
