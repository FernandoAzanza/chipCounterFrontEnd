"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Camera, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

type ChipColor = "red" | "green" | "blue" | "white" | "black"

// Map backend color names to our frontend color names
const COLOR_MAPPING: Record<string, ChipColor> = {
  "Red Chip": "red",
  "Green Chip": "green",
  "Blue Chip": "blue",
  "White Chip": "white",
  "Black Chip": "black",
}

interface CameraButtonProps {
  onDetection: (results: { [color: string]: number }) => void
  label?: string
  activeChips?: ChipColor[]
}

export function CameraButton({
  onDetection,
  label = "Count with AI",
  activeChips = ["red", "green", "blue", "white", "black"],
}: CameraButtonProps) {
  const [open, setOpen] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })
      setStream(mediaStream)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }

      setError(null)
    } catch (error) {
      console.error("Error accessing camera:", error)
      setError("Could not access camera. Please check permissions.")
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (newOpen) {
      startCamera()
    } else {
      stopCamera()
    }
  }

  const captureAndDetect = async () => {
    if (!videoRef.current || !canvasRef.current) return

    try {
      setIsProcessing(true)
      setError(null)

      // Get video dimensions
      const videoWidth = videoRef.current.videoWidth
      const videoHeight = videoRef.current.videoHeight

      // Set canvas dimensions to match video
      canvasRef.current.width = videoWidth
      canvasRef.current.height = videoHeight

      // Draw current video frame to canvas
      const ctx = canvasRef.current.getContext("2d")
      if (!ctx) return

      ctx.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight)

      // Convert canvas to blob
      const blob = await new Promise<Blob | null>((resolve) => canvasRef.current?.toBlob(resolve, "image/jpeg", 0.8))

      if (!blob) {
        throw new Error("Failed to capture image")
      }

      // Create FormData and append the image
      const formData = new FormData()
      formData.append("file", blob, "chip-image.jpg")

      // Send to backend API
      const response = await fetch("http://localhost:8000/predict/", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()

      // Process the response
      const chipCounts: Record<string, number> = {}

      // Map the backend color names to our frontend color names
      Object.entries(data.counts_by_color).forEach(([backendColor, count]) => {
        const frontendColor = COLOR_MAPPING[backendColor] || backendColor.toLowerCase()
        if (activeChips.includes(frontendColor as ChipColor)) {
          chipCounts[frontendColor] = count as number
        }
      })

      // Send results to parent component
      onDetection(chipCounts)

      // Close the dialog
      handleOpenChange(false)
    } catch (err) {
      console.error("Error during chip detection:", err)
      setError(err instanceof Error ? err.message : "Failed to detect chips")
    } finally {
      setIsProcessing(false)
    }
  }

  // Fallback to mock detection if in development/preview
  const useMockDetection = () => {
    setIsProcessing(true)

    // Simulate API call delay
    setTimeout(() => {
      // Generate random counts only for active chips
      const mockResults: Record<string, number> = {}
      activeChips.forEach((color) => {
        mockResults[color] = Math.floor(Math.random() * 10) + 1
      })

      onDetection(mockResults)
      handleOpenChange(false)
      setIsProcessing(false)
    }, 1500)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-md">
          <Camera className="mr-2 h-5 w-5" />
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan Chips</DialogTitle>
        </DialogHeader>
        <div className="relative aspect-video bg-black rounded-md overflow-hidden">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          <canvas ref={canvasRef} className="absolute inset-0 hidden" />

          <div className="absolute inset-0 border-2 border-dashed border-white opacity-50 pointer-events-none" />

          <Button
            variant="outline"
            size="icon"
            className="absolute top-2 right-2 bg-white/80 hover:bg-white"
            onClick={() => handleOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {error && <div className="p-2 text-sm text-red-600 bg-red-100 rounded-md">{error}</div>}

        <div className="flex justify-center gap-2">
          <Button
            onClick={captureAndDetect}
            className="bg-green-600 hover:bg-green-700"
            disabled={isProcessing || !stream}
          >
            {isProcessing ? "Processing..." : "Detect Chips"}
          </Button>

          {process.env.NODE_ENV !== "production" && (
            <Button variant="outline" onClick={useMockDetection} disabled={isProcessing}>
              Use Mock Data
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
