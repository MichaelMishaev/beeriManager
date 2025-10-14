'use client'

import Link from 'next/link'
import { Users, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ShareAllCommitteesButton } from './ShareAllCommitteesButton'

interface Committee {
  id: string
  name: string
  description?: string
  members?: string[]
  responsibilities?: string[]
  color?: string
}

interface CommitteesHeaderProps {
  committees: Committee[]
}

export function CommitteesHeader({ committees }: CommitteesHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Users className="h-8 w-8" />
          וועדות
        </h1>
        <p className="text-muted-foreground mt-2">
          ניהול וועדות תחומיות ותחומי אחריות
        </p>
      </div>
      <div className="flex gap-2">
        {committees.length > 0 && (
          <ShareAllCommitteesButton committees={committees} />
        )}
        <Button asChild>
          <Link href="/admin/committees/new">
            <Plus className="h-4 w-4 ml-2" />
            וועדה חדשה
          </Link>
        </Button>
      </div>
    </div>
  )
}
