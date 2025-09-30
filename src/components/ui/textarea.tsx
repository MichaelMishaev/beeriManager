import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
  variant?: 'default' | 'modern' | 'glass'
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, variant = 'default', ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex w-full text-right ring-offset-background placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 resize-none",
          variant === 'default' && "min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          variant === 'modern' && "min-h-[120px] rounded-2xl border-2 border-primary/10 bg-white/90 backdrop-blur-sm px-6 py-4 text-base font-medium shadow-md transition-all duration-300 hover:border-primary/30 hover:shadow-lg focus:outline-none focus:border-primary focus:shadow-xl focus:shadow-primary/20 focus:-translate-y-0.5",
          variant === 'glass' && "min-h-[120px] rounded-2xl border-2 border-primary/10 bg-white/80 backdrop-blur-lg px-6 py-4 text-base font-medium shadow-lg transition-all duration-300 hover:border-primary/30 focus:outline-none focus:border-primary focus:shadow-xl focus:shadow-primary/10 focus:-translate-y-1",
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
Textarea.displayName = "Textarea"

export { Textarea }