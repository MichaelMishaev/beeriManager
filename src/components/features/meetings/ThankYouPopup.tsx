'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, X } from 'lucide-react'
import { Card } from '@/components/ui/card'

export function ThankYouPopup() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Check if user just submitted an idea
    const submitted = localStorage.getItem('idea_submitted')

    if (submitted === 'true') {
      setShow(true)
      localStorage.removeItem('idea_submitted')

      // Auto-hide after 2 minutes
      const timer = setTimeout(() => {
        setShow(false)
      }, 120000) // 2 minutes = 120000ms

      return () => clearTimeout(timer)
    }

    return undefined
  }, [])

  if (!show) return null

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300">
      <Card className="bg-white shadow-lg border-2 border-green-500 p-4 min-w-[320px]">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-900">תודה רבה!</h3>
            <p className="text-sm text-gray-600 mt-1">
              רעיון שלך נשלח בהצלחה ונמצא כעת ברשימת הנושאים לפגישת ההנהגה
            </p>
          </div>
          <button
            onClick={() => setShow(false)}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="סגור"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </Card>
    </div>
  )
}
