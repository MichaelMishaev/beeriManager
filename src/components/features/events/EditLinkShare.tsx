'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Copy, Share2, Check, Link2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface EditLinkShareProps {
  token: string
  eventTitle?: string
  className?: string
  variant?: 'default' | 'compact' | 'card'
}

export function EditLinkShare({
  token,
  eventTitle = '',
  className,
  variant = 'default'
}: EditLinkShareProps) {
  const t = useTranslations('myEvents')
  const [copied, setCopied] = useState(false)

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const editUrl = `${baseUrl}/he/events/edit/${token}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleWhatsAppShare = () => {
    const message = t('shareMessage', { title: eventTitle, url: editUrl })
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="gap-1"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-green-600" />
              <span className="text-green-600">{t('linkCopied')}</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>{t('copyLink')}</span>
            </>
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleWhatsAppShare}
          className="gap-1 text-green-600 hover:text-green-700"
        >
          <Share2 className="h-3 w-3" />
          <span>WhatsApp</span>
        </Button>
      </div>
    )
  }

  if (variant === 'card') {
    return (
      <div className={cn(
        'bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-200 rounded-lg p-4',
        className
      )}>
        <div className="flex items-center gap-2 mb-2">
          <Link2 className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-blue-900">{t('editLink')}</span>
        </div>
        <p className="text-sm text-blue-700 mb-3">
          {t('editLinkDescription')}
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            value={editUrl}
            readOnly
            className="flex-1 text-sm bg-white/80 border-blue-200"
            dir="ltr"
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="flex-1 sm:flex-none gap-1 border-blue-300 hover:bg-blue-100"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-green-600">{t('linkCopied')}</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>{t('copyLink')}</span>
                </>
              )}
            </Button>
            <Button
              size="sm"
              onClick={handleWhatsAppShare}
              className="flex-1 sm:flex-none gap-1 bg-green-600 hover:bg-green-700 text-white"
            >
              <Share2 className="h-4 w-4" />
              <span>{t('shareWhatsApp')}</span>
            </Button>
          </div>
        </div>
        <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
          <span>💡</span>
          {t('saveLink')}
        </p>
      </div>
    )
  }

  // Default variant
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2">
        <Link2 className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{t('editLink')}</span>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          value={editUrl}
          readOnly
          className="flex-1 text-sm"
          dir="ltr"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="gap-1"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-green-600" />
              <span className="text-green-600">{t('linkCopied')}</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span>{t('copyLink')}</span>
            </>
          )}
        </Button>
        <Button
          size="sm"
          onClick={handleWhatsAppShare}
          className="gap-1 bg-green-600 hover:bg-green-700 text-white"
        >
          <Share2 className="h-4 w-4" />
          <span>{t('shareWhatsApp')}</span>
        </Button>
      </div>
    </div>
  )
}
