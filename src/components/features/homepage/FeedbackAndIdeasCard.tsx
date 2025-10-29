'use client'

import { useState } from 'react'
import { MessageSquare, Lightbulb, ChevronLeft } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import Link from 'next/link'

/**
 * Unified card component combining feedback and ideas functionality
 * Implements single button + modal design pattern for cleanest UX
 * Follows the "one CTA per card" best practice
 */
export function FeedbackAndIdeasCard() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <Card className="bg-gradient-to-br from-[#0D98BA]/5 to-[#FFBA00]/5 border-[#0D98BA]/20 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0D98BA]/10 to-[#FFBA00]/10 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-[#0D98BA]" />
            </div>
            <CardTitle className="text-xl text-[#003153]">
              💬💡 יש לכם משוב או רעיון?
            </CardTitle>
          </div>
          <CardDescription className="text-base mt-2">
            שתפו אותנו - בחרו איך!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-600 mb-2">
            המשוב שלכם עוזר לנו לשפר ולארגן אירועים טובים יותר עבור כולם. תוכלו לשלוח פניה או משוב אנונימי על כל נושא.
          </p>

          {/* Single CTA Button */}
          <Button
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-gradient-to-r from-[#0D98BA] to-[#0D98BA]/90 hover:from-[#0D98BA]/90 hover:to-[#0D98BA]/80 text-white shadow-sm"
            size="lg"
            data-testid="share-feedback-ideas-button"
          >
            שתפו אותנו
            <ChevronLeft className="h-5 w-5 mr-2" />
          </Button>
        </CardContent>
      </Card>

      {/* Modal with Both Options */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md" data-testid="feedback-ideas-modal">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center mb-2">
              איך תרצו לשתף אותנו?
            </DialogTitle>
            <DialogDescription className="text-center text-base">
              בחרו את הדרך המתאימה לכם
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-4">
            {/* Feedback Option */}
            <Link
              href="/complaint"
              className="block"
              onClick={() => setIsModalOpen(false)}
              data-testid="modal-feedback-link"
            >
              <div className="group p-4 rounded-lg border-2 border-[#0D98BA]/30 bg-[#0D98BA]/5 hover:bg-[#0D98BA]/10 hover:border-[#0D98BA] transition-all cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#0D98BA]/20 flex items-center justify-center flex-shrink-0 group-hover:bg-[#0D98BA]/30 transition-colors">
                    <MessageSquare className="h-6 w-6 text-[#0D98BA]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-[#003153] mb-1 group-hover:text-[#0D98BA] transition-colors">
                      💬 שלחו משוב
                    </h3>
                    <p className="text-sm text-gray-600">
                      שתפו אותנו בדעתכם על האירועים והשירותים שקיבלתם. המשוב שלכם עוזר לנו לשפר!
                    </p>
                  </div>
                  <ChevronLeft className="h-5 w-5 text-gray-400 group-hover:text-[#0D98BA] transition-colors flex-shrink-0" />
                </div>
              </div>
            </Link>

            {/* Ideas Option */}
            <Link
              href="/ideas"
              className="block"
              onClick={() => setIsModalOpen(false)}
              data-testid="modal-ideas-link"
            >
              <div className="group p-4 rounded-lg border-2 border-[#FFBA00]/30 bg-[#FFBA00]/5 hover:bg-[#FFBA00]/10 hover:border-[#FFBA00] transition-all cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#FFBA00]/20 flex items-center justify-center flex-shrink-0 group-hover:bg-[#FFBA00]/30 transition-colors">
                    <Lightbulb className="h-6 w-6 text-[#FFBA00]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-[#003153] mb-1 group-hover:text-[#FFBA00] transition-colors">
                      💡 שלחו רעיון
                    </h3>
                    <p className="text-sm text-gray-600">
                      יש לכם רעיון לשיפור או תכונה חדשה? שתפו אותנו והרעיונות שלכם יישקלו ויבדקו!
                    </p>
                  </div>
                  <ChevronLeft className="h-5 w-5 text-gray-400 group-hover:text-[#FFBA00] transition-colors flex-shrink-0" />
                </div>
              </div>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
