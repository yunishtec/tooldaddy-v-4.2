"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const sliderVariants = cva(
  "relative flex w-full touch-none select-none items-center",
  {
    variants: {
      variant: {
        default: "[&_.range]:bg-primary [&_.thumb]:border-primary",
        blue: "[&_.range]:bg-blue-500 [&_.thumb]:border-blue-500",
        green: "[&_.range]:bg-green-500 [&_.thumb]:border-green-500",
        yellow: "[&_.range]:bg-yellow-500 [&_.thumb]:border-yellow-500",
        purple: "[&_.range]:bg-purple-500 [&_.thumb]:border-purple-500",
        pink: "[&_.range]:bg-pink-500 [&_.thumb]:border-pink-500",
        indigo: "[&_.range]:bg-indigo-500 [&_.thumb]:border-indigo-500",
        red: "[&_.range]:bg-red-500 [&_.thumb]:border-red-500",
        cyan: "[&_.range]:bg-cyan-500 [&_.thumb]:border-cyan-500",
        orange: "[&_.range]:bg-orange-500 [&_.thumb]:border-orange-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & VariantProps<typeof sliderVariants>
>(({ className, variant, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(sliderVariants({ variant, className }))}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
      <SliderPrimitive.Range className="range absolute h-full" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="thumb block h-5 w-5 rounded-full border-2 bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
