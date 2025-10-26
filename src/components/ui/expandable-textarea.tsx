'use client'

import * as React from "react"
import { cn } from "@/lib/utils"
import { Maximize2, Minimize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export interface ExpandableTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
  variant?: 'default' | 'modern' | 'glass'
  label?: string
  showExpandButton?: boolean
  minRows?: number
  maxRows?: number
}

/**
 * ExpandableTextarea - A textarea that auto-expands with content and supports fullscreen mode on mobile
 *
 * Features:
 * - Auto-grows with content (no scrolling inside textarea)
 * - Expand button for fullscreen editing on mobile
 * - Configurable min/max rows
 * - All standard textarea props supported
 */
const ExpandableTextarea = React.forwardRef<HTMLTextAreaElement, ExpandableTextareaProps>(
  ({
    className,
    error,
    variant = 'default',
    label,
    showExpandButton = true,
    minRows = 4,
    maxRows = 20,
    value,
    onChange,
    ...props
  }, ref) => {
    const [isExpanded, setIsExpanded] = React.useState(false)
    const [internalValue, setInternalValue] = React.useState(value || '')
    const textareaRef = React.useRef<HTMLTextAreaElement>(null)
    const expandedTextareaRef = React.useRef<HTMLTextAreaElement>(null)

    // Sync internal value with prop value
    React.useEffect(() => {
      setInternalValue(value || '')
    }, [value])

    // Auto-resize function
    const autoResize = React.useCallback((element: HTMLTextAreaElement) => {
      if (!element) return

      // Reset height to recalculate
      element.style.height = 'auto'

      // Calculate new height based on scrollHeight
      const lineHeight = parseInt(window.getComputedStyle(element).lineHeight)
      const minHeight = lineHeight * minRows
      const maxHeight = lineHeight * maxRows

      let newHeight = element.scrollHeight

      // Constrain to min/max
      newHeight = Math.max(minHeight, newHeight)
      newHeight = Math.min(maxHeight, newHeight)

      element.style.height = `${newHeight}px`
    }, [minRows, maxRows])

    // Auto-resize on value change
    React.useEffect(() => {
      if (textareaRef.current) {
        autoResize(textareaRef.current)
      }
      if (expandedTextareaRef.current) {
        autoResize(expandedTextareaRef.current)
      }
    }, [internalValue, autoResize])

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value
      setInternalValue(newValue)
      if (onChange) {
        onChange(e)
      }
    }

    const handleExpandedChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value
      setInternalValue(newValue)

      // Create synthetic event for the original textarea
      if (onChange && textareaRef.current) {
        const syntheticEvent = {
          ...e,
          target: textareaRef.current,
          currentTarget: textareaRef.current,
        }
        onChange(syntheticEvent as React.ChangeEvent<HTMLTextAreaElement>)
      }
    }

    const baseClassName = cn(
      "flex w-full text-right ring-offset-background placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 overflow-hidden",
      variant === 'default' && "rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      variant === 'modern' && "rounded-2xl border-2 border-primary/10 bg-white/90 backdrop-blur-sm px-6 py-4 text-base font-medium shadow-md transition-all duration-300 hover:border-primary/30 hover:shadow-lg focus:outline-none focus:border-primary focus:shadow-xl focus:shadow-primary/20 focus:-translate-y-0.5",
      variant === 'glass' && "rounded-2xl border-2 border-primary/10 bg-white/80 backdrop-blur-lg px-6 py-4 text-base font-medium shadow-lg transition-all duration-300 hover:border-primary/30 focus:outline-none focus:border-primary focus:shadow-xl focus:shadow-primary/10 focus:-translate-y-1",
      error && "border-error focus-visible:ring-error animate-[input-error_0.5s_ease]",
    )

    return (
      <>
        {/* Main textarea with expand button */}
        <div className="relative w-full">
          <textarea
            ref={(node) => {
              // Set internal ref
              if (textareaRef) {
                (textareaRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = node
              }
              // Forward ref if provided
              if (typeof ref === 'function') {
                ref(node)
              } else if (ref) {
                (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node
              }
            }}
            className={cn(baseClassName, "resize-none", className)}
            value={internalValue}
            onChange={handleChange}
            dir="rtl"
            style={{ minHeight: `${minRows * 1.5}rem` }}
            {...props}
          />

          {/* Expand button - only show on mobile/tablet */}
          {showExpandButton && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="absolute left-2 top-2 h-8 w-8 p-0 shadow-md md:hidden"
              onClick={() => setIsExpanded(true)}
              title="הרחב לעריכה מלאה"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Fullscreen Dialog for mobile editing */}
        <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
          <DialogContent
            className="h-[90vh] max-w-full w-full m-4 flex flex-col"
            onOpenAutoFocus={(e) => {
              e.preventDefault()
              // Focus the textarea after dialog opens
              setTimeout(() => expandedTextareaRef.current?.focus(), 100)
            }}
          >
            <DialogHeader className="flex-shrink-0">
              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                  className="gap-2"
                >
                  <Minimize2 className="h-4 w-4" />
                  סגור
                </Button>
                <DialogTitle className="text-right">
                  {label || 'עריכת טקסט'}
                </DialogTitle>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-hidden">
              <textarea
                ref={expandedTextareaRef}
                className={cn(
                  baseClassName,
                  "h-full w-full resize-none text-base",
                  className
                )}
                value={internalValue}
                onChange={handleExpandedChange}
                dir="rtl"
                placeholder={props.placeholder}
                autoFocus
              />
            </div>
          </DialogContent>
        </Dialog>
      </>
    )
  }
)

ExpandableTextarea.displayName = "ExpandableTextarea"

export { ExpandableTextarea }
