type ChipColor = "red" | "green" | "blue" | "white" | "black"

interface ChipIconProps {
  color: ChipColor
  className?: string
}

export function ChipIcon({ color, className = "" }: ChipIconProps) {
  return (
    <div className={`relative w-10 h-10 rounded-full flex items-center justify-center chip-${color} ${className}`}>
      <div className="absolute inset-0 rounded-full border-2 opacity-70"></div>
      <div className="absolute w-6 h-6 rounded-full border border-dashed border-opacity-50 bg-transparent"></div>
    </div>
  )
}
