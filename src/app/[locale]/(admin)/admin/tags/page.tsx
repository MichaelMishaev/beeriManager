import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { TagManagerClient } from '@/components/features/tasks/tags/TagManagerClient'
import type { Tag } from '@/types'

export const metadata: Metadata = {
  title: 'ניהול תגיות | פורטל בארי',
  description: 'ניהול תגיות לקטגוריזציה של משימות'
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getTags(): Promise<Tag[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('display_order', { ascending: true })
    .order('name_he', { ascending: true })

  if (error) {
    console.error('Error fetching tags:', error)
    return []
  }

  return data || []
}

export default async function TagsAdminPage() {
  const tags = await getTags()

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      <TagManagerClient initialTags={tags} />
    </div>
  )
}
