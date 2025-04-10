"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { Input } from "@/components/ui/input"

interface CurrencyInputProps {
  value: number
  onChange: (value: number) => void
  className?: string
  readOnly?: boolean
}

export function CurrencyInput({ value, onChange, className = "", readOnly = false }: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState("0.00")

  // Convert numeric value to display string on initial render and when value prop changes
  useEffect(() => {
    // Handle negative values
    if (value < 0) {
      setDisplayValue(`-${Math.abs(value).toFixed(2)}`)
    } else {
      setDisplayValue(value.toFixed(2))
    }
  }, [value])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow only numbers, backspace, delete, tab, arrows, and minus sign
    if (
      !/^\d$/.test(e.key) &&
      e.key !== "Backspace" &&
      e.key !== "Delete" &&
      e.key !== "Tab" &&
      e.key !== "ArrowLeft" &&
      e.key !== "ArrowRight" &&
      e.key !== "-"
    ) {
      e.preventDefault()
      return
    }

    // Handle minus sign for negative values
    if (e.key === "-") {
      e.preventDefault()
      const isNegative = displayValue.startsWith("-")
      if (isNegative) {
        // Remove the minus sign
        const positiveValue = displayValue.substring(1)
        setDisplayValue(positiveValue)
        onChange(Number.parseFloat(positiveValue))
      } else {
        // Add the minus sign
        const negativeValue = `-${displayValue}`
        setDisplayValue(negativeValue)
        onChange(-Math.abs(Number.parseFloat(displayValue)))
      }
      return
    }

    // Handle numeric input with right-to-left behavior
    if (/^\d$/.test(e.key)) {
      e.preventDefault()

      // Preserve negative sign if present
      const isNegative = displayValue.startsWith("-")
      const prefix = isNegative ? "-" : ""

      // Remove non-numeric characters and the negative sign if present
      const numericValue = displayValue.replace(/[^\d]/g, "")

      // Shift left and add new digit on the right
      const newNumericValue = numericValue + e.key

      // Format with 2 decimal places
      const dollars = Number.parseInt(newNumericValue.slice(0, -2) || "0", 10)
      const cents = newNumericValue.slice(-2).padStart(2, "0")

      const formattedValue = `${prefix}${dollars}.${cents}`
      setDisplayValue(formattedValue)

      // Convert to number and call onChange
      const numericResult = Number.parseFloat(formattedValue)
      onChange(numericResult)
    }

    // Handle backspace - remove rightmost digit
    if (e.key === "Backspace") {
      e.preventDefault()

      // Preserve negative sign if present
      const isNegative = displayValue.startsWith("-")
      const prefix = isNegative ? "-" : ""

      // Remove non-numeric characters and the negative sign if present
      const numericValue = displayValue.replace(/[^\d]/g, "")

      if (numericValue.length <= 1) {
        // If only one digit, set to 0
        setDisplayValue(`${prefix}0.00`)
        onChange(isNegative ? -0 : 0)
      } else {
        // Remove rightmost digit
        const newNumericValue = numericValue.slice(0, -1)

        // Format with 2 decimal places
        const dollars = Number.parseInt(newNumericValue.slice(0, -2) || "0", 10)
        const cents = newNumericValue.slice(-2).padStart(2, "0")

        const formattedValue = `${prefix}${dollars}.${cents}`
        setDisplayValue(formattedValue)

        // Convert to number and call onChange
        const numericResult = Number.parseFloat(formattedValue)
        onChange(numericResult)
      }
    }
  }

  return (
    <Input
      type="text"
      value={displayValue}
      onKeyDown={handleKeyDown}
      onChange={(e) => {
        // Allow direct editing for paste operations and other input methods
        // This ensures the input is editable, but keyboard input is still handled by onKeyDown
        if (
          e.nativeEvent.inputType === "insertFromPaste" ||
          e.nativeEvent.inputType === "insertFromDrop" ||
          e.nativeEvent.inputType === "insertReplacementText"
        ) {
          const input = e.target.value.replace(/[^\d.-]/g, "")
          const numericValue = Number.parseFloat(input)
          if (!isNaN(numericValue)) {
            setDisplayValue(numericValue.toFixed(2))
            onChange(numericValue)
          }
        }
      }}
      className={`text-center ${className} ${displayValue.startsWith("-") ? "text-red-600" : ""}`}
      placeholder="0.00"
      disabled={readOnly}
    />
  )
}
