"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Camera, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

type ChipColor = "red" | "green" | "blue" | "white" | "black"

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
    } catch (error) {
      console.error("Error accessing camera:", error)
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

  const captureAndDetect = () => {
    // In a real app, this would send the image to a YOLOv8 model
    // For demo purposes, we'll simulate detection results
    // Only include active chips in the results
    const mockResults: Record<string, number> = {}

    // Generate random counts only for active chips
    activeChips.forEach((color) => {
      mockResults[color] = Math.floor(Math.random() * 10) + 1
    })

    onDetection(mockResults)
    handleOpenChange(false)
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
        <div className="flex justify-center">
          <Button onClick={captureAndDetect} className="bg-green-600 hover:bg-green-700">
            Detect Chips
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
