'use client'

import { useState } from 'react'
import { Users, ChevronDown, ChevronUp, Share2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface CommitteeMember {
  grade: string
  name: string
}

const committeeMembers: CommitteeMember[] = [
  { grade: 'א1', name: 'דבי כראדי' },
  { grade: 'א2', name: 'חופית מטייב' },
  { grade: 'א3', name: 'אלון שמואלוביץ\'' },
  { grade: 'א4', name: 'ורדית צוויג' },

  { grade: 'ב1', name: 'יוסי בן דוד' },
  { grade: 'ב2', name: 'יוליה זברסקי' },
  { grade: 'ב3', name: 'אלון שמואלוביץ\'' },
  { grade: 'ב4', name: 'נועה זנזורי' },

  { grade: 'ג1', name: 'אלינור מנישרוב' },
  { grade: 'ג2', name: 'ליאור בן הרוש' },
  { grade: 'ג3', name: 'אורטל בבלי' },
  { grade: 'ג4', name: 'ניצן חכימי' },

  { grade: 'ד1', name: 'אלמוג ארזי הלל' },
  { grade: 'ד2', name: 'יוסי בן דוד' },
  { grade: 'ד3', name: 'מיכאל מישייב' },

  { grade: 'ה1', name: 'ולנטינה מטייקה' },
  { grade: 'ה2', name: 'מאגי קדר' },
  { grade: 'ה3', name: 'עמית טסלר' },

  { grade: 'ו1', name: 'מיכאל מישייב' },
  { grade: 'ו2', name: 'אדינה כהן' },
  { grade: 'ו3', name: 'ליטל דיין' },
  { grade: 'ו4', name: 'דניאל מויסה' },
]

// Group by grade level
const groupedMembers = committeeMembers.reduce((acc, member) => {
  const gradeLevel = member.grade[0] // א, ב, ג, etc.
  if (!acc[gradeLevel]) {
    acc[gradeLevel] = []
  }
  acc[gradeLevel].push(member)
  return acc
}, {} as Record<string, CommitteeMember[]>)

export function CommitteeCard() {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleShare = async () => {
    // RLM (Right-to-Left Mark) to force RTL direction
    const RLM = '\u200F'

    const text = `נציגי ועד ההורים

${Object.entries(groupedMembers).map(([gradeLevel, members]) =>
  `${gradeLevel}׳:\n${members.map(m => `${m.name} - ${m.grade}${RLM}`).join('\n')}`
).join('\n\n')}

לכל שאלה או הצעה - צרו קשר
https://beeri.online/`

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'נציגי ועד ההורים',
          text
        })
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          // Fallback to clipboard
          await navigator.clipboard.writeText(text)
          alert('הועתק ללוח!')
        }
      }
    } else {
      // Fallback to WhatsApp
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`
      window.open(whatsappUrl, '_blank')
    }
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200" dir="rtl">
      <CardHeader
        className="pb-3 cursor-pointer hover:bg-blue-100/50 transition-colors rounded-t-lg"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Users className="h-5 w-5 text-blue-600" />
            נציגי ועד ההורים
          </CardTitle>
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 text-blue-700" />
          ) : (
            <ChevronUp className="h-5 w-5 text-blue-700" />
          )}
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(groupedMembers).map(([gradeLevel, members]) => (
              <div key={gradeLevel} className="space-y-2">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-lg mb-2">
                    {gradeLevel}׳
                  </div>
                </div>
                <div className="space-y-1.5">
                  {members.map((member) => (
                    <div
                      key={member.grade}
                      className="bg-white/80 backdrop-blur-sm rounded-lg p-2 text-center hover:bg-white transition-colors"
                    >
                      <div className="text-xs font-semibold text-blue-700 mb-0.5">
                        {member.grade}
                      </div>
                      <div className="text-sm text-gray-700 leading-tight">
                        {member.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-blue-200 flex flex-col gap-3">
            <Button
              onClick={handleShare}
              variant="outline"
              size="sm"
              className="w-full gap-2 bg-blue-50 border-blue-300 text-blue-900 hover:bg-blue-100 hover:border-blue-400"
            >
              <Share2 className="h-4 w-4" />
              שתף את רשימת הנציגים
            </Button>
            <p className="text-sm text-blue-900 text-center">
              לשאלות והצעות:{' '}
              <a
                href="https://wa.me/972544345287?text=שלום,%20יש%20לי%20שאלה%20לועד%20ההורים"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 hover:text-blue-900 font-semibold hover:underline"
              >
                שלחו הודעה בוואטסאפ
              </a>
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
