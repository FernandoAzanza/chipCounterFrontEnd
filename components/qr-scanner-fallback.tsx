"use client"

import { Button } from "@/components/ui/button"

interface QRScannerFallbackProps {
  onSimulateScan: () => void
  onClose: () => void
}

export function QRScannerFallback({ onSimulateScan, onClose }: QRScannerFallbackProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-gray-200 w-64 h-64 flex items-center justify-center rounded-md">
        <p className="text-gray-500 text-center p-4">
          Camera access is not available in this environment.
          <br />
          <br />
          In a real device, this would open your camera to scan a QR code.
        </p>
      </div>
      <div className="flex gap-2 mt-4">
        <Button onClick={onSimulateScan}>Simulate Scan</Button>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
