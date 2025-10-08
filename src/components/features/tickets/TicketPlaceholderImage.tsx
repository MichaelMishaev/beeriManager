import { Ticket as TicketIcon } from 'lucide-react'

interface TicketPlaceholderImageProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function TicketPlaceholderImage({ size = 'md', className = '' }: TicketPlaceholderImageProps) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-48 h-48',
    lg: 'w-full h-64'
  }

  const iconSizes = {
    sm: 'h-8 w-8',
    md: 'h-16 w-16',
    lg: 'h-24 w-24'
  }

  return (
    <div className={`${sizeClasses[size]} ${className} rounded-lg bg-gradient-to-br from-[#FF8200]/10 to-[#FFBA00]/10 flex items-center justify-center relative overflow-hidden`}>
      {/* Subtle background circles */}
      <div className="absolute inset-0 opacity-[0.03]">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <circle cx="100" cy="50" r="60" fill="currentColor" className="text-[#FF8200]" />
          <circle cx="100" cy="150" r="60" fill="currentColor" className="text-[#FFBA00]" />
        </svg>
      </div>

      {/* Main ticket icon */}
      <div className="relative z-10 flex flex-col items-center">
        <TicketIcon className={`${iconSizes[size]} text-[#FF8200]/30`} />
        {size !== 'sm' && (
          <div className="text-[#FF8200]/40 text-sm font-semibold mt-2">
            כרטיס
          </div>
        )}
      </div>
    </div>
  )
}
