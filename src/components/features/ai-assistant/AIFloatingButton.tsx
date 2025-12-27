'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import AIChatModal from './AIChatModal'

export default function AIFloatingButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 left-6 z-50 flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-5 py-3 text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
        aria-label="Open AI Assistant"
      >
        <Sparkles className="h-5 w-5" />
        <span className="font-medium">עוזר AI</span>
      </button>

      {/* Chat Modal */}
      <AIChatModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
