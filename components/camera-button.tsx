"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Camera, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { API_CONFIG } from "@/lib/config"

type ChipColor = "red" | "green" | "blue" | "white" | "black"

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
      if (videoRef.current) videoRef.current.srcObject = mediaStream
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
    if (newOpen) startCamera()
    else stopCamera()
  }

  const captureAndDetect = async () => {
    if (!videoRef.current || !canvasRef.current) return
    setIsProcessing(true)
    setError(null)

    const videoWidth = videoRef.current.videoWidth
    const videoHeight = videoRef.current.videoHeight
    canvasRef.current.width = videoWidth
    canvasRef.current.height = videoHeight

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return
    ctx.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight)

    const blob = await new Promise<Blob | null>((resolve) => canvasRef.current?.toBlob(resolve, "image/jpeg", 0.8))

    if (!blob) {
      setIsProcessing(false)
      setError("Failed to capture image")
      return
    }

    const formData = new FormData()
    formData.append("file", blob, "chip-image.jpg")

    try {
      // Log the API endpoint for debugging
      console.log("Sending request to:", `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.predict}`)

      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.predict}`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()

      // Log the full response for debugging
      console.log("API Response:", data)

      // Initialize chip counts
      const chipCounts: Record<string, number> = {}

      // Handle different response formats
      if (data && data.chip_counts) {
        // Your Modal endpoint format (confirmed from curl test)
        Object.entries(data.chip_counts).forEach(([backendColor, count]) => {
          const frontendColor = COLOR_MAPPING[backendColor] || backendColor.toLowerCase()
          if (activeChips.includes(frontendColor as ChipColor)) {
            chipCounts[frontendColor] = count as number
          }
        })
      } else if (data && data.counts_by_color) {
        // Alternative format
        Object.entries(data.counts_by_color).forEach(([backendColor, count]) => {
          const frontendColor = COLOR_MAPPING[backendColor] || backendColor.toLowerCase()
          if (activeChips.includes(frontendColor as ChipColor)) {
            chipCounts[frontendColor] = count as number
          }
        })
      } else if (data && data.detections) {
        // Alternative format with detections array
        const counts: Record<string, number> = {}
        data.detections.forEach((detection: any) => {
          const className = detection.class_name || detection.class || "unknown"
          counts[className] = (counts[className] || 0) + 1
        })

        Object.entries(counts).forEach(([backendColor, count]) => {
          const frontendColor = COLOR_MAPPING[backendColor] || backendColor.toLowerCase()
          if (activeChips.includes(frontendColor as ChipColor)) {
            chipCounts[frontendColor] = count as number
          }
        })
      } else if (data && typeof data === "object") {
        // Try to interpret the response as a direct mapping
        for (const key in data) {
          if (typeof data[key] === "number") {
            const frontendColor = COLOR_MAPPING[key] || key.toLowerCase()
            if (activeChips.includes(frontendColor as ChipColor)) {
              chipCounts[frontendColor] = data[key]
            }
          }
        }
      }

      // If no chips were detected or the format wasn't recognized, use mock data
      if (Object.keys(chipCounts).length === 0) {
        console.warn("No chip counts found in API response, using mock data")
        activeChips.forEach((color) => {
          chipCounts[color] = 0
        })
      }

      onDetection(chipCounts)
      handleOpenChange(false)
    } catch (err) {
      console.error("Error during chip detection:", err)
      setError(err instanceof Error ? err.message : "Failed to detect chips")
    } finally {
      setIsProcessing(false)
    }
  }

  const useMockDetection = () => {
    setIsProcessing(true)
    setTimeout(() => {
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
