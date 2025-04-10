"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChipInput } from "@/components/chip-input"
import { QRDisplay } from "@/components/qr-display"
import { AddChipButton } from "@/components/add-chip-button"
import { useRouter } from "next/navigation"
import { createSession, setChipColors } from "@/lib/db"
import { Card, CardContent } from "@/components/ui/card"
import { AuthCheck } from "@/components/auth-check"

type ChipColor = "red" | "green" | "blue" | "white" | "black"

export default function NewSession() {
  const [title, setTitle] = useState("")
  const [activeChips, setActiveChips] = useState<ChipColor[]>(["red", "green", "blue", "white", "black"])
  const [chipValues, setChipValues] = useState<Record<ChipColor, number>>({
    red: 0,
    green: 0,
    blue: 0,
    white: 0,
    black: 0,
  })
  const [sessionId, setSessionId] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const router = useRouter()

  const allChipColors: ChipColor[] = ["red", "green", "blue", "white", "black"]
  const availableChips = allChipColors.filter((color) => !activeChips.includes(color))

  const handleChipValueChange = (color: ChipColor, value: number) => {
    setChipValues((prev) => ({
      ...prev,
      [color]: value,
    }))
  }

  const handleRemoveChip = (color: ChipColor) => {
    setActiveChips((prev) => prev.filter((c) => c !== color))
  }

  const handleAddChip = (color: ChipColor) => {
    setActiveChips((prev) => [...prev, color])
  }

  const applyPresetValues = () => {
    setChipValues({
      red: 0.5,
      green: 0.2,
      blue: 0.0,
      white: 0.1,
      black: 1.0,
    })
  }

  const handleCreateSession = async () => {
    if (!title) return

    setIsCreating(true)
    setErrorMessage(null)

    try {
      // Create session in database
      const id = await createSession(title)

      if (!id) {
        setErrorMessage("Failed to create session. Please try again.")
        setIsCreating(false)
        return
      }

      // Save chip colors
      const chipColorsData = activeChips.map((color) => ({
        color,
        value: chipValues[color],
        isActive: true,
      }))

      await setChipColors(id, chipColorsData)

      // Set session ID for QR code
      setSessionId(id)
      setIsCreating(false)
    } catch (error) {
      console.error("Error creating session:", error)
      setErrorMessage("Failed to create session. Please try again.")
      setIsCreating(false)
    }
  }

  const handleContinueToSession = () => {
    if (sessionId) {
      router.push(`/session/${sessionId}`)
    }
  }

  // Generate the join URL for the QR code
  const getJoinUrl = () => {
    return `${window.location.origin}/join-session?id=${sessionId}`
  }

  return (
    <AuthCheck>
      <div className="min-h-screen p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">New Poker Session</h1>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">{errorMessage}</div>
        )}

        <div className="space-y-6">
          <div>
            <Label htmlFor="title">Session Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Friday Night Poker"
              className="mt-1"
            />
          </div>

          <Card className="mt-4 hover:shadow-md transition-shadow cursor-pointer" onClick={applyPresetValues}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <h3 className="font-medium">Apply Standard Values</h3>
                <p className="text-sm text-gray-500">
                  Red: $0.50 | Green: $0.20 | Blue: $0.00 | White: $0.10 | Black: $1.00
                </p>
              </div>
              <Button variant="outline" size="sm">
                Apply
              </Button>
            </CardContent>
          </Card>

          <div>
            <h2 className="text-xl font-semibold mb-4">Insert Chip Values:</h2>
            <div className="space-y-2">
              {activeChips.map((color) => (
                <ChipInput
                  key={color}
                  color={color}
                  label={color.charAt(0).toUpperCase() + color.slice(1)}
                  value={chipValues[color]}
                  showCount={false}
                  showRemoveButton={true}
                  onValueChange={(value) => handleChipValueChange(color, value)}
                  onRemove={() => handleRemoveChip(color)}
                />
              ))}

              <AddChipButton availableColors={availableChips} onAddChip={handleAddChip} />
            </div>
          </div>

          {!sessionId && (
            <Button
              onClick={handleCreateSession}
              className="w-full h-14 text-xl bg-green-600 hover:bg-green-700"
              disabled={!title || activeChips.length === 0 || isCreating}
            >
              {isCreating ? "Creating..." : "Create Session"}
            </Button>
          )}

          {sessionId && (
            <>
              <div className="my-6">
                <QRDisplay
                  value={getJoinUrl()}
                  label="Share this QR code to invite players"
                  sessionId={sessionId}
                  size={200}
                />
              </div>

              <Button onClick={handleContinueToSession} className="w-full h-14 text-xl bg-green-600 hover:bg-green-700">
                Continue to Session
              </Button>
            </>
          )}
        </div>
      </div>
    </AuthCheck>
  )
}
