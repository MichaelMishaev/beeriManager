'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'
import AIChatModal from './AIChatModal'

export default function AIFloatingButton() {
  const t = useTranslations('admin.common')
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-24 left-4 z-40 flex h-12 min-w-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-3 sm:px-5 text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
        aria-label={t('aiAssistantOpen')}
      >
        <Sparkles className="h-5 w-5" aria-hidden="true" />
        <span className="hidden font-medium sm:inline">{t('aiAssistant')}</span>
      </button>

      {/* Chat Modal */}
      <AIChatModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
