"use client"
import { Label } from "@/components/ui/label"
import { CurrencyInput } from "./currency-input"
import { Card, CardContent } from "@/components/ui/card"

interface BuyInInputProps {
  value: number
  onChange: (value: number) => void
}

export function BuyInInput({ value, onChange }: BuyInInputProps) {
  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="buy-in" className="text-base font-medium">
            Buy In Amount:
          </Label>
          <div className="flex items-center">
            <span className="mr-2">$</span>
            <CurrencyInput value={value} onChange={onChange} className="w-24" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
