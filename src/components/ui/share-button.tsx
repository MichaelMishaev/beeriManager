'use client'

import { forwardRef, useState, type ReactNode } from 'react'
import { Share2, Copy, Check, Send, type LucideIcon } from 'lucide-react'
import { Button, type ButtonProps } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils/cn'
import { toast } from 'sonner'

export interface ShareData {
  /** Title for the share dialog */
  title: string
  /** Main text content to share */
  text: string
  /** Optional URL to share */
  url?: string
}

export type ShareMethod = 'whatsapp' | 'telegram' | 'copy' | 'native'

export interface ShareButtonProps extends Omit<ButtonProps, 'onClick'> {
  /** Data to share */
  shareData: ShareData
  /** Label to display on button (default: none, icon only) */
  label?: string
  /** Custom icon component (default: Share2) */
  icon?: LucideIcon
  /** Icon size class (default: h-4 w-4) */
  iconSize?: string
  /** Locale for labels and toasts (default: he) */
  locale?: 'he' | 'ru'
  /** Callback after successful share */
  onShareSuccess?: (method: ShareMethod) => void
  /** Callback after share error */
  onShareError?: (error: Error) => void
  /** Custom children (overrides icon and label) */
  children?: ReactNode
  /** Show dropdown menu with options (default: true) */
  showMenu?: boolean
  /** Available share methods (default: all) */
  methods?: ShareMethod[]
}

const translations = {
  he: {
    shareVia: 'שתף דרך...',
    whatsapp: 'וואטסאפ',
    telegram: 'טלגרם',
    copy: 'העתק טקסט',
    native: 'שיתוף מערכת',
    copied: 'הועתק!',
    copiedWithLink: 'הועתק ללוח!',
    share: 'שיתוף',
    shareError: 'שגיאה בשיתוף'
  },
  ru: {
    shareVia: 'Поделиться через...',
    whatsapp: 'WhatsApp',
    telegram: 'Telegram',
    copy: 'Копировать текст',
    native: 'Системный способ',
    copied: 'Скопировано!',
    copiedWithLink: 'Скопировано в буфер!',
    share: 'Поделиться',
    shareError: 'Ошибка при отправке'
  }
}

// WhatsApp SVG Icon
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn('text-[#25D366]', className)}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

// Telegram SVG Icon
function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn('text-[#0088cc]', className)}
    >
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  )
}

/**
 * Unified share button component with dropdown menu for the entire app.
 *
 * Features:
 * - Dropdown menu with share options (WhatsApp, Telegram, Copy, Native)
 * - Custom icons for each share method
 * - Supports all button variants and sizes
 * - Customizable icon, label, and styling
 * - Locale support (Hebrew/Russian)
 *
 * @example
 * // Basic usage with menu
 * <ShareButton shareData={{ title: 'Event', text: 'Check out this event!' }} />
 *
 * @example
 * // With label
 * <ShareButton
 *   shareData={{ title: 'Event', text: 'Check out this event!', url: 'https://...' }}
 *   label="Share"
 *   variant="outline"
 * />
 *
 * @example
 * // Only specific share methods
 * <ShareButton
 *   shareData={{ title: 'Event', text: '...' }}
 *   methods={['whatsapp', 'copy']}
 * />
 */
export const ShareButton = forwardRef<HTMLButtonElement, ShareButtonProps>(
  (
    {
      shareData,
      label,
      icon: Icon = Share2,
      iconSize = 'h-4 w-4',
      locale = 'he',
      onShareSuccess,
      onShareError,
      children,
      className,
      variant = 'outline',
      size = 'sm',
      showMenu = true,
      methods = ['whatsapp', 'telegram', 'copy', 'native'],
      ...buttonProps
    },
    ref
  ) => {
    const [copied, setCopied] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const t = translations[locale]

    const getFullText = () => {
      const { text, url } = shareData
      return url ? `${text}\n\n${url}` : text
    }

    const handleWhatsApp = () => {
      const fullText = getFullText()
      const encodedText = encodeURIComponent(fullText)
      window.open(`https://wa.me/?text=${encodedText}`, '_blank')
      onShareSuccess?.('whatsapp')
      setIsOpen(false)
    }

    const handleTelegram = () => {
      const fullText = getFullText()
      const encodedText = encodeURIComponent(fullText)
      window.open(`https://t.me/share/url?url=${encodeURIComponent(shareData.url || '')}&text=${encodedText}`, '_blank')
      onShareSuccess?.('telegram')
      setIsOpen(false)
    }

    const handleCopy = async () => {
      try {
        const fullText = getFullText()
        await navigator.clipboard.writeText(fullText)
        setCopied(true)
        toast.success(shareData.url ? t.copiedWithLink : t.copied)
        onShareSuccess?.('copy')
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        const error = err as Error
        toast.error(t.shareError)
        onShareError?.(error)
      }
      setIsOpen(false)
    }

    const handleNative = async () => {
      const { title, text, url } = shareData

      if (navigator.share) {
        try {
          await navigator.share({
            title,
            text,
            ...(url && { url })
          })
          onShareSuccess?.('native')
        } catch (err) {
          const error = err as Error
          if (error.name !== 'AbortError') {
            // Fallback to copy
            await handleCopy()
          }
        }
      } else {
        // No native share, fallback to copy
        await handleCopy()
      }
      setIsOpen(false)
    }

    // Direct share without menu (legacy behavior)
    if (!showMenu) {
      return (
        <Button
          ref={ref}
          variant={variant}
          size={size}
          className={cn(label && 'gap-2', className)}
          onClick={handleNative}
          title={t.share}
          {...buttonProps}
        >
          {children || (
            <>
              <Icon className={cn(iconSize, label && 'ml-1')} />
              {label}
            </>
          )}
        </Button>
      )
    }

    // Dropdown menu with share options
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            ref={ref}
            variant={variant}
            size={size}
            className={cn(label && 'gap-2', className)}
            title={t.share}
            {...buttonProps}
          >
            {children || (
              <>
                <Icon className={cn(iconSize, label && 'ml-1')} />
                {label}
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {methods.includes('whatsapp') && (
            <DropdownMenuItem onClick={handleWhatsApp} className="gap-3 cursor-pointer">
              <WhatsAppIcon className="h-5 w-5" />
              <span>{t.whatsapp}</span>
            </DropdownMenuItem>
          )}

          {methods.includes('telegram') && (
            <DropdownMenuItem onClick={handleTelegram} className="gap-3 cursor-pointer">
              <TelegramIcon className="h-5 w-5" />
              <span>{t.telegram}</span>
            </DropdownMenuItem>
          )}

          {(methods.includes('whatsapp') || methods.includes('telegram')) &&
           (methods.includes('copy') || methods.includes('native')) && (
            <DropdownMenuSeparator />
          )}

          {methods.includes('copy') && (
            <DropdownMenuItem onClick={handleCopy} className="gap-3 cursor-pointer">
              {copied ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <Copy className="h-5 w-5 text-gray-500" />
              )}
              <span>{t.copy}</span>
            </DropdownMenuItem>
          )}

          {methods.includes('native') && typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
            <DropdownMenuItem onClick={handleNative} className="gap-3 cursor-pointer">
              <Send className="h-5 w-5 text-blue-500" />
              <span>{t.native}</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
)

ShareButton.displayName = 'ShareButton'

// Re-export types for convenience
export type { ShareButtonProps as UnifiedShareButtonProps }
