'use client'

import { useState } from 'react'
import { Save, Key, Lock } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import {
  AdminFormSection,
  AdminGroup,
  AdminPageHeader,
  AdminRow,
  AdminSegmentedTabs
} from '@/components/features/admin'

type SettingsTab = 'general' | 'features' | 'appearance'

interface AppSettings {
  // General
  committee_name: string
  school_name: string
  academic_year: string
  committee_email: string | null
  committee_phone: string | null
  school_address: string | null
  school_logo_url: string | null

  // Features
  registration_enabled: boolean
  feedback_enabled: boolean
  vendors_require_password: boolean

  // Integrations
  google_drive_folder_id: string | null
  whatsapp_group_link: string | null

  // UI/UX
  primary_color: string
  secondary_color: string
  max_file_size_mb: number
  session_timeout_minutes: number
}

export default function AdminSettingsPage() {
  const t = useTranslations('admin.tasks.settings')
  const [activeTab, setActiveTab] = useState<SettingsTab>('general')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [settings, setSettings] = useState<AppSettings>({
    // General
    committee_name: 'ועד הורים',
    school_name: 'בית ספר יסודי',
    academic_year: '2024-2025',
    committee_email: null,
    committee_phone: null,
    school_address: null,
    school_logo_url: null,

    // Features
    registration_enabled: true,
    feedback_enabled: true,
    vendors_require_password: true,

    // Integrations
    google_drive_folder_id: null,
    whatsapp_group_link: null,

    // UI/UX
    primary_color: '#0D98BA',
    secondary_color: '#FF8200',
    max_file_size_mb: 10,
    session_timeout_minutes: 1440,
  })

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Try to verify password by making a test API call
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': password
        },
        body: JSON.stringify({})
      })

      if (response.status === 401) {
        toast.error(t('toast.wrongPassword'))
        setPassword('')
        return
      }

      setIsAuthenticated(true)
      fetchSettings()
    } catch (error) {
      toast.error(t('toast.authError'))
      setPassword('')
    }
  }

  async function fetchSettings() {
    setIsLoading(true)
    try {
      const response = await fetch('/api/settings')
      const data = await response.json()

      if (data.success && data.data) {
        setSettings(prev => ({ ...prev, ...data.data }))
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error(t('toast.loadError'))
    } finally {
      setIsLoading(false)
    }
  }

  async function saveSettings() {
    setIsSaving(true)
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': password
        },
        body: JSON.stringify(settings)
      })

      const data = await response.json()

      if (data.success) {
        toast.success(t('toast.saveSuccess'))
      } else {
        toast.error(data.error || t('toast.saveError'))
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error(t('toast.saveError'))
    } finally {
      setIsSaving(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="space-y-4">
        <AdminPageHeader title={t('title')} backHref="/admin/more" />
        <AdminFormSection>
          <div className="flex flex-col items-center text-center">
            <div className="mb-3 rounded-full bg-primary/10 p-3">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-[15px] font-bold text-[#003153]">{t('gate.title')}</h2>
            <p className="mt-0.5 text-sm text-gray-500">{t('gate.description')}</p>
          </div>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">{t('gate.passwordLabel')}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('gate.passwordPlaceholder')}
                className="text-center"
                autoFocus
              />
            </div>
            <Button type="submit" className="min-h-[44px] w-full bg-[#003153] hover:bg-[#003153]/90">
              <Key className="me-2 h-4 w-4" />
              {t('gate.enter')}
            </Button>
          </form>
        </AdminFormSection>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <AdminPageHeader title={t('title')} backHref="/admin/more" />
        <div className="space-y-3 rounded-2xl bg-white p-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded bg-gray-200" />
          ))}
        </div>
      </div>
    )
  }

  const colorField = (
    id: 'primary_color' | 'secondary_color',
    label: string,
    placeholder: string
  ) => (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex gap-2">
        <Input
          id={id}
          type="color"
          value={settings[id]}
          onChange={(e) => setSettings({ ...settings, [id]: e.target.value })}
          className="h-10 w-20"
        />
        <Input
          value={settings[id]}
          onChange={(e) => setSettings({ ...settings, [id]: e.target.value })}
          placeholder={placeholder}
          dir="ltr"
          className="text-start"
        />
      </div>
    </div>
  )

  const featureRows: {
    key: 'registration_enabled' | 'feedback_enabled' | 'vendors_require_password'
    label: string
    description: string
  }[] = [
    { key: 'registration_enabled', label: t('features.registration.label'), description: t('features.registration.description') },
    { key: 'feedback_enabled', label: t('features.feedback.label'), description: t('features.feedback.description') },
    { key: 'vendors_require_password', label: t('features.vendorsPassword.label'), description: t('features.vendorsPassword.description') },
  ]

  return (
    <div className="space-y-4">
      <AdminPageHeader title={t('title')} subtitle={t('subtitle')} backHref="/admin/more" />

      <AdminSegmentedTabs<SettingsTab>
        tabs={[
          { value: 'general', label: t('tabs.general') },
          { value: 'features', label: t('tabs.features') },
          { value: 'appearance', label: t('tabs.appearance') },
        ]}
        value={activeTab}
        onChange={setActiveTab}
      />

      {/* General Settings */}
      {activeTab === 'general' && (
        <AdminFormSection title={t('general.title')} description={t('general.description')}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="committee_name">{t('general.committeeName')}</Label>
              <Input
                id="committee_name"
                value={settings.committee_name}
                onChange={(e) => setSettings({ ...settings, committee_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="school_name">{t('general.schoolName')}</Label>
              <Input
                id="school_name"
                value={settings.school_name}
                onChange={(e) => setSettings({ ...settings, school_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="academic_year">{t('general.academicYear')}</Label>
              <Input
                id="academic_year"
                value={settings.academic_year}
                onChange={(e) => setSettings({ ...settings, academic_year: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="committee_email">{t('general.committeeEmail')}</Label>
              <Input
                id="committee_email"
                type="email"
                value={settings.committee_email || ''}
                onChange={(e) => setSettings({ ...settings, committee_email: e.target.value || null })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="committee_phone">{t('general.committeePhone')}</Label>
              <Input
                id="committee_phone"
                value={settings.committee_phone || ''}
                onChange={(e) => setSettings({ ...settings, committee_phone: e.target.value || null })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="school_address">{t('general.schoolAddress')}</Label>
              <Input
                id="school_address"
                value={settings.school_address || ''}
                onChange={(e) => setSettings({ ...settings, school_address: e.target.value || null })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp_group_link">{t('general.whatsappLink')}</Label>
              <Input
                id="whatsapp_group_link"
                value={settings.whatsapp_group_link || ''}
                onChange={(e) => setSettings({ ...settings, whatsapp_group_link: e.target.value || null })}
                placeholder="https://chat.whatsapp.com/..."
                dir="ltr"
                className="text-start"
              />
            </div>
          </div>
        </AdminFormSection>
      )}

      {/* Features Settings */}
      {activeTab === 'features' && (
        <AdminGroup title={t('features.title')} description={t('features.description')}>
          {featureRows.map((row) => (
            <AdminRow
              key={row.key}
              title={row.label}
              subtitle={row.description}
              testId={`admin-settings-feature-${row.key}`}
              trailing={
                <Switch
                  aria-label={row.label}
                  checked={settings[row.key]}
                  onCheckedChange={(checked) => setSettings({ ...settings, [row.key]: checked })}
                />
              }
            />
          ))}
        </AdminGroup>
      )}

      {/* Appearance Settings */}
      {activeTab === 'appearance' && (
        <AdminFormSection title={t('appearance.title')} description={t('appearance.description')}>
          {colorField('primary_color', t('appearance.primaryColor'), '#0D98BA')}
          {colorField('secondary_color', t('appearance.secondaryColor'), '#FF8200')}

          <div className="space-y-2">
            <Label htmlFor="max_file_size_mb">{t('appearance.maxFileSize')}</Label>
            <Input
              id="max_file_size_mb"
              type="number"
              min="1"
              max="100"
              value={settings.max_file_size_mb}
              onChange={(e) => setSettings({ ...settings, max_file_size_mb: parseInt(e.target.value) || 10 })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="session_timeout_minutes">{t('appearance.sessionTimeout')}</Label>
            <Input
              id="session_timeout_minutes"
              type="number"
              min="30"
              max="10080"
              value={settings.session_timeout_minutes}
              onChange={(e) => setSettings({ ...settings, session_timeout_minutes: parseInt(e.target.value) || 1440 })}
            />
            <p className="text-xs text-muted-foreground">{t('appearance.sessionTimeoutHint')}</p>
          </div>
        </AdminFormSection>
      )}

      {/* Save Button - sticks above the admin bottom bar */}
      <div className="sticky bottom-[calc(env(safe-area-inset-bottom,0px)+5.5rem)] z-30 flex justify-center">
        <Button
          onClick={saveSettings}
          disabled={isSaving}
          size="lg"
          className="min-h-[44px] bg-[#003153] shadow-lg hover:bg-[#003153]/90"
        >
          <Save className="me-2 h-5 w-5" />
          {isSaving ? t('saving') : t('saveAll')}
        </Button>
      </div>
    </div>
  )
}
