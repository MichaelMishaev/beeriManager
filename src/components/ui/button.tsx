import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils/cn"

const buttonVariants = cva(
  // Duolingo-style: the 3D edge is a solid box-shadow that collapses on press (no layout shift)
  "inline-flex items-center justify-center whitespace-nowrap font-bold tracking-wide select-none transition-[transform,box-shadow,filter,background-color,border-color] duration-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0D98BA]/30 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[#00509d] text-white rounded-2xl shadow-[0_4px_0_#00296b] hover:brightness-110 active:translate-y-1 active:shadow-none",
        modern: "bg-[#00509d] text-white rounded-2xl shadow-[0_4px_0_#00296b] hover:brightness-110 active:translate-y-1 active:shadow-none",
        accent: "bg-[#FFBA00] text-[#00296b] rounded-2xl shadow-[0_4px_0_#c98f00] hover:brightness-105 active:translate-y-1 active:shadow-none",
        glass: "bg-white border-2 border-[#e5e5e5] text-[#00296b] rounded-2xl shadow-[0_4px_0_#e5e5e5] hover:bg-[#f7f7f7] active:translate-y-1 active:shadow-none",
        destructive:
          "bg-[#dc2626] text-white rounded-2xl shadow-[0_4px_0_#991b1b] hover:brightness-110 active:translate-y-1 active:shadow-none",
        outline:
          "border-2 border-[#e5e5e5] bg-white text-[#00509d] rounded-2xl shadow-[0_4px_0_#e5e5e5] hover:bg-[#f7f7f7] active:translate-y-1 active:shadow-none",
        secondary:
          "bg-secondary text-secondary-foreground rounded-2xl shadow-[0_4px_0_rgba(0,0,0,0.12)] hover:brightness-95 active:translate-y-1 active:shadow-none",
        ghost: "hover:bg-[#f0f4f7] rounded-xl active:scale-95",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "px-4 py-2.5 text-sm md:px-10 md:py-4 md:text-base",
        sm: "px-3 py-2 text-xs md:px-6 md:py-3 md:text-sm",
        lg: "px-6 py-3 text-base md:px-12 md:py-5 md:text-lg",
        xl: "px-8 py-4 text-lg md:px-16 md:py-6 md:text-xl",
        icon: "h-11 w-11",
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