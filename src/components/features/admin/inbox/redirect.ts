export type InboxTab = 'feedback' | 'ideas' | 'survey'

type SearchParams = Record<string, string | string[] | undefined>

/**
 * Builds the locale-aware inbox URL used by the old /admin/feedback, /admin/ideas and
 * /admin/surveys/skills routes. Any query string the caller had is preserved.
 */
export function buildInboxRedirect(locale: string, tab: InboxTab, searchParams?: SearchParams): string {
  const qs = new URLSearchParams()
  qs.set('tab', tab)

  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (key === 'tab' || value === undefined) continue
      if (Array.isArray(value)) {
        value.forEach((v) => qs.append(key, v))
      } else {
        qs.append(key, value)
      }
    }
  }

  return `/${locale}/admin/inbox?${qs.toString()}`
}
