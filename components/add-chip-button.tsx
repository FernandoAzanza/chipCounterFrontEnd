"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChipIcon } from "./chip-icon"

type ChipColor = "red" | "green" | "blue" | "white" | "black"

interface AddChipButtonProps {
  availableColors: ChipColor[]
  onAddChip: (color: ChipColor) => void
}

export function AddChipButton({ availableColors, onAddChip }: AddChipButtonProps) {
  if (availableColors.length === 0) return null

  const colorNames: Record<ChipColor, string> = {
    red: "Red",
    green: "Green",
    blue: "Blue",
    white: "White",
    black: "Black",
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full mt-2">
          <Plus className="mr-2 h-4 w-4" />
          Add Chip Color
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center">
        {availableColors.map((color) => (
          <DropdownMenuItem key={color} onClick={() => onAddChip(color)}>
            <div className="flex items-center">
              <ChipIcon color={color} className="h-6 w-6 mr-2" />
              <span>{colorNames[color]}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
