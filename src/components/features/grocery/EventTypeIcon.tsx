'use client'

import { type EventIconType } from '@/lib/data/event-names'
import {
  PartyPopper,
  GraduationCap,
  Cake,
  Map,
  Umbrella,
  Star,
  Flame,
  Drama,
  TreeDeciduous,
  Wine,
  Flag,
  Users,
  Trophy,
  Music,
  Palette,
  FlaskConical,
  BookOpen,
  UtensilsCrossed,
  Sandwich,
  Gift,
  School,
  Store,
  HandCoins,
  Film,
  Tent,
  Award,
  Wrench,
  Heart,
  Camera,
  DoorOpen,
  DoorClosed,
  Sparkles,
  Calendar,
  type LucideIcon,
} from 'lucide-react'

// Map icon types to lucide-react icons with colors
const ICON_CONFIG: Record<
  EventIconType,
  { icon: LucideIcon; color: string; bgColor: string }
> = {
  party: {
    icon: PartyPopper,
    color: '#f472b6', // pink
    bgColor: '#fce7f3',
  },
  graduation: {
    icon: GraduationCap,
    color: '#3b82f6', // blue
    bgColor: '#dbeafe',
  },
  birthday: {
    icon: Cake,
    color: '#f97316', // orange
    bgColor: '#ffedd5',
  },
  trip: {
    icon: Map,
    color: '#22c55e', // green
    bgColor: '#dcfce7',
  },
  beach: {
    icon: Umbrella,
    color: '#06b6d4', // cyan
    bgColor: '#cffafe',
  },
  holiday: {
    icon: Star,
    color: '#eab308', // yellow
    bgColor: '#fef9c3',
  },
  menorah: {
    icon: Flame,
    color: '#f59e0b', // amber
    bgColor: '#fef3c7',
  },
  purim: {
    icon: Drama,
    color: '#a855f7', // purple
    bgColor: '#f3e8ff',
  },
  tree: {
    icon: TreeDeciduous,
    color: '#16a34a', // green
    bgColor: '#dcfce7',
  },
  passover: {
    icon: Wine,
    color: '#dc2626', // red
    bgColor: '#fee2e2',
  },
  flag: {
    icon: Flag,
    color: '#2563eb', // blue
    bgColor: '#dbeafe',
  },
  candle: {
    icon: Flame,
    color: '#78716c', // gray
    bgColor: '#f5f5f4',
  },
  bonfire: {
    icon: Flame,
    color: '#ea580c', // orange
    bgColor: '#ffedd5',
  },
  meeting: {
    icon: Users,
    color: '#6366f1', // indigo
    bgColor: '#e0e7ff',
  },
  sports: {
    icon: Trophy,
    color: '#ca8a04', // yellow
    bgColor: '#fef9c3',
  },
  theater: {
    icon: Drama,
    color: '#be185d', // pink
    bgColor: '#fce7f3',
  },
  music: {
    icon: Music,
    color: '#7c3aed', // violet
    bgColor: '#ede9fe',
  },
  art: {
    icon: Palette,
    color: '#ec4899', // pink
    bgColor: '#fce7f3',
  },
  science: {
    icon: FlaskConical,
    color: '#0891b2', // cyan
    bgColor: '#cffafe',
  },
  book: {
    icon: BookOpen,
    color: '#9333ea', // purple
    bgColor: '#f3e8ff',
  },
  food: {
    icon: UtensilsCrossed,
    color: '#059669', // emerald
    bgColor: '#d1fae5',
  },
  picnic: {
    icon: Sandwich,
    color: '#65a30d', // lime
    bgColor: '#ecfccb',
  },
  bbq: {
    icon: Flame,
    color: '#dc2626', // red
    bgColor: '#fee2e2',
  },
  cake: {
    icon: Cake,
    color: '#db2777', // pink
    bgColor: '#fce7f3',
  },
  gift: {
    icon: Gift,
    color: '#e11d48', // rose
    bgColor: '#ffe4e6',
  },
  school: {
    icon: School,
    color: '#0284c7', // sky
    bgColor: '#e0f2fe',
  },
  teacher: {
    icon: GraduationCap,
    color: '#4f46e5', // indigo
    bgColor: '#e0e7ff',
  },
  shabbat: {
    icon: Flame,
    color: '#f59e0b', // amber
    bgColor: '#fef3c7',
  },
  fair: {
    icon: Store,
    color: '#8b5cf6', // violet
    bgColor: '#ede9fe',
  },
  fundraiser: {
    icon: HandCoins,
    color: '#16a34a', // green
    bgColor: '#dcfce7',
  },
  movie: {
    icon: Film,
    color: '#64748b', // slate
    bgColor: '#f1f5f9',
  },
  carnival: {
    icon: Tent,
    color: '#f43f5e', // rose
    bgColor: '#ffe4e6',
  },
  talent: {
    icon: Star,
    color: '#d97706', // amber
    bgColor: '#fef3c7',
  },
  awards: {
    icon: Award,
    color: '#ca8a04', // yellow
    bgColor: '#fef9c3',
  },
  workshop: {
    icon: Wrench,
    color: '#71717a', // zinc
    bgColor: '#f4f4f5',
  },
  volunteer: {
    icon: Heart,
    color: '#ef4444', // red
    bgColor: '#fee2e2',
  },
  photo: {
    icon: Camera,
    color: '#0ea5e9', // sky
    bgColor: '#e0f2fe',
  },
  ceremony: {
    icon: Award,
    color: '#7c3aed', // violet
    bgColor: '#ede9fe',
  },
  welcome: {
    icon: DoorOpen,
    color: '#22c55e', // green
    bgColor: '#dcfce7',
  },
  farewell: {
    icon: DoorClosed,
    color: '#f97316', // orange
    bgColor: '#ffedd5',
  },
  surprise: {
    icon: Sparkles,
    color: '#ec4899', // pink
    bgColor: '#fce7f3',
  },
  general: {
    icon: Calendar,
    color: '#6b7280', // gray
    bgColor: '#f3f4f6',
  },
}

interface EventTypeIconProps {
  icon: EventIconType
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showBackground?: boolean
  className?: string
  colorOverride?: string // Override the icon color (e.g., 'white' for cards)
}

const SIZE_MAP = {
  sm: {
    container: 'w-6 h-6',
    icon: 14,
  },
  md: {
    container: 'w-8 h-8',
    icon: 18,
  },
  lg: {
    container: 'w-10 h-10',
    icon: 22,
  },
  xl: {
    container: 'w-14 h-14',
    icon: 36,
  },
}

export function EventTypeIcon({
  icon,
  size = 'md',
  showBackground = true,
  className = '',
  colorOverride,
}: EventTypeIconProps) {
  const config = ICON_CONFIG[icon] || ICON_CONFIG.general
  const IconComponent = config.icon
  const sizeConfig = SIZE_MAP[size]
  const iconColor = colorOverride || config.color

  if (showBackground) {
    return (
      <div
        className={`${sizeConfig.container} rounded-full flex items-center justify-center shrink-0 ${className}`}
        style={{ backgroundColor: colorOverride ? 'transparent' : config.bgColor }}
      >
        <IconComponent
          size={sizeConfig.icon}
          style={{ color: iconColor }}
          strokeWidth={2}
        />
      </div>
    )
  }

  return (
    <IconComponent
      size={sizeConfig.icon}
      style={{ color: iconColor }}
      strokeWidth={2}
      className={`shrink-0 ${className}`}
    />
  )
}

// Export the icon config for use elsewhere
export { ICON_CONFIG }
