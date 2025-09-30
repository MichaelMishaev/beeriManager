import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils/cn"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-[#00509d] via-[#003f88] to-[#00296b] text-white rounded-[1.25rem] shadow-lg shadow-[#00509d]/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#00509d]/40 active:translate-y-0",
        modern: "bg-gradient-to-r from-[#00509d] via-[#003f88] to-[#00296b] text-white rounded-[1.25rem] shadow-lg shadow-[#00509d]/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#00509d]/40 active:translate-y-0",
        accent: "bg-gradient-to-r from-[#ffd500] to-[#fdc500] text-[#00296b] rounded-[1.25rem] shadow-lg shadow-[#fdc500]/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#fdc500]/40 active:translate-y-0",
        glass: "bg-white/90 backdrop-blur-lg border-2 border-[#00509d]/20 text-[#00296b] rounded-[1.25rem] shadow-md hover:bg-[#00509d]/10 hover:border-[#00509d] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#00509d]/20 active:translate-y-0",
        destructive:
          "bg-error text-white rounded-[1.25rem] shadow-lg hover:bg-error-600 hover:-translate-y-1 hover:shadow-xl",
        outline:
          "border-2 border-primary/20 bg-background rounded-[1.25rem] hover:bg-primary/10 hover:border-primary hover:-translate-y-0.5",
        secondary:
          "bg-secondary text-secondary-foreground rounded-[1.25rem] hover:bg-secondary/80 hover:-translate-y-0.5",
        ghost: "hover:bg-accent/10 hover:text-accent-foreground rounded-lg",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "px-10 py-4 text-base",
        sm: "px-6 py-3 text-sm",
        lg: "px-12 py-5 text-lg",
        xl: "px-16 py-6 text-xl",
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