'use client'

import { useState, useEffect } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { ChevronDown, ChevronUp, Edit2, Info, Phone, Plus, Save, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  AdminEmptyState,
  AdminFormSection,
  AdminPageHeader,
  StatusPill,
} from '@/components/features/admin'
import { toast } from 'sonner'
import type { Contact } from '@/types'
import { logger } from '@/lib/logger'

// Category names are bilingual data (shown as "he (ru)" in the select), not admin UI text
const categories = [
  { value: 'nurse', label: 'אחות', labelRu: 'Медсестра' },
  { value: 'admin', label: 'הנהלה', labelRu: 'Администрация' },
  { value: 'teacher', label: 'מורה', labelRu: 'Учитель' },
  { value: 'committee', label: 'ועד', labelRu: 'Комитет' },
  { value: 'service', label: 'שירות', labelRu: 'Служба' },
] as const

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const t = useTranslations('admin.messaging.contacts')
  const tc = useTranslations('admin.common')
  const locale = useLocale()

  useEffect(() => {
    loadContacts()
  }, [])

  async function loadContacts() {
    try {
      const response = await fetch('/api/contacts')
      const data = await response.json()
      if (data.success) {
        setContacts(data.data || [])
      }
    } catch (error) {
      logger.error('Failed to load contacts', { error })
      toast.error(t('toast.loadError'))
    } finally {
      setIsLoading(false)
    }
  }

  async function saveContacts() {
    setIsSaving(true)
    try {
      const response = await fetch('/api/contacts/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contacts }),
      })

      const data = await response.json()
      if (data.success) {
        toast.success(t('toast.saveSuccess'))
        logger.success('Contacts saved', { count: contacts.length })
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      logger.error('Failed to save contacts', { error })
      toast.error(t('toast.saveError'))
    } finally {
      setIsSaving(false)
    }
  }

  function addContact() {
    const newContact: Contact = {
      id: Date.now().toString(),
      name: '',
      name_ru: '',
      role: '',
      role_ru: '',
      phone: '',
      email: '',
      category: 'admin',
      sort_order: contacts.length + 1,
      is_public: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setContacts([...contacts, newContact])
    setEditingId(newContact.id)
  }

  function updateContact<K extends keyof Contact>(id: string, field: K, value: Contact[K]) {
    setContacts(contacts.map(c =>
      c.id === id ? { ...c, [field]: value, updated_at: new Date().toISOString() } : c
    ))
  }

  function deleteContact(id: string) {
    if (confirm(t('deleteConfirm'))) {
      setContacts(contacts.filter(c => c.id !== id))
      toast.success(t('toast.deleted'))
    }
  }

  function moveContact(id: string, direction: 'up' | 'down') {
    const index = contacts.findIndex(c => c.id === id)
    if (index === -1) return
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === contacts.length - 1) return

    const newContacts = [...contacts]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    ;[newContacts[index], newContacts[targetIndex]] = [newContacts[targetIndex], newContacts[index]]

    // Update sort_order
    newContacts.forEach((c, i) => {
      c.sort_order = i + 1
    })

    setContacts(newContacts)
  }

  if (isLoading) {
    return <div className="py-8 text-center text-gray-500">{tc('loading')}</div>
  }

  const fieldLabel = 'mb-1 block text-sm font-medium text-[#003153]'

  return (
    <div className="space-y-4">
      <AdminPageHeader title={t('title')} backHref="/admin/more" />

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button onClick={addContact} className="min-h-[44px] w-full gap-2 sm:w-auto">
          <Plus className="h-4 w-4" />
          {t('add')}
        </Button>
        <Button
          onClick={saveContacts}
          disabled={isSaving}
          variant="default"
          className="min-h-[44px] w-full gap-2 sm:w-auto"
        >
          <Save className="h-4 w-4" />
          {isSaving ? t('saving') : t('save')}
        </Button>
      </div>

      <div className="space-y-3">
        {contacts.map((contact, index) => {
          const category = categories.find(c => c.value === contact.category)
          return (
            <div
              key={contact.id}
              className="rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-11 w-11 p-0"
                    aria-label={t('aria.moveUp')}
                    onClick={() => moveContact(contact.id, 'up')}
                    disabled={index === 0}
                  >
                    <ChevronUp className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-11 w-11 p-0"
                    aria-label={t('aria.moveDown')}
                    onClick={() => moveContact(contact.id, 'down')}
                    disabled={index === contacts.length - 1}
                  >
                    <ChevronDown className="h-5 w-5" />
                  </Button>
                  <StatusPill tone="neutral">{contact.sort_order}</StatusPill>
                </div>
                <div className="flex gap-1">
                  {editingId === contact.id ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-11 w-11 p-0"
                      aria-label={t('aria.close')}
                      onClick={() => setEditingId(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-11 w-11 p-0"
                      aria-label={t('aria.edit')}
                      onClick={() => setEditingId(contact.id)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-11 w-11 p-0 text-red-600 hover:text-red-700"
                    aria-label={t('aria.delete')}
                    onClick={() => deleteContact(contact.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {editingId === contact.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className={fieldLabel}>{t('fields.nameHe')}</label>
                      {/* Placeholders are example data in the language of the field, not admin UI text */}
                      <Input
                        className="h-11"
                        value={contact.name}
                        onChange={(e) => updateContact(contact.id, 'name', e.target.value)}
                        placeholder="דניאלה"
                      />
                    </div>
                    <div>
                      <label className={fieldLabel}>{t('fields.nameRu')}</label>
                      <Input
                        className="h-11"
                        value={contact.name_ru || ''}
                        onChange={(e) => updateContact(contact.id, 'name_ru', e.target.value)}
                        placeholder="Даниэла"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className={fieldLabel}>{t('fields.roleHe')}</label>
                      <Input
                        className="h-11"
                        value={contact.role}
                        onChange={(e) => updateContact(contact.id, 'role', e.target.value)}
                        placeholder="אחות"
                      />
                    </div>
                    <div>
                      <label className={fieldLabel}>{t('fields.roleRu')}</label>
                      <Input
                        className="h-11"
                        value={contact.role_ru || ''}
                        onChange={(e) => updateContact(contact.id, 'role_ru', e.target.value)}
                        placeholder="Медсестра"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className={fieldLabel}>{t('fields.phone')}</label>
                      <Input
                        className="h-11"
                        dir="ltr"
                        value={contact.phone || ''}
                        onChange={(e) => updateContact(contact.id, 'phone', e.target.value)}
                        placeholder="050-123-4567"
                      />
                    </div>
                    <div>
                      <label className={fieldLabel}>{t('fields.email')}</label>
                      <Input
                        className="h-11"
                        dir="ltr"
                        value={contact.email || ''}
                        onChange={(e) => updateContact(contact.id, 'email', e.target.value)}
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className={fieldLabel}>{t('fields.category')}</label>
                    <select
                      value={contact.category}
                      onChange={(e) => updateContact(contact.id, 'category', e.target.value as Contact['category'])}
                      className="h-11 w-full rounded-md border bg-white px-3"
                    >
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label} ({cat.labelRu})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex min-h-[44px] items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-5 w-5"
                      checked={contact.is_public}
                      onChange={(e) => updateContact(contact.id, 'is_public', e.target.checked)}
                      id={`public-${contact.id}`}
                    />
                    <label htmlFor={`public-${contact.id}`} className="text-sm">
                      {t('fields.isPublic')}
                    </label>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <strong className="text-lg text-[#003153]">{contact.name}</strong>
                    {contact.name_ru && (
                      <span className="text-gray-500">({contact.name_ru})</span>
                    )}
                    {category && (
                      <StatusPill tone="info">
                        {locale === 'ru' ? category.labelRu : category.label}
                      </StatusPill>
                    )}
                  </div>
                  {contact.role && (
                    <div className="text-sm text-gray-500">
                      {contact.role}
                      {contact.role_ru && ` (${contact.role_ru})`}
                    </div>
                  )}
                  {contact.phone && (
                    <div className="flex min-h-[44px] items-center gap-2">
                      <Phone className="h-4 w-4" aria-hidden="true" />
                      <a href={`tel:${contact.phone}`} dir="ltr" className="text-blue-600 hover:underline">
                        {contact.phone}
                      </a>
                    </div>
                  )}
                  {contact.email && (
                    <div className="text-sm">
                      <a href={`mailto:${contact.email}`} dir="ltr" className="break-all text-blue-600 hover:underline">
                        {contact.email}
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {contacts.length === 0 && <AdminEmptyState icon={Phone} title={t('empty')} />}

      <AdminFormSection>
        <p className="flex items-start gap-2 text-sm text-[#003153]">
          <Info className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" />
          <span>
            <strong>{t('noteLabel')}</strong> {t('noteBody')}
          </span>
        </p>
      </AdminFormSection>
    </div>
  )
}
