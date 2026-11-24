import { redirect } from 'next/navigation'
import { buildInboxRedirect } from '@/components/features/admin/inbox/redirect'

interface PageProps {
  params: Promise<{ locale: string }> | { locale: string }
  searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>
}

// Old URL kept alive for bookmarks and links: the content now lives in the parents inbox.
export default async function Page({ params, searchParams }: PageProps) {
  const { locale } = await params
  const query = searchParams ? await searchParams : undefined
  redirect(buildInboxRedirect(locale, 'survey', query))
}
