'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useTranslations, useLocale } from 'next-intl'
import { MessageCircle, Users, ExternalLink, Sparkles, Globe } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// Grade data with colors and emojis
const grades = [
  {
    id: 'grade-1',
    emoji: '📘',
    nameKey: 'grade1',
    gradeHe: 'א׳',
    url: 'https://chat.whatsapp.com/E3t0BQwhj0PCT4YjI1EfKg',
    color: '#87CEEB', // Sky Blue
    gradient: 'from-sky-400/20 to-blue-400/20'
  },
  {
    id: 'grade-2',
    emoji: '📗',
    nameKey: 'grade2',
    gradeHe: 'ב׳',
    url: 'https://chat.whatsapp.com/J8OF6XOfESbG6icg5fcgbo',
    color: '#0D98BA', // Blue-Green
    gradient: 'from-cyan-500/20 to-teal-500/20'
  },
  {
    id: 'grade-3',
    emoji: '📙',
    nameKey: 'grade3',
    gradeHe: 'ג׳',
    url: 'https://chat.whatsapp.com/LBOfq7prC7N7cwoEEnR1xD',
    color: '#FFBA00', // Selective Yellow
    gradient: 'from-yellow-400/20 to-amber-400/20'
  },
  {
    id: 'grade-4',
    emoji: '📒',
    nameKey: 'grade4',
    gradeHe: 'ד׳',
    url: 'https://chat.whatsapp.com/EHmRK5ArSlt2rnQwiJ2y6I',
    color: '#FF8200', // UT Orange
    gradient: 'from-orange-500/20 to-red-400/20'
  },
  {
    id: 'grade-5',
    emoji: '📔',
    nameKey: 'grade5',
    gradeHe: 'ה׳',
    url: 'https://chat.whatsapp.com/EaxwgHvtr3r7PPGLaeGG8Z',
    color: '#003153', // Prussian Blue
    gradient: 'from-blue-900/20 to-indigo-900/20'
  },
  {
    id: 'grade-6',
    emoji: '📕',
    nameKey: 'grade6',
    gradeHe: 'ו׳',
    url: 'https://chat.whatsapp.com/H1BvuS4Fcv09sLRNujLauj',
    color: '#8B5CF6', // Purple (gradient mix)
    gradient: 'from-purple-500/20 to-pink-500/20'
  }
]

// Russian-speaking families group (only shown when locale is 'ru')
const russianGroup = {
  id: 'russian-group',
  emoji: '🇷🇺',
  nameKey: 'russianGroup',
  url: 'https://chat.whatsapp.com/G9bcGHURhgiLp8TgVLQomn',
  color: '#0088cc', // Telegram blue for Russian community
  gradient: 'from-blue-500/20 to-cyan-400/20'
}

function GradeCard({ grade, index }: { grade: typeof grades[0]; index: number }) {
  const t = useTranslations('groups')
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="group animate-fade-in-up opacity-0"
      style={{
        animationDelay: `${index * 100}ms`,
        animationFillMode: 'forwards'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card
        className={cn(
          'relative overflow-hidden transition-all duration-500',
          'hover:shadow-2xl hover:-translate-y-2',
          'backdrop-blur-xl bg-gradient-to-br',
          grade.gradient,
          'border-2 border-white/20',
          'group-hover:scale-[1.02]',
          'cursor-pointer'
        )}
        style={{
          transform: isHovered ? 'perspective(1000px) rotateX(2deg) rotateY(-2deg)' : 'none',
          transition: 'transform 0.3s ease-out'
        }}
      >
        {/* Decorative gradient overlay */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle at 50% 0%, ${grade.color}15, transparent 70%)`
          }}
        />

        {/* Sparkle effect on hover */}
        <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
        </div>

        <CardContent className="p-6 relative z-10">
          {/* Emoji & Grade Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span
                className="text-5xl transform group-hover:scale-110 transition-transform duration-300"
                style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))' }}
              >
                {grade.emoji}
              </span>
              <div>
                <h3 className="text-2xl font-bold" style={{ color: grade.color }}>
                  {t(grade.nameKey)}
                </h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {t('gradeGroup')}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            {t('joinDescription')}
          </p>

          {/* WhatsApp Button */}
          <Link href={grade.url} target="_blank" rel="noopener noreferrer">
            <Button
              className={cn(
                'w-full group/btn relative overflow-hidden',
                'bg-[#25D366] hover:bg-[#1ea952] text-white',
                'shadow-lg shadow-green-500/30',
                'transition-all duration-300',
                'group-hover:shadow-xl group-hover:shadow-green-500/50'
              )}
              size="lg"
            >
              {/* Pulse animation background */}
              <span className="absolute inset-0 bg-white/20 animate-pulse-slow" />

              <MessageCircle className="h-5 w-5 ml-2 group-hover/btn:rotate-12 transition-transform" />
              <span className="relative z-10 font-semibold">{t('joinWhatsApp')}</span>
              <ExternalLink className="h-4 w-4 mr-2 opacity-70 group-hover/btn:opacity-100 transition-opacity" />
            </Button>
          </Link>

          {/* Member count badge (decorative) */}
          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded-full border-2 border-white"
                  style={{
                    background: `linear-gradient(135deg, ${grade.color}80, ${grade.color}40)`
                  }}
                />
              ))}
            </div>
            <span>{t('activeMembers')}</span>
          </div>
        </CardContent>

        {/* Corner decoration */}
        <div
          className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full opacity-10 blur-2xl"
          style={{ backgroundColor: grade.color }}
        />
      </Card>
    </div>
  )
}

export default function GroupsPage() {
  const t = useTranslations('groups')
  const locale = useLocale()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-sky-400/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-yellow-400/10 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl relative">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl mb-6 shadow-lg shadow-green-500/30">
            <MessageCircle className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-green-600 via-teal-600 to-blue-600">
            {t('title')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t('description')}{' '}
            <Link href={`/${locale}/groups/explanation`} className="text-blue-600 hover:text-blue-700 underline underline-offset-4 font-medium transition-colors">
              {t('explanationLink')}
            </Link>
          </p>
        </div>

        {/* Info Banner */}
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/50 shadow-sm animate-fade-in animation-delay-200">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-1">{t('infoTitle')}</h3>
              <p className="text-sm text-blue-700/80 leading-relaxed">{t('infoText')}</p>
            </div>
          </div>
        </div>

        {/* Grade Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {grades.map((grade, index) => (
            <GradeCard key={grade.id} grade={grade} index={index} />
          ))}
        </div>

        {/* Russian Group - Only shown when Russian locale is selected */}
        {locale === 'ru' && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="h-5 w-5 text-blue-600" />
              <h2 className="text-2xl font-bold text-blue-900">{t('russianGroupTitle')}</h2>
            </div>
            <div className="max-w-2xl mx-auto">
              <div
                className="group animate-fade-in-up opacity-0"
                style={{
                  animationDelay: '700ms',
                  animationFillMode: 'forwards'
                }}
              >
                <Card
                  className={cn(
                    'relative overflow-hidden transition-all duration-500',
                    'hover:shadow-2xl hover:-translate-y-2',
                    'backdrop-blur-xl bg-gradient-to-br',
                    russianGroup.gradient,
                    'border-2 border-blue-300/50',
                    'group-hover:scale-[1.02]'
                  )}
                >
                  {/* Decorative gradient overlay */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `radial-gradient(circle at 50% 0%, ${russianGroup.color}15, transparent 70%)`
                    }}
                  />

                  {/* Sparkle effect on hover */}
                  <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
                  </div>

                  <CardContent className="p-6 relative z-10">
                    {/* Emoji & Title Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span
                          className="text-5xl transform group-hover:scale-110 transition-transform duration-300"
                          style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))' }}
                        >
                          {russianGroup.emoji}
                        </span>
                        <div>
                          <h3 className="text-2xl font-bold" style={{ color: russianGroup.color }}>
                            {t(russianGroup.nameKey)}
                          </h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {t('russianGroupSubtitle')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      {t('russianGroupDescription')}
                    </p>

                    {/* WhatsApp Button */}
                    <Link href={russianGroup.url} target="_blank" rel="noopener noreferrer">
                      <Button
                        className={cn(
                          'w-full group/btn relative overflow-hidden',
                          'bg-[#25D366] hover:bg-[#1ea952] text-white',
                          'shadow-lg shadow-green-500/30',
                          'transition-all duration-300',
                          'group-hover:shadow-xl group-hover:shadow-green-500/50'
                        )}
                        size="lg"
                      >
                        {/* Pulse animation background */}
                        <span className="absolute inset-0 bg-white/20 animate-pulse-slow" />

                        <MessageCircle className="h-5 w-5 ml-2 group-hover/btn:rotate-12 transition-transform" />
                        <span className="relative z-10 font-semibold">{t('joinWhatsApp')}</span>
                        <ExternalLink className="h-4 w-4 mr-2 opacity-70 group-hover/btn:opacity-100 transition-opacity" />
                      </Button>
                    </Link>

                    {/* Member count badge (decorative) */}
                    <div className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <div className="flex -space-x-2">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="w-6 h-6 rounded-full border-2 border-white"
                            style={{
                              background: `linear-gradient(135deg, ${russianGroup.color}80, ${russianGroup.color}40)`
                            }}
                          />
                        ))}
                      </div>
                      <span>{t('activeMembers')}</span>
                    </div>
                  </CardContent>

                  {/* Corner decoration */}
                  <div
                    className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full opacity-10 blur-2xl"
                    style={{ backgroundColor: russianGroup.color }}
                  />
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 backdrop-blur-sm border border-border/50 animate-fade-in animation-delay-600">
          <h3 className="font-semibold text-lg mb-2">{t('helpTitle')}</h3>
          <p className="text-sm text-muted-foreground mb-4">{t('helpText')}</p>
          <Link href="/help">
            <Button variant="outline" size="sm">
              {t('helpButton')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Custom animations */}
      <style jsx global>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.1;
          }
          50% {
            opacity: 0.3;
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .animation-delay-200 {
          animation-delay: 200ms;
        }

        .animation-delay-600 {
          animation-delay: 600ms;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}
