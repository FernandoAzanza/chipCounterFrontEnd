"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter, useSearchParams } from "next/navigation"
import { QrCode } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getSession } from "@/lib/db"
import { AuthCheck } from "@/components/auth-check"
import { QRScanner } from "@/components/qr-scanner"

export default function JoinSession() {
  const [sessionId, setSessionId] = useState("")
  const [isChecking, setIsChecking] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showScanner, setShowScanner] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Check for session ID in URL parameters (from QR code)
  useEffect(() => {
    const idFromUrl = searchParams.get("id")
    if (idFromUrl) {
      setSessionId(idFromUrl)
      // Auto-join if ID is provided in URL
      handleJoinSession(idFromUrl)
    }
  }, [searchParams])

  const handleJoinSession = async (idToJoin = sessionId) => {
    if (!idToJoin) return

    setIsChecking(true)
    setErrorMessage(null)

    try {
      // Check if session exists
      const session = await getSession(idToJoin)

      if (!session) {
        setErrorMessage("Session not found. Please check the ID and try again.")
        setIsChecking(false)
        return
      }

      // Session exists, navigate to it
      router.push(`/session/${idToJoin}`)
    } catch (error) {
      console.error("Error joining session:", error)
      setErrorMessage("Failed to join session. Please try again.")
      setIsChecking(false)
    }
  }

  const handleScan = (scannedData: string) => {
    setShowScanner(false)
    setSessionId(scannedData)

    // Auto-join with the scanned session ID
    if (scannedData) {
      handleJoinSession(scannedData)
    }
  }

  return (
    <AuthCheck>
      <div className="min-h-screen p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Join Poker Session</h1>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">{errorMessage}</div>
        )}

        <div className="space-y-6">
          <div>
            <Label htmlFor="sessionId">Session ID</Label>
            <div className="flex mt-1">
              <Input
                id="sessionId"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                placeholder="Enter session ID"
                className="rounded-r-none"
              />
              <Button variant="outline" className="rounded-l-none" onClick={() => setShowScanner(true)}>
                <QrCode className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <Button
            onClick={() => handleJoinSession()}
            className="w-full h-14 text-xl bg-red-600 hover:bg-red-700"
            disabled={!sessionId || isChecking}
          >
            {isChecking ? "Checking..." : "Join Session"}
          </Button>
        </div>

        {/* QR Scanner Dialog */}
        <Dialog open={showScanner} onOpenChange={setShowScanner}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Scan QR Code</DialogTitle>
            </DialogHeader>
            <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
          </DialogContent>
        </Dialog>
      </div>
    </AuthCheck>
  )
}
