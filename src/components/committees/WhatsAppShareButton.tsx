'use client'

import { MessageCircle, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useParams } from 'next/navigation'
import type { Locale } from '@/i18n/config'

interface Committee {
  id: string
  name: string
  description?: string
  members?: string[]
  responsibilities?: string[]
  color?: string
}

interface WhatsAppShareButtonProps {
  committee: Committee
}

export function WhatsAppShareButton({ committee }: WhatsAppShareButtonProps) {
  const params = useParams()
  const locale = (params.locale || 'he') as Locale
  const [copied, setCopied] = useState(false)

  const formatCommitteeForWhatsApp = () => {
    let message = `*${committee.name}*\n`

    if (committee.description) {
      message += `\n${committee.description}\n`
    }

    if (committee.members && committee.members.length > 0) {
      const membersLabel = locale === 'ru' ? '*Члены комитета:*' : '*חברי ועדה:*'
      message += `\n${membersLabel}\n`
      committee.members.forEach((member) => {
        message += `  - ${member}\n`
      })
    }

    if (committee.responsibilities && committee.responsibilities.length > 0) {
      const responsibilitiesLabel = locale === 'ru' ? '*Обязанности:*' : '*תחומי אחריות:*'
      message += `\n${responsibilitiesLabel}\n`
      committee.responsibilities.forEach((resp) => {
        message += `  - ${resp}\n`
      })
    }

    message += `\n-------------------\n`
    const moreInfo = locale === 'ru'
      ? 'Подробнее на https://beeri.online'
      : 'לעוד מידע כנסו ל https://beeri.online'
    message += moreInfo

    return message
  }

  const handleCopy = async () => {
    const text = formatCommitteeForWhatsApp()
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleWhatsAppShare = () => {
    const text = formatCommitteeForWhatsApp()
    const encodedText = encodeURIComponent(text)
    const whatsappUrl = `https://wa.me/?text=${encodedText}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="gap-1"
          style={{ borderColor: committee.color, color: committee.color }}
        >
          <MessageCircle className="h-3 w-3" />
          שתף
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleWhatsAppShare} className="gap-2">
          <MessageCircle className="h-4 w-4 text-green-600" />
          <span>שתף בווצאפ</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopy} className="gap-2">
          {copied ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          <span>{copied ? 'הועתק!' : 'העתק טקסט'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}