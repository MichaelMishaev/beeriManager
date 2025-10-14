'use client'

import { useState, useEffect } from 'react'
import { TagManager } from './TagManager'
import type { Tag } from '@/types'

interface TagManagerClientProps {
  initialTags: Tag[]
}

export function TagManagerClient({ initialTags }: TagManagerClientProps) {
  const [tags, setTags] = useState<Tag[]>(initialTags)

  // Update tags when initialTags changes (from server refresh)
  useEffect(() => {
    setTags(initialTags)
  }, [initialTags])

  const refreshTags = async () => {
    try {
      const response = await fetch('/api/tags')
      const result = await response.json()
      if (result.success) {
        setTags(result.data)
      }
    } catch (error) {
      console.error('Error refreshing tags:', error)
    }
  }

  return <TagManager tags={tags} onRefresh={refreshTags} />
}
