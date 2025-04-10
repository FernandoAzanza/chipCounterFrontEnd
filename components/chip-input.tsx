"use client"

import type React from "react"

import { ChipIcon } from "./chip-icon"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CurrencyInput } from "./currency-input"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

type ChipColor = "red" | "green" | "blue" | "white" | "black"

interface ChipInputProps {
  color: ChipColor
  label?: string
  count?: number
  value?: number
  onCountChange?: (count: number) => void
  onValueChange?: (value: number) => void
  onRemove?: () => void
  readOnly?: boolean
  showValue?: boolean
  showCount?: boolean
  showRemoveButton?: boolean
}

export function ChipInput({
  color,
  label,
  count = 0,
  value = 0,
  onCountChange,
  onValueChange,
  onRemove,
  readOnly = false,
  showValue = true,
  showCount = true,
  showRemoveButton = false,
}: ChipInputProps) {
  const totalValue = count * value

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2 w-1/2 justify-center">
        <ChipIcon color={color} />
        {showCount && (
          <div className="flex flex-col items-center">
            {label && <Label className="text-xs text-gray-500">{label}</Label>}
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={count}
              onChange={(e) => {
                const inputValue = e.target.value
                const newCount = inputValue === "" ? 0 : Number.parseInt(inputValue, 10)

                if (!isNaN(newCount) && onCountChange) {
                  onCountChange(newCount)
                }
              }}
              className="w-16 text-center"
              readOnly={readOnly}
            />
          </div>
        )}
      </div>

      {showValue && (
        <div className="flex items-center w-1/2 justify-center">
          <span className="mr-1 text-gray-500">$</span>
          <CurrencyInput
            value={value}
            onChange={onValueChange || (() => {})}
            className="w-20"
            readOnly={readOnly}
          />
        </div>
      )}

      {!showValue && !readOnly && (
        <div className="flex flex-col items-center">
          <Label className="text-xs text-gray-500">Total $</Label>
          <div className="w-20 h-10 flex items-center justify-center border rounded-md bg-gray-50">
            ${totalValue.toFixed(2)}
          </div>
        </div>
      )}

      {showRemoveButton && onRemove && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="ml-auto h-8 w-8 text-gray-500 hover:text-red-500"
          aria-label={`Remove ${color} chip`}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
