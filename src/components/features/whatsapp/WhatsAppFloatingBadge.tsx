'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { WHATSAPP_COMMUNITY } from './WhatsAppCommunityLinks'

const VISITS_STORAGE_KEY = 'whatsapp-badge-visits'
const MAX_VISITS_BEFORE_HIDE = 3

export function WhatsAppFloatingBadge() {
  const [isOpen, setIsOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [showGrades, setShowGrades] = useState(false)

  useEffect(() => {
    // Check visit count
    const visits = parseInt(localStorage.getItem(VISITS_STORAGE_KEY) || '0')
    if (visits >= MAX_VISITS_BEFORE_HIDE) {
      setIsVisible(false)
    } else {
      localStorage.setItem(VISITS_STORAGE_KEY, String(visits + 1))
    }
  }, [])

  const handleBadgeClick = () => {
    setIsOpen(true)
  }

  const handleClose = () => {
    setIsOpen(false)
    setShowGrades(false)
  }

  if (!isVisible) return null

  return (
    <>
      {/* Floating Badge */}
      <button
        onClick={handleBadgeClick}
        className="fixed top-20 left-4 z-50 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse-soft hover:animate-none group md:p-4"
        aria-label="פתח קישורי קהילת WhatsApp"
      >
        <MessageCircle className="h-5 w-5 md:h-6 md:w-6" />
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] md:text-xs rounded-full h-4 w-4 md:h-5 md:w-5 flex items-center justify-center font-bold animate-pulse">
          !
        </span>
      </button>

      {/* Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <MessageCircle className="h-6 w-6 text-[#25D366]" />
              קהילת ההורים ב-WhatsApp
            </DialogTitle>
            <DialogDescription>
              הצטרפו לקהילה שלנו לעדכונים, שיתוף ותקשורת ישירה
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Main Community Link */}
            <Card className="border-2 border-[#25D366] bg-gradient-to-br from-green-50 to-green-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  🎯 הקהילה הראשית
                </CardTitle>
                <CardDescription>
                  הקהילה המרכזית של כל ההורים בבית הספר
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  asChild
                  className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white"
                  size="lg"
                >
                  <a
                    href={WHATSAPP_COMMUNITY.main}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleClose}
                  >
                    <MessageCircle className="h-5 w-5 ml-2" />
                    הצטרף לקהילה הראשית
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Grades Section */}
            <div className="border rounded-lg overflow-hidden">
              <button
                onClick={() => setShowGrades(!showGrades)}
                className="w-full px-4 py-3 bg-muted hover:bg-muted/80 transition-colors flex items-center justify-between"
              >
                <span className="font-semibold">קבוצות לפי שכבות</span>
                <ChevronDown className={`h-5 w-5 transition-transform ${showGrades ? 'rotate-180' : ''}`} />
              </button>

              {showGrades && (
                <div className="p-4 space-y-2 bg-card">
                  {WHATSAPP_COMMUNITY.grades.map((grade) => (
                    <a
                      key={grade.grade}
                      href={grade.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={handleClose}
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors group"
                    >
                      <span className="text-2xl">{grade.emoji}</span>
                      <span className="font-semibold text-lg flex-1">שכבת {grade.grade}</span>
                      <MessageCircle className="h-5 w-5 text-[#25D366] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Info Text */}
            <p className="text-xs text-muted-foreground text-center px-4">
              הקהילה מאפשרת תקשורת מהירה ויעילה בין ההורים וועד ההורים
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
