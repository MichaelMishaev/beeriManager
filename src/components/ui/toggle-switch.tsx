"use client"

import * as React from "react"
import { cn } from "@/lib/utils/cn"

export interface ToggleSwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  description?: string
  variant?: 'default' | 'modern' | 'glass'
}

const ToggleSwitch = React.forwardRef<HTMLInputElement, ToggleSwitchProps>(
  ({ className, label, description, variant = 'default', ...props }, ref) => {
    const id = React.useId()
    const inputId = props.id || `toggle-${id}`

    return (
      <div className={cn("flex items-center justify-between gap-4", className)}>
        {(label || description) && (
          <div className="flex-1 text-right">
            {label && (
              <label
                htmlFor={inputId}
                className="text-sm font-semibold text-royal-blue-700 cursor-pointer"
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-xs text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
        )}
        <label
          htmlFor={inputId}
          className={cn(
            "relative inline-block cursor-pointer",
            variant === 'default' && "w-11 h-6",
            variant === 'modern' && "w-14 h-7",
            variant === 'glass' && "w-16 h-8"
          )}
        >
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            className="sr-only peer"
            {...props}
          />
          <div
            className={cn(
              "absolute inset-0 rounded-full transition-all duration-300",
              variant === 'default' && "bg-gray-300 peer-checked:bg-primary",
              variant === 'modern' && "bg-gradient-to-r from-gray-200 to-gray-300 peer-checked:from-primary peer-checked:to-primary-700 shadow-inner",
              variant === 'glass' && "bg-white/60 backdrop-blur-md border-2 border-primary/20 peer-checked:bg-primary/20 peer-checked:border-primary shadow-lg"
            )}
          />
          <div
            className={cn(
              "absolute top-0.5 rounded-full bg-white transition-all duration-300 shadow-md peer-checked:shadow-lg",
              variant === 'default' && "left-0.5 w-5 h-5 peer-checked:translate-x-5",
              variant === 'modern' && "left-0.5 w-6 h-6 peer-checked:translate-x-7 shadow-xl",
              variant === 'glass' && "left-1 w-6 h-6 peer-checked:translate-x-8 backdrop-blur-sm bg-gradient-to-br from-white to-gray-50 shadow-2xl peer-checked:from-primary peer-checked:to-primary-700"
            )}
          />
        </label>
      </div>
    )
  }
)

ToggleSwitch.displayName = "ToggleSwitch"

export { ToggleSwitch }