// components/ui/slider.tsx
'use client'
import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps {
  value: number[]
  onValueChange: (value: number[]) => void
  max: number
  min: number
  step: number
  className?: string
}

export function Slider({ value, onValueChange, max, min, step, className }: SliderProps) {
  return (
    <div className={cn("relative w-full", className)}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value[0]}
        onChange={(e) => onValueChange([parseInt(e.target.value), value[1]])}
        className="absolute w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value[1]}
        onChange={(e) => onValueChange([value[0], parseInt(e.target.value)])}
        className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer"
      />
    </div>
  )
}
