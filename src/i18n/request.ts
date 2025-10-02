import { getRequestConfig } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { locales } from './config'

export default getRequestConfig(async ({ requestLocale }) => {
  // Use the new requestLocale API
  const locale = await requestLocale

  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound()

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  }
})
