"use client"

import { useEffect, useRef, useState } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { Button } from "@/components/ui/button"
import { X, RefreshCw } from "lucide-react"
import { QRScannerFallback } from "./qr-scanner-fallback"

interface QRScannerProps {
  onScan: (data: string) => void
  onClose: () => void
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const scannerRef = useRef<HTMLDivElement>(null)
  const [isFrontCamera, setIsFrontCamera] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [scanner, setScanner] = useState<Html5Qrcode | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const devices = await Html5Qrcode.getCameras()
        if (devices.length === 0) throw new Error("No camera found")

        setHasPermission(true)
        const cameraId = isFrontCamera
          ? devices.find((d) => d.label.toLowerCase().includes("front"))?.id || devices[0].id
          : devices.find((d) => d.label.toLowerCase().includes("back"))?.id || devices[0].id

        const qr = new Html5Qrcode("qr-reader")
        await qr.start(
          cameraId,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            qr.stop()
            onScan(decodedText)
          },
          (err) => {
            // Scan error, ignore
          }
        )
        setScanner(qr)
      } catch (err: any) {
        console.error(err)
        setError("Unable to access camera")
        setHasPermission(false)
      }
    }

    checkPermissions()

    return () => {
      scanner?.stop().catch(() => {})
    }
  }, [isFrontCamera])

  const handleSimulateScan = () => {
    onScan("demo123")
  }

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="relative bg-black rounded-lg overflow-hidden">
        {hasPermission === false && (
          <QRScannerFallback onSimulateScan={handleSimulateScan} onClose={onClose} />
        )}

        <div id="qr-reader" ref={scannerRef} style={{ width: "100%", height: 300 }} />

        {hasPermission === null && (
          <div className="h-64 flex items-center justify-center bg-gray-100">
            <p className="text-gray-500">Requesting camera permission...</p>
          </div>
        )}

        <div className="absolute top-2 right-2 flex gap-2">
          <Button variant="outline" size="icon" className="bg-white/80 hover:bg-white" onClick={() => setIsFrontCamera((prev) => !prev)}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="bg-white/80 hover:bg-white" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mt-4 text-center text-sm text-gray-500">
        <p>Position the QR code within the frame to scan</p>
      </div>
    </div>
  )
}
