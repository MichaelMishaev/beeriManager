"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  variant?: 'default' | 'modern' | 'gradient'
  showValue?: boolean
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, variant = 'default', showValue = false, ...props }, ref) => (
  <div className="w-full">
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative overflow-hidden",
        variant === 'default' && "h-3 rounded-full bg-primary/10",
        variant === 'modern' && "h-4 rounded-2xl bg-primary/10 shadow-inner",
        variant === 'gradient' && "h-5 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 shadow-lg",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          "h-full w-full flex-1 transition-all duration-500 ease-out relative overflow-hidden",
          variant === 'default' && "bg-primary rounded-full",
          variant === 'modern' && "bg-gradient-to-r from-primary via-primary-600 to-primary-700 rounded-2xl",
          variant === 'gradient' && "bg-gradient-to-r from-primary via-primary-600 to-primary-700 rounded-2xl"
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      >
        {/* Shimmer Effect */}
        {(variant === 'modern' || variant === 'gradient') && (
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            style={{
              animation: 'shimmer 2s infinite'
            }}
          />
        )}
      </ProgressPrimitive.Indicator>
    </ProgressPrimitive.Root>
    {showValue && (
      <div className="text-xs text-right text-muted-foreground mt-2 font-medium">
        {value}%
      </div>
    )}
  </div>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }