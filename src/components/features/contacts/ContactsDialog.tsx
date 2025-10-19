'use client'

import { useState, useEffect } from 'react'
import { Phone, Mail, Search, Loader2, User, Share2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Contact } from '@/types'
import type { Locale } from '@/i18n/config'
import { logger } from '@/lib/logger'

interface ContactsDialogProps {
  children?: React.ReactNode
}

const categoryColors: Record<Contact['category'], string> = {
  nurse: 'bg-red-100 text-red-800 border-red-200',
  admin: 'bg-blue-100 text-blue-800 border-blue-200',
  teacher: 'bg-green-100 text-green-800 border-green-200',
  committee: 'bg-purple-100 text-purple-800 border-purple-200',
  service: 'bg-orange-100 text-orange-800 border-orange-200',
}

function ContactCard({ contact, locale, categoryName }: { contact: Contact; locale: Locale; categoryName: string }) {
  const handlePhoneClick = (phone: string) => {
    logger.userAction('Click phone number', { phone, name: contact.name })
    window.location.href = `tel:${phone}`
  }

  const handleEmailClick = (email: string) => {
    logger.userAction('Click email', { email, name: contact.name })
    window.location.href = `mailto:${email}`
  }

  // Get localized content - fallback to Hebrew if Russian not available
  const name = (locale === 'ru' && contact.name_ru) ? contact.name_ru : contact.name
  const role = (locale === 'ru' && contact.role_ru) ? contact.role_ru : contact.role

  return (
    <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Name and Role */}
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-lg">{name}</h3>
            <Badge variant="outline" className={categoryColors[contact.category]}>
              {categoryName}
            </Badge>
          </div>

          {role && (
            <p className="text-sm text-muted-foreground mb-3">{role}</p>
          )}

          {/* Contact Actions */}
          <div className="flex flex-wrap gap-2">
            {contact.phone && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePhoneClick(contact.phone!)}
                className="gap-2"
              >
                <Phone className="h-4 w-4" />
                {contact.phone}
              </Button>
            )}
            {contact.email && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEmailClick(contact.email!)}
                className="gap-2"
              >
                <Mail className="h-4 w-4" />
                {contact.email}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function ContactsDialog({ children }: ContactsDialogProps) {
  const [open, setOpen] = useState(false)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const t = useTranslations('contacts')
  const params = useParams()
  const currentLocale = (params.locale as Locale) || 'he'

  // Get category names from translations
  const getCategoryName = (category: Contact['category']) => {
    return t(`categories.${category}`)
  }

  useEffect(() => {
    if (open) {
      loadContacts()
    }
  }, [open])

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredContacts(contacts)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = contacts.filter(
        (contact) => {
          const name = (currentLocale === 'ru' && contact.name_ru) ? contact.name_ru : contact.name
          const role = (currentLocale === 'ru' && contact.role_ru) ? contact.role_ru : contact.role
          const categoryName = getCategoryName(contact.category)

          return name.toLowerCase().includes(query) ||
                 role.toLowerCase().includes(query) ||
                 categoryName.toLowerCase().includes(query)
        }
      )
      setFilteredContacts(filtered)
    }
  }, [searchQuery, contacts, currentLocale])

  async function loadContacts() {
    setIsLoading(true)
    try {
      const response = await fetch('/api/contacts')
      const data = await response.json()
      if (data.success) {
        setContacts(data.data || [])
        setFilteredContacts(data.data || [])
      }
    } catch (error) {
      logger.error('Failed to load contacts', { error })
    } finally {
      setIsLoading(false)
    }
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/${currentLocale}`

    // Build contacts text with all phone numbers (no title - it's in shareData.title)
    let contactsText = ''

    // Group and format contacts
    const grouped = contacts.reduce((acc, contact) => {
      if (!acc[contact.category]) {
        acc[contact.category] = []
      }
      acc[contact.category].push(contact)
      return acc
    }, {} as Record<string, typeof contacts>)

    // Add contacts by category
    Object.entries(grouped).forEach(([category, categoryContacts]) => {
      const categoryName = getCategoryName(category as Contact['category'])
      contactsText += `${categoryName}:\n`

      categoryContacts.forEach(contact => {
        const name = (currentLocale === 'ru' && contact.name_ru) ? contact.name_ru : contact.name
        const role = (currentLocale === 'ru' && contact.role_ru) ? contact.role_ru : contact.role
        contactsText += `  • ${name}`
        if (role && role !== name) {
          contactsText += ` (${role})`
        }
        if (contact.phone) {
          contactsText += ` - ${contact.phone}`
        }
        contactsText += '\n'
      })
      contactsText += '\n'
    })

    contactsText += `🌐 ${url}`

    const shareData = {
      title: t('shareTitle'),
      text: contactsText
    }

    try {
      // Try Web Share API first (mobile)
      if (navigator.share) {
        await navigator.share(shareData)
        logger.userAction('Share contacts via Web Share API', { locale: currentLocale, contactCount: contacts.length })
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(contactsText)
        toast.success(t('copied'))
        logger.userAction('Copy contacts to clipboard', { locale: currentLocale, contactCount: contacts.length })
      }
    } catch (error) {
      // User cancelled or error occurred
      if ((error as Error).name !== 'AbortError') {
        logger.error('Share contacts failed', { error })
      }
    }
  }

  // Group contacts by category
  const groupedContacts = filteredContacts.reduce((acc, contact) => {
    if (!acc[contact.category]) {
      acc[contact.category] = []
    }
    acc[contact.category].push(contact)
    return acc
  }, {} as Record<Contact['category'], Contact[]>)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="gap-2">
            <Phone className="h-4 w-4" />
            {t('title')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Phone className="h-6 w-6" />
                {t('title')}
              </DialogTitle>
              <DialogDescription className="mt-2">
                {t('description')}
              </DialogDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="flex items-center gap-2 flex-shrink-0"
            >
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">{t('share')}</span>
            </Button>
          </div>
        </DialogHeader>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>

        {/* Contacts List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="text-center py-12">
            <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchQuery ? t('noResults') : t('noContacts')}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedContacts).map(([category, categoryContacts]) => {
              const categoryName = getCategoryName(category as Contact['category'])
              return (
                <div key={category}>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Badge className={categoryColors[category as Contact['category']]}>
                      {categoryName}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      ({categoryContacts.length})
                    </span>
                  </h3>
                  <div className="space-y-2">
                    {categoryContacts.map((contact) => (
                      <ContactCard
                        key={contact.id}
                        contact={contact}
                        locale={currentLocale}
                        categoryName={categoryName}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
