"use client"

import { use, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChipInput } from "@/components/chip-input"
import { CameraButton } from "@/components/camera-button"
import { BuyInInput } from "@/components/buy-in-input"
import { ChevronRight, QrCode } from "lucide-react"
import {
  getSession,
  getChipColors,
  createPlayer,
  updateChipCounts,
  getSessionPlayers,
  getPlayerChipCounts,
  updatePlayerBuyIn,
  addSessionParticipant,
} from "@/lib/db"
import { AuthCheck } from "@/components/auth-check"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { QRDisplay } from "@/components/qr-display"
import { useRouter } from "next/navigation"

type ChipColor = "red" | "green" | "blue" | "white" | "black"

interface SessionPageProps {
  params: Promise<{ id: string }>
}

export default function SessionPage({ params }: SessionPageProps) {
  const { id } = use(params)
  const [playerName, setPlayerName] = useState("")
  const [sessionTitle, setSessionTitle] = useState("Loading...")
  const [activeChips, setActiveChips] = useState<ChipColor[]>([])
  const [chipCounts, setChipCounts] = useState<Record<ChipColor, number>>({
    red: 0,
    green: 0,
    blue: 0,
    white: 0,
    black: 0,
  })
  const [chipValues, setChipValues] = useState<Record<ChipColor, number>>({
    red: 0,
    green: 0,
    blue: 0,
    white: 0,
    black: 0,
  })
  const [buyInAmount, setBuyInAmount] = useState(0)
  const [totalValue, setTotalValue] = useState(0)
  const [netProfit, setNetProfit] = useState(0)
  const [playerId, setPlayerId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showQrCode, setShowQrCode] = useState(false)
  const [aiDetectionCount, setAiDetectionCount] = useState(0)
  const [dataLoaded, setDataLoaded] = useState(false)

  const router = useRouter()

  // Reset saving state when component mounts/unmounts
  useEffect(() => {
    setIsSaving(false)
    return () => {
      setIsSaving(false)
    }
  }, [])

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

          // Add the current user as a participant when they view the session
          await addSessionParticipant(id)
        } else {
          setErrorMessage("Session not found")
          return
        }

        // Get chip colors
        const colors = await getChipColors(id)
        if (colors && colors.length > 0) {
          const activeColors = colors.filter((c) => c.is_active).map((c) => c.color as ChipColor)

          setActiveChips(activeColors)

          // Set chip values
          const values: Record<ChipColor, number> = {
            red: 0,
            green: 0,
            blue: 0,
            white: 0,
            black: 0,
          }

          colors.forEach((c) => {
            if (c.color in values) {
              values[c.color as ChipColor] = c.value
            }
          })

          setChipValues(values)
        }

        // Try to load existing player data
        await loadExistingPlayerData()

        setDataLoaded(true)
      } catch (error) {
        console.error("Error fetching session data:", error)
        setErrorMessage("Failed to load session data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSessionData()
  }, [id])

  // Load existing player data if available
  const loadExistingPlayerData = async () => {
    try {
      // Get players for this session
      const players = await getSessionPlayers(id)

      // If there are players, use the first one (for simplicity)
      // In a real app, you might want to show a player selection UI
      if (players && players.length > 0) {
        const player = players[0]
        setPlayerId(player.id)
        setPlayerName(player.name)
        setBuyInAmount(player.buy_in || 0)

        // Load this player's chip counts
        const counts = await getPlayerChipCounts(player.id)

        if (counts && counts.length > 0) {
          const newCounts = { ...chipCounts }

          counts.forEach((count) => {
            if (count.color in newCounts) {
              newCounts[count.color as ChipColor] = count.count
            }
          })

          setChipCounts(newCounts)
        }
      }
    } catch (error) {
      console.error("Error loading existing player data:", error)
      // Don't show an error message here, as this is just an enhancement
    }
  }

  useEffect(() => {
    // Calculate total value
    let total = 0
    activeChips.forEach((color) => {
      total += chipCounts[color] * chipValues[color]
    })
    setTotalValue(total)

    // Calculate net profit (total value minus buy-in)
    setNetProfit(total - buyInAmount)
  }, [chipCounts, chipValues, activeChips, buyInAmount])

  // Clear messages after 3 seconds
  useEffect(() => {
    if (errorMessage || successMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null)
        setSuccessMessage(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [errorMessage, successMessage])

  const handleChipCountChange = (color: ChipColor, count: number) => {
    setChipCounts((prev) => ({
      ...prev,
      [color]: count,
    }))
  }

  const handleBuyInChange = (value: number) => {
    setBuyInAmount(value)

    // If we already have a player ID, update the buy-in amount
    if (playerId) {
      updatePlayerBuyIn(playerId, value).catch((error) => {
        console.error("Error updating buy-in:", error)
      })
    }
  }

  const handleAIDetection = (results: { [color: string]: number }) => {
    // Filter results to only include active chips
    const filteredResults = Object.fromEntries(
      Object.entries(results).filter(([color]) => activeChips.includes(color as ChipColor)),
    )

    setChipCounts((prev) => ({
      ...prev,
      ...filteredResults,
    }))

    // Increment AI detection count
    setAiDetectionCount((prev) => prev + 1)

    // Show success message
    setSuccessMessage(`Chips detected and counted successfully!`)

    // Auto-save after AI detection if player is already saved
    if (playerId) {
      handleSavePlayer(true)
    }
  }

  const handleSavePlayer = async (isAutoSave = false): Promise<boolean> => {
    if (!playerName && !isAutoSave) {
      setErrorMessage("Please enter your name")
      return false
    }

    try {
      setIsSaving(true)

      // Create or update player
      let playerIdToUse = playerId

      if (!playerIdToUse) {
        if (!playerName) {
          setErrorMessage("Please enter your name")
          setIsSaving(false)
          return false
        }

        // Create new player
        playerIdToUse = await createPlayer(id, playerName, buyInAmount)
        if (!playerIdToUse) {
          setErrorMessage("Failed to save player data")
          setIsSaving(false)
          return false
        }
        setPlayerId(playerIdToUse)
      } else {
        // Update existing player's buy-in
        await updatePlayerBuyIn(playerIdToUse, buyInAmount)
      }

      // Save chip counts
      const chipCountsData = activeChips.map((color) => ({
        color,
        count: chipCounts[color],
      }))

      await updateChipCounts(playerIdToUse, chipCountsData)

      if (!isAutoSave) {
        setSuccessMessage("Your data has been saved")
      }

      setIsSaving(false)
      return true
    } catch (error) {
      console.error("Error saving player data:", error)
      setErrorMessage("Failed to save data")
      setIsSaving(false)
      return false
    }
  }

  const handleSaveAndNavigateToStats = async () => {
    // Show saving indicator
    setIsSaving(true)

    try {
      // First try to save the data
      const saveSuccess = await handleSavePlayer()

      // Only navigate if save was successful
      if (saveSuccess) {
        setSuccessMessage("Data saved! Navigating to stats...")

        // Make sure to reset isSaving state before navigation
        setIsSaving(false)

        // Short delay to show the success message
        setTimeout(() => {
          router.push(`/session/${id}/stats`)
        }, 500)
      } else {
        // Ensure isSaving is reset if save fails
        setIsSaving(false)
      }
    } catch (error) {
      console.error("Error saving before navigation:", error)
      setErrorMessage("Failed to save data before viewing stats")
      setIsSaving(false)
    }
  }

  // Get the join URL for the QR code
  const getJoinUrl = () => {
    return `${window.location.origin}/join-session?id=${id}`
  }

  if (isLoading) {
    return (
      <AuthCheck>
        <div className="min-h-screen p-6 flex items-center justify-center">
          <p>Loading session data...</p>
        </div>
      </AuthCheck>
    )
  }

  return (
    <AuthCheck>
      <div className="min-h-screen p-6 flex flex-col items-center relative">
        {/* QR Code Button */}
        <Button
          variant="outline"
          size="icon"
          className="absolute top-2 left-2"
          onClick={() => setShowQrCode(true)}
          aria-label="Show QR Code"
        >
          <QrCode className="h-4 w-4" />
        </Button>

        <h1 className="text-2xl font-bold mb-6 text-center">{sessionTitle}</h1>

        {errorMessage && (
          <div className="w-full max-w-sm mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="w-full max-w-sm mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded">
            {successMessage}
          </div>
        )}

        <div className="w-full max-w-sm space-y-6">
          <div>
            <Label htmlFor="playerName" className="text-center block mb-2">
              Player Name
            </Label>
            <Input
              id="playerName"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Your name"
              className="text-center"
            />
          </div>

          <BuyInInput value={buyInAmount} onChange={handleBuyInChange} />

          <div className="flex justify-between px-2 w-full mt-8">
            <div className="w-1/2 text-center font-semibold">#</div>
            <div className="w-1/2 text-center font-semibold">$</div>
          </div>

          <div className="space-y-4">
            {activeChips.map((color) => (
              <ChipInput
                key={color}
                color={color}
                count={chipCounts[color]}
                value={chipValues[color]}
                onCountChange={(count) => handleChipCountChange(color, count)}
                readOnly={false}
              />
            ))}
          </div>

          <div className="flex justify-between items-center py-2 border-t">
            <span className="font-medium">Total Chip Value:</span>
            <span className="font-medium">${totalValue.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center py-2 border-t border-b">
            <span className="font-bold">Net Profit/Loss:</span>
            <span className={`font-bold text-xl ${netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
              ${netProfit.toFixed(2)}
            </span>
          </div>

          <div className="mt-8 w-full">
            <CameraButton onDetection={handleAIDetection} activeChips={activeChips} />
            {aiDetectionCount > 0 && (
              <p className="text-center text-sm text-gray-500 mt-2">
                AI detection used {aiDetectionCount} time{aiDetectionCount !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          <div className="flex justify-center mt-4">
            <Button
              variant="ghost"
              onClick={handleSaveAndNavigateToStats}
              disabled={isSaving || !dataLoaded}
              className="px-8"
            >
              {isSaving ? "Saving..." : "Stats"} <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* QR Code Dialog */}
        <Dialog open={showQrCode} onOpenChange={setShowQrCode}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Invite Players</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center p-4">
              <QRDisplay
                value={getJoinUrl()}
                size={200}
                label="Scan this QR code to join this session"
                sessionId={id}
              />
              <p className="mt-4 text-center text-sm">
                Players can also join by entering this session ID in the join page:
              </p>
              <div className="mt-2 p-2 bg-gray-100 rounded-md font-mono text-center w-full">{id}</div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AuthCheck>
  )
}
