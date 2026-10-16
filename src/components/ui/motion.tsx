'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { animate, motion, useInView, useReducedMotion } from 'framer-motion'

// Shared easing: fast start, soft landing (iOS-like "ease-out-expo")
export const EASE_OUT = [0.16, 1, 0.3, 1] as const

/**
 * Fades + lifts its children into view the first time they scroll on screen.
 * `delay` lets siblings cascade without a parent stagger container.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 16,
  id,
}: {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
  id?: string
}) {
  return (
    <motion.div
      id={id}
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  )
}

/**
 * Counts from 0 to `value` once visible. Writes to the DOM directly so the
 * number ticks without re-rendering React every frame.
 */
export function CountUp({
  value,
  duration = 1.2,
  className,
}: {
  value: number
  duration?: number
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-20px' })
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const node = ref.current
    if (!node || !inView) return
    if (reduceMotion) {
      node.textContent = value.toLocaleString()
      return
    }
    const controls = animate(0, value, {
      duration,
      ease: EASE_OUT,
      onUpdate: (latest) => {
        node.textContent = Math.round(latest).toLocaleString()
      },
    })
    return () => controls.stop()
  }, [inView, value, duration, reduceMotion])

  // Starts at 0 to avoid a final→0→final flash; aria-label keeps the real value for screen readers
  return (
    <span
      ref={ref}
      className={className}
      style={{ fontVariantNumeric: 'tabular-nums' }}
      aria-label={value.toLocaleString()}
    >
      0
    </span>
  )
}
