'use client'

import { useRouter } from 'next/navigation'
import { GroceryCreateForm } from '@/components/features/grocery'
import { X } from 'lucide-react'

export default function GroceryCreatePage() {
  const router = useRouter()

  const handleSuccess = (token: string) => {
    router.push(`/he/grocery/${token}/items`)
  }

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-[#f6f8f7] dark:bg-[#102219] max-w-[430px] mx-auto shadow-2xl font-[family-name:var(--font-jakarta)]">
      {/* Header - iOS Style */}
      <header className="sticky top-0 z-50 flex items-center bg-[#f6f8f7]/80 dark:bg-[#102219]/80 backdrop-blur-md p-4 pb-2 justify-between border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => router.back()}
          className="text-[#0d1b14] dark:text-white flex size-12 shrink-0 items-center cursor-pointer"
        >
          <X className="h-6 w-6" />
        </button>
        <h2 className="text-[#0d1b14] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
          רשימת קניות חדשה
        </h2>
        <div className="flex w-12 items-center justify-end" />
      </header>

      {/* Form */}
      <main className="flex-1 pb-24">
        <GroceryCreateForm onSuccess={handleSuccess} />
      </main>
    </div>
  )
}
