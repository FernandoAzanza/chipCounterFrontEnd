"use client"
import { Card, CardContent } from "@/components/ui/card"
import { QRCodeSVG } from "qrcode.react"

interface QRDisplayProps {
  value: string
  size?: number
  label?: string
  sessionId?: string
}

export function QRDisplay({ value, size = 150, label = "Share", sessionId }: QRDisplayProps) {
  return (
    <Card className="w-full max-w-xs mx-auto">
      <CardContent className="flex flex-col items-center justify-center p-4">
        <QRCodeSVG value={value} size={size} />
        <p className="mt-2 text-sm text-gray-500">{label}</p>
        {sessionId && <p className="mt-1 text-xs text-gray-400">Session ID: {sessionId}</p>}
      </CardContent>
    </Card>
  )
}
