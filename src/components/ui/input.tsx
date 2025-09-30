import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
  variant?: 'default' | 'modern' | 'glass'
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, variant = 'default', ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex w-full text-right ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          variant === 'default' && "h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          variant === 'modern' && "rounded-2xl border-2 border-primary/10 bg-white/90 backdrop-blur-sm px-6 py-4 text-base font-medium shadow-md transition-all duration-300 hover:border-primary/30 hover:shadow-lg focus:outline-none focus:border-primary focus:shadow-xl focus:shadow-primary/20 focus:-translate-y-0.5",
          variant === 'glass' && "rounded-2xl border-2 border-primary/10 bg-white/80 backdrop-blur-lg px-6 py-4 text-base font-medium shadow-lg transition-all duration-300 hover:border-primary/30 focus:outline-none focus:border-primary focus:shadow-xl focus:shadow-primary/10 focus:-translate-y-1",
          error && "border-error focus-visible:ring-error animate-[input-error_0.5s_ease]",
          className
        )}
        ref={ref}
        dir="rtl"
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }