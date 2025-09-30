import * as React from "react"
import { cn } from "@/lib/utils/cn"
import { Check } from "lucide-react"

export interface Step {
  id: string
  label: string
  description?: string
}

export interface StepIndicatorProps {
  steps: Step[]
  currentStep: number
  className?: string
}

export function StepIndicator({ steps, currentStep, className }: StepIndicatorProps) {
  return (
    <div className={cn("flex items-center justify-center gap-4 mb-12", className)}>
      {steps.map((step, index) => {
        const stepNumber = index + 1
        const isCompleted = stepNumber < currentStep
        const isCurrent = stepNumber === currentStep
        const isUpcoming = stepNumber > currentStep

        return (
          <React.Fragment key={step.id}>
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all duration-300 border-2",
                  isCompleted &&
                    "bg-gradient-to-br from-success to-success-600 text-white border-success shadow-lg",
                  isCurrent &&
                    "bg-gradient-to-br from-primary via-primary-600 to-primary-700 text-white border-primary shadow-lg shadow-primary/30 scale-110",
                  isUpcoming &&
                    "bg-white/80 backdrop-blur-sm text-royal-blue-400 border-primary/20"
                )}
              >
                {isCompleted ? (
                  <Check className="w-6 h-6" />
                ) : (
                  <span className="text-lg">{stepNumber}</span>
                )}
              </div>
              {/* Step Label */}
              <div className="mt-3 text-center">
                <div
                  className={cn(
                    "text-sm font-semibold",
                    isCurrent && "text-primary-700",
                    isCompleted && "text-success-700",
                    isUpcoming && "text-gray-500"
                  )}
                >
                  {step.label}
                </div>
                {step.description && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {step.description}
                  </div>
                )}
              </div>
            </div>

            {/* Connecting Line */}
            {index < steps.length - 1 && (
              <div className="flex-1 h-0.5 -mt-8 mx-2">
                <div
                  className={cn(
                    "h-full transition-all duration-300",
                    stepNumber < currentStep
                      ? "bg-gradient-to-l from-success to-success-600"
                      : "bg-primary/20"
                  )}
                />
              </div>
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

export default StepIndicator