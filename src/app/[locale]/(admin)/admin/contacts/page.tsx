'use client'

import { useState, useEffect } from 'react'
import { Phone, Plus, Trash2, Edit2, Save, X, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import type { Contact } from '@/types'
import { logger } from '@/lib/logger'

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
      toast.error('שגיאה בטעינת אנשי הקשר')
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
        toast.success('אנשי הקשר נשמרו בהצלחה')
        logger.success('Contacts saved', { count: contacts.length })
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      logger.error('Failed to save contacts', { error })
      toast.error('שגיאה בשמירת אנשי הקשר')
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

  function updateContact(id: string, field: keyof Contact, value: any) {
    setContacts(contacts.map(c =>
      c.id === id ? { ...c, [field]: value, updated_at: new Date().toISOString() } : c
    ))
  }

  function deleteContact(id: string) {
    if (confirm('האם למחוק איש קשר זה?')) {
      setContacts(contacts.filter(c => c.id !== id))
      toast.success('איש הקשר נמחק')
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
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">טוען...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Phone className="h-8 w-8" />
          ניהול אנשי קשר
        </h1>
        <div className="flex gap-2">
          <Button onClick={addContact} className="gap-2">
            <Plus className="h-4 w-4" />
            הוסף איש קשר
          </Button>
          <Button
            onClick={saveContacts}
            disabled={isSaving}
            variant="default"
            className="gap-2 bg-green-600 hover:bg-green-700"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'שומר...' : 'שמור שינויים'}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {contacts.map((contact, index) => (
          <Card key={contact.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveContact(contact.id, 'up')}
                      disabled={index === 0}
                    >
                      ↑
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveContact(contact.id, 'down')}
                      disabled={index === contacts.length - 1}
                    >
                      ↓
                    </Button>
                  </div>
                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                  <Badge>{contact.sort_order}</Badge>
                </div>
                <div className="flex gap-2">
                  {editingId === contact.id ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingId(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingId(contact.id)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteContact(contact.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {editingId === contact.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">שם (עברית)</label>
                      <Input
                        value={contact.name}
                        onChange={(e) => updateContact(contact.id, 'name', e.target.value)}
                        placeholder="דניאלה"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">שם (רוסית)</label>
                      <Input
                        value={contact.name_ru || ''}
                        onChange={(e) => updateContact(contact.id, 'name_ru', e.target.value)}
                        placeholder="Даниэла"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">תפקיד (עברית)</label>
                      <Input
                        value={contact.role}
                        onChange={(e) => updateContact(contact.id, 'role', e.target.value)}
                        placeholder="אחות"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">תפקיד (רוסית)</label>
                      <Input
                        value={contact.role_ru || ''}
                        onChange={(e) => updateContact(contact.id, 'role_ru', e.target.value)}
                        placeholder="Медсестра"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">טלפון</label>
                      <Input
                        value={contact.phone || ''}
                        onChange={(e) => updateContact(contact.id, 'phone', e.target.value)}
                        placeholder="050-123-4567"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">אימייל</label>
                      <Input
                        value={contact.email || ''}
                        onChange={(e) => updateContact(contact.id, 'email', e.target.value)}
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">קטגוריה</label>
                    <select
                      value={contact.category}
                      onChange={(e) => updateContact(contact.id, 'category', e.target.value)}
                      className="w-full border rounded-md px-3 py-2"
                    >
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label} ({cat.labelRu})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={contact.is_public}
                      onChange={(e) => updateContact(contact.id, 'is_public', e.target.checked)}
                      id={`public-${contact.id}`}
                    />
                    <label htmlFor={`public-${contact.id}`} className="text-sm">
                      ציבורי (מוצג לכולם)
                    </label>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <strong className="text-lg">{contact.name}</strong>
                    {contact.name_ru && (
                      <span className="text-muted-foreground">({contact.name_ru})</span>
                    )}
                    <Badge variant="outline">
                      {categories.find(c => c.value === contact.category)?.label}
                    </Badge>
                  </div>
                  {contact.role && (
                    <div className="text-sm text-muted-foreground">
                      {contact.role}
                      {contact.role_ru && ` (${contact.role_ru})`}
                    </div>
                  )}
                  {contact.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <a href={`tel:${contact.phone}`} className="text-blue-600 hover:underline">
                        {contact.phone}
                      </a>
                    </div>
                  )}
                  {contact.email && (
                    <div className="text-sm">
                      <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">
                        {contact.email}
                      </a>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {contacts.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Phone className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">אין אנשי קשר. לחץ על "הוסף איש קשר" להתחיל.</p>
          </CardContent>
        </Card>
      )}

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>הערה:</strong> לאחר שמירת השינויים, יש לעשות commit ו-push לגיט כדי שהשינויים יישמרו לצמיתות.
        </p>
      </div>
    </div>
  )
}
