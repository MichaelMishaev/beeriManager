'use client'

import { useState } from 'react'
import { Users, ChevronDown, ChevronUp } from 'lucide-react'
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

  const handleWhatsAppShare = () => {
    // RTL EMBEDDING character to force right-to-left text direction
    const RLE = '\u202B' // RIGHT-TO-LEFT EMBEDDING
    const PDF = '\u202C' // POP DIRECTIONAL FORMATTING

    const text = `${RLE}נציגי ועד ההורים${PDF}

${Object.entries(groupedMembers).map(([gradeLevel, members]) =>
  `${RLE}${gradeLevel}׳:${PDF}\n${members.map(m => `${RLE}${m.name} - ${m.grade}${PDF}`).join('\n')}`
).join('\n\n')}

${RLE}לכל שאלה או הצעה - צרו קשר${PDF}
https://beeri.online/`

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(whatsappUrl, '_blank')
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
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleWhatsAppShare()
              }}
              className="text-green-700 hover:text-green-900 hover:bg-green-100 gap-1"
            >
              שתף
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
            </Button>
            {isExpanded ? (
              <ChevronDown className="h-5 w-5 text-blue-700" />
            ) : (
              <ChevronUp className="h-5 w-5 text-blue-700" />
            )}
          </div>
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

          <div className="mt-6 pt-4 border-t border-blue-200">
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
