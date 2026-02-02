import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:-translate-y-px active:translate-y-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg shadow-red-500/20 hover:shadow-red-500/30",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // Themed variants
        blue: "bg-blue-500 text-white hover:bg-blue-500/90 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30",
        green: "bg-green-500 text-white hover:bg-green-500/90 shadow-lg shadow-green-500/20 hover:shadow-green-500/30",
        yellow: "bg-yellow-500 text-black hover:bg-yellow-500/90 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30",
        purple: "bg-purple-500 text-white hover:bg-purple-500/90 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30",
        pink: "bg-pink-500 text-white hover:bg-pink-500/90 shadow-lg shadow-pink-500/20 hover:shadow-pink-500/30",
        indigo: "bg-indigo-500 text-white hover:bg-indigo-500/90 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30",
        red: "bg-red-500 text-white hover:bg-red-500/90 shadow-lg shadow-red-500/20 hover:shadow-red-500/30",
        cyan: "bg-cyan-500 text-white hover:bg-cyan-500/90 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30",
        orange: "bg-orange-500 text-white hover:bg-orange-500/90 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

    