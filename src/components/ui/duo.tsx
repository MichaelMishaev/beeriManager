import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'

/**
 * Duolingo-style "chunky" UI primitives.
 * The 3D edge is a solid box-shadow (not a border) so pressing can collapse it
 * with translateY without shifting surrounding layout.
 */

// Flat card: 2px outline + thicker solid bottom edge, no blur shadow
export const duoCard = 'bg-white border-2 border-[#e5e5e5] rounded-2xl shadow-[0_4px_0_#e5e5e5]'

// Add to tappable cards: sinks 2px onto its edge while pressed
export const duoPress =
  'transition-[transform,box-shadow,border-color] duration-75 hover:border-[#cfd8dc] active:translate-y-[2px] active:shadow-[0_2px_0_#e5e5e5]'

const variants = {
  // #087A96 = brand blue-green darkened to pass 4.5:1 with white text
  teal: 'bg-[#087A96] text-white shadow-[0_4px_0_#05586d]',
  navy: 'bg-[#003153] text-white shadow-[0_4px_0_#001421]',
  yellow: 'bg-[#FFBA00] text-[#003153] shadow-[0_4px_0_#c98f00]',
  white: 'bg-white text-[#087A96] border-2 border-[#e5e5e5] shadow-[0_4px_0_#e5e5e5]',
} as const

// Solid tile colors. `fg` is picked per tone so icons keep ≥3:1 contrast (WCAG non-text).
export const duoTones = {
  teal: { bg: '#0D98BA', edge: '#08718b', fg: 'text-white' },
  navy: { bg: '#003153', edge: '#001421', fg: 'text-white' },
  yellow: { bg: '#FFBA00', edge: '#c98f00', fg: 'text-[#003153]' },
  orange: { bg: '#FF8200', edge: '#c25e00', fg: 'text-[#003153]' },
  green: { bg: '#16a34a', edge: '#116b32', fg: 'text-white' },
  purple: { bg: '#8b5cf6', edge: '#6d28d9', fg: 'text-white' },
} as const
export type DuoTone = keyof typeof duoTones

const tileSizes = {
  sm: { box: 'w-9 h-9 rounded-lg', icon: 'h-5 w-5' },
  md: { box: 'w-11 h-11 rounded-xl', icon: 'h-6 w-6' },
  lg: { box: 'w-14 h-14 rounded-2xl', icon: 'h-7 w-7' },
} as const

/** Solid colored icon square sitting on a darker 3D edge (Duolingo's icon style). */
export function DuoIconTile({
  icon: Icon,
  tone = 'teal',
  size = 'md',
  className,
}: {
  icon: React.ElementType
  tone?: DuoTone
  size?: keyof typeof tileSizes
  className?: string
}) {
  const t = duoTones[tone]
  const s = tileSizes[size]
  return (
    <span
      aria-hidden
      className={cn('inline-flex flex-shrink-0 items-center justify-center', s.box, className)}
      style={{ backgroundColor: t.bg, boxShadow: `0 3px 0 ${t.edge}` }}
    >
      <Icon className={cn(s.icon, t.fg)} strokeWidth={2.5} />
    </span>
  )
}

// Tags carry text, so they need ≥4.5:1 — darker fills than the icon tiles above
const tagTones = {
  green: { bg: '#15803d', edge: '#0f5c2c', fg: 'text-white' },
  yellow: { bg: '#FFBA00', edge: '#c98f00', fg: 'text-[#003153]' },
  navy: { bg: '#003153', edge: '#001421', fg: 'text-white' },
  red: { bg: '#dc2626', edge: '#991b1b', fg: 'text-white' },
} as const

/** Small solid tag with a 2px edge, e.g. price / "free" / status. */
export function DuoTag({ tone = 'green', className, children }: { tone?: keyof typeof tagTones; className?: string; children: React.ReactNode }) {
  const t = tagTones[tone]
  return (
    <span
      className={cn('inline-flex items-center rounded-lg px-2.5 py-0.5 text-sm font-extrabold tracking-wide', t.fg, className)}
      style={{ backgroundColor: t.bg, boxShadow: `0 2px 0 ${t.edge}` }}
    >
      {children}
    </span>
  )
}

export interface DuoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants
  asChild?: boolean
}

export const DuoButton = React.forwardRef<HTMLButtonElement, DuoButtonProps>(
  ({ variant = 'teal', asChild = false, className, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 rounded-2xl',
          'text-sm md:text-base font-extrabold tracking-wide select-none',
          'transition-[transform,box-shadow,filter] duration-75',
          'hover:brightness-105 active:translate-y-1 active:shadow-none',
          'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0D98BA]/30',
          'disabled:opacity-50 disabled:pointer-events-none',
          variants[variant],
          className
        )}
        {...props}
      />
    )
  }
)
DuoButton.displayName = 'DuoButton'
