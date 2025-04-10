"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { ChevronRight, QrCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChipInput } from "@/components/chip-input"
import { CameraButton } from "@/components/camera-button"
import { BuyInInput } from "@/components/buy-in-input"
import {
  getSession,
  getChipColors,
  createPlayer,
  updateChipCounts,
  getSessionPlayers,
  getPlayerChipCounts,
} from "@/lib/db"
import { AuthCheck } from "@/components/auth-check"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { QRDisplay } from "@/components/qr-display"

type ChipColor = "red" | "green" | "blue" | "white" | "black"


interface SessionPageProps {
  params: Promise<{ id: string }>
}

export default function SessionPage({ params }: SessionPageProps) {
  const { id } = use(params)
  const [playerName, setPlayerName] = useState("")
  const [sessionTitle, setSessionTitle] = useState("Loading...")
  const [activeChips, setActiveChips] = useState<ChipColor[]>([])
  const [chipCounts, setChipCounts] = useState<Record<ChipColor, number>>({ red: 0, green: 0, blue: 0, white: 0, black: 0 })
  const [chipValues, setChipValues] = useState<Record<ChipColor, number>>({ red: 0, green: 0, blue: 0, white: 0, black: 0 })
  const [buyInAmount, setBuyInAmount] = useState(0)
  const [totalValue, setTotalValue] = useState(0)
  const [netProfit, setNetProfit] = useState(0)
  const [playerId, setPlayerId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showQrCode, setShowQrCode] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setErrorMessage(null)
      const session = await getSession(id)
      if (!session) return setErrorMessage("Session not found")
      setSessionTitle(session.title)

      const colors = await getChipColors(id)
      const activeColors = colors.filter((c) => c.is_active).map((c) => c.color as ChipColor)
      setActiveChips(activeColors)
      const values = { red: 0, green: 0, blue: 0, white: 0, black: 0 }
      colors.forEach((c) => (values[c.color as ChipColor] = c.value))
      setChipValues(values)

      const players = await getSessionPlayers(id)
      if (players.length > 0) {
        const p = players[0]
        setPlayerId(p.id)
        setPlayerName(p.name)
        setBuyInAmount(p.buy_in || 0)
        const counts = await getPlayerChipCounts(p.id)
        const newCounts = { ...chipCounts }
        counts.forEach((c) => (newCounts[c.color as ChipColor] = c.count))
        setChipCounts(newCounts)
      }
      setIsLoading(false)
    }
    fetchData()
  }, [id])

  useEffect(() => {
    const total = activeChips.reduce((acc, c) => acc + chipCounts[c] * chipValues[c], 0)
    setTotalValue(total)
    setNetProfit(total - buyInAmount)
  }, [chipCounts, chipValues, activeChips, buyInAmount])

  useEffect(() => {
    const t = setTimeout(() => {
      setErrorMessage(null)
      setSuccessMessage(null)
    }, 3000)
    return () => clearTimeout(t)
  }, [errorMessage, successMessage])

  const handleSavePlayer = async () => {
    if (!playerName) return setErrorMessage("Please enter your name")
    try {
      const idToUse = playerId || (await createPlayer(id, playerName, buyInAmount))
      if (!idToUse) return setErrorMessage("Failed to save player data")
      setPlayerId(idToUse)
      const chipData = activeChips.map((c) => ({ color: c, count: chipCounts[c] }))
      await updateChipCounts(idToUse, chipData)
      setSuccessMessage("Your data has been saved")
    } catch (e) {
      setErrorMessage("Failed to save player data")
    }
  }

  const handleAIDetection = (results: { [color: string]: number }) => {
    const filtered = Object.fromEntries(
      Object.entries(results).filter(([c]) => activeChips.includes(c as ChipColor))
    )
    setChipCounts((prev) => ({ ...prev, ...filtered }))
  }

  const getSessionUrl = () => `${window.location.origin}/join-session?id=${id}`
  const getJoinUrl = () => {
  return `${window.location.origin}/join-session?id=${id}`
}

  if (isLoading) {
    return <AuthCheck><div className="min-h-screen flex items-center justify-center">Loading session data...</div></AuthCheck>
  }

  return (
    <AuthCheck>
      <div className="min-h-screen p-6 flex flex-col items-center relative">
        <Button variant="outline" 
        size="icon" 
        className="absolute top-2 left-2" 
        onClick={() => setShowQrCode(true)} 
        aria-label="Show QR Code"
      >
        <QrCode className="h-4 w-4" />
      </Button>


        <h1 className="text-2xl font-bold mb-6 text-center">{sessionTitle}</h1>

        {errorMessage && <div className="w-full max-w-sm mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded">{errorMessage}</div>}
        {successMessage && <div className="w-full max-w-sm mb-4 p-3 bg-green-100 text-green-700 border border-green-300 rounded">{successMessage}</div>}

        <div className="w-full max-w-sm space-y-6">
          <div>
            <Label htmlFor="playerName" className="text-center block mb-2">Player Name</Label>
            <Input id="playerName" value={playerName} onChange={(e) => setPlayerName(e.target.value)} placeholder="Your name" className="text-center" />
          </div>

          <BuyInInput value={buyInAmount} onChange={setBuyInAmount} />

          <div className="flex justify-between px-2 mt-8">
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
                onCountChange={(count) => setChipCounts((prev) => ({ ...prev, [color]: count }))}
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
            <span className={`font-bold text-xl ${netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>${netProfit.toFixed(2)}</span>
          </div>

          <CameraButton onDetection={handleAIDetection} activeChips={activeChips} />

          <Button className="w-full" onClick={handleSavePlayer}>Save</Button>
          <Button variant="ghost" className="w-full" asChild>
            <Link href={`/session/${id}/stats`}><span className="flex items-center justify-center gap-1">Stats <ChevronRight className="w-4 h-4" /></span></Link>
          </Button>
        </div>

        <Dialog open={showQrCode} onOpenChange={setShowQrCode}>
  <DialogContent className="sm:max-w-md">
    <DialogHeader>
      <DialogTitle>Invite Players</DialogTitle>
    </DialogHeader>
    <div className="flex flex-col items-center justify-center p-4">
      <QRDisplay
        value={getJoinUrl()}         // 👈 dynamically generated link to join session
        size={200}
        label="Scan this QR code to join this session"
        sessionId={id}               // 👈 optional prop if your QRDisplay uses it
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
