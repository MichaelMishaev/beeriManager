'use client'

import { useParams } from 'next/navigation'
import { usePathname, useRouter } from '@/i18n/navigation'
import { locales, localeNames, type Locale } from '@/i18n/config'
import { featureFlags } from '@/lib/features'
import { cn } from '@/lib/utils'
import { Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface LanguageSwitcherProps {
  variant?: 'full' | 'compact'
}

export function LanguageSwitcher({ variant = 'full' }: LanguageSwitcherProps) {
  const params = useParams()
  const pathname = usePathname()
  const router = useRouter()
  const currentLocale = params.locale as Locale

  if (!featureFlags.showLanguageSwitcher) {
    return null
  }

  const switchLanguage = (locale: Locale) => {
    router.replace(pathname, { locale })
  }

  // Compact variant: Globe icon with dropdown
  if (variant === 'compact') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 relative border-0 outline-none focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
            aria-label="Switch language"
          >
            <Globe className="h-5 w-5" />
            <span className="absolute -bottom-0.5 -right-0.5 text-[10px] font-bold bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center">
              {currentLocale.toUpperCase().slice(0, 2)}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[120px]">
          {locales.map((locale) => (
            <DropdownMenuItem
              key={locale}
              onClick={() => switchLanguage(locale)}
              className={cn(
                'cursor-pointer',
                currentLocale === locale && 'bg-accent font-semibold'
              )}
            >
              {localeNames[locale]}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // Full variant: Original button layout
  return (
    <div className="flex flex-col md:flex-row items-center gap-1">
      {locales.map((locale) => (
        <button
          key={locale}
          onClick={() => switchLanguage(locale)}
          className={cn(
            'px-2.5 py-1 text-xs md:text-sm font-medium rounded-full transition-all duration-300 w-16 min-w-16 max-w-16 text-center flex items-center justify-center',
            currentLocale === locale
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          )}
        >
          {localeNames[locale]}
        </button>
      ))}
    </div>
  )
}
