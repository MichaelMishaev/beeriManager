'use client'

import { useParams } from 'next/navigation'
import { usePathname, useRouter } from '@/i18n/navigation'
import { locales, localeNames, type Locale } from '@/i18n/config'
import { featureFlags } from '@/lib/features'
import { cn } from '@/lib/utils'

export function LanguageSwitcher() {
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

  return (
    <div className="flex flex-col items-center gap-1">
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
