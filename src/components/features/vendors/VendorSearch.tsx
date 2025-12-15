'use client'

import { useState } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function VendorSearch() {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    // This will be used for client-side filtering in a future enhancement
    // For now, we'll keep it simple
  }

  const clearSearch = () => {
    setSearchQuery('')
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="חיפוש ספקים לפי שם, קטגוריה או שירות..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="pr-10 pl-10 h-12 text-base border-2 focus-visible:ring-2"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      {searchQuery && (
        <p className="text-sm text-muted-foreground mt-2 text-center">
          מחפש: &quot;{searchQuery}&quot;
        </p>
      )}
    </div>
  )
}
