export const locales = ['he', 'ru'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'he'

export const localeNames: Record<Locale, string> = {
  he: 'עברית',
  ru: 'ru'
}

export const localeDirections: Record<Locale, 'ltr' | 'rtl'> = {
  he: 'rtl',
  ru: 'ltr'
}

export const localeFonts: Record<Locale, string> = {
  he: 'Heebo',
  ru: 'Roboto'
}
