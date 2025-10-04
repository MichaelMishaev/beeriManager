'use client'

import { useState } from 'react'
import { Settings, Save, Key, Shield, Palette, Lock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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
        toast.error('סיסמה שגויה')
        setPassword('')
        return
      }

      setIsAuthenticated(true)
      fetchSettings()
    } catch (error) {
      toast.error('שגיאה באימות')
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
      toast.error('שגיאה בטעינת ההגדרות')
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
        toast.success('ההגדרות נשמרו בהצלחה')
      } else {
        toast.error(data.error || 'שגיאה בשמירת ההגדרות')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('שגיאה בשמירת ההגדרות')
    } finally {
      setIsSaving(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Lock className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-center">גישה מוגבלת</CardTitle>
            <CardDescription className="text-center">
              נדרשת סיסמת מנהל לגישה להגדרות
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">סיסמת מנהל</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="הזן סיסמה"
                  className="text-center"
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full">
                <Key className="h-4 w-4 ml-2" />
                כניסה
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <Card>
          <CardContent className="p-8">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">הגדרות מערכת</h1>
          <p className="text-muted-foreground mt-2">
            ניהול הגדרות כלליות ותצורה של המערכת
          </p>
        </div>
        <Button onClick={saveSettings} disabled={isSaving}>
          <Save className="h-4 w-4 ml-2" />
          {isSaving ? 'שומר...' : 'שמור שינויים'}
        </Button>
      </div>

      <Tabs defaultValue="general" dir="rtl">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">כללי</TabsTrigger>
          <TabsTrigger value="features">תכונות</TabsTrigger>
          <TabsTrigger value="appearance">תצוגה</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                פרטי הועד
              </CardTitle>
              <CardDescription>
                מידע בסיסי על ועד ההורים ובית הספר
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="committee_name">שם הועד</Label>
                  <Input
                    id="committee_name"
                    value={settings.committee_name}
                    onChange={(e) => setSettings({ ...settings, committee_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="school_name">שם בית הספר</Label>
                  <Input
                    id="school_name"
                    value={settings.school_name}
                    onChange={(e) => setSettings({ ...settings, school_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="academic_year">שנת לימודים</Label>
                  <Input
                    id="academic_year"
                    value={settings.academic_year}
                    onChange={(e) => setSettings({ ...settings, academic_year: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="committee_email">אימייל הועד</Label>
                  <Input
                    id="committee_email"
                    type="email"
                    value={settings.committee_email || ''}
                    onChange={(e) => setSettings({ ...settings, committee_email: e.target.value || null })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="committee_phone">טלפון הועד</Label>
                  <Input
                    id="committee_phone"
                    value={settings.committee_phone || ''}
                    onChange={(e) => setSettings({ ...settings, committee_phone: e.target.value || null })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="school_address">כתובת בית הספר</Label>
                  <Input
                    id="school_address"
                    value={settings.school_address || ''}
                    onChange={(e) => setSettings({ ...settings, school_address: e.target.value || null })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp_group_link">קישור לקבוצת WhatsApp</Label>
                  <Input
                    id="whatsapp_group_link"
                    value={settings.whatsapp_group_link || ''}
                    onChange={(e) => setSettings({ ...settings, whatsapp_group_link: e.target.value || null })}
                    placeholder="https://chat.whatsapp.com/..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Settings */}
        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                הפעלת תכונות
              </CardTitle>
              <CardDescription>
                בחר אילו תכונות להפעיל במערכת
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>הרשמה לאירועים</Label>
                  <p className="text-sm text-muted-foreground">
                    אפשר להורים להירשם לאירועים
                  </p>
                </div>
                <Switch
                  checked={settings.registration_enabled}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, registration_enabled: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>משוב אנונימי</Label>
                  <p className="text-sm text-muted-foreground">
                    אפשר להורים לשלוח משוב באופן אנונימי
                  </p>
                </div>
                <Switch
                  checked={settings.feedback_enabled}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, feedback_enabled: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>סיסמה לספקים</Label>
                  <p className="text-sm text-muted-foreground">
                    דרוש סיסמה לגישה לדף הספקים
                  </p>
                </div>
                <Switch
                  checked={settings.vendors_require_password}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, vendors_require_password: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>


        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                מראה וחוויית משתמש
              </CardTitle>
              <CardDescription>
                התאמה אישית של הממשק
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="primary_color">צבע ראשי</Label>
                <div className="flex gap-2">
                  <Input
                    id="primary_color"
                    type="color"
                    value={settings.primary_color}
                    onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                    className="w-20 h-10"
                  />
                  <Input
                    value={settings.primary_color}
                    onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                    placeholder="#0D98BA"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="secondary_color">צבע משני</Label>
                <div className="flex gap-2">
                  <Input
                    id="secondary_color"
                    type="color"
                    value={settings.secondary_color}
                    onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                    className="w-20 h-10"
                  />
                  <Input
                    value={settings.secondary_color}
                    onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                    placeholder="#FF8200"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="max_file_size_mb">גודל קובץ מקסימלי (MB)</Label>
                <Input
                  id="max_file_size_mb"
                  type="number"
                  min="1"
                  max="100"
                  value={settings.max_file_size_mb}
                  onChange={(e) => setSettings({ ...settings, max_file_size_mb: parseInt(e.target.value) || 10 })}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="session_timeout_minutes">זמן פג תוקף הפעלה (דקות)</Label>
                <Input
                  id="session_timeout_minutes"
                  type="number"
                  min="30"
                  max="10080"
                  value={settings.session_timeout_minutes}
                  onChange={(e) => setSettings({ ...settings, session_timeout_minutes: parseInt(e.target.value) || 1440 })}
                />
                <p className="text-xs text-muted-foreground">
                  1440 דקות = 24 שעות
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button - Fixed at bottom */}
      <div className="sticky bottom-4 flex justify-center">
        <Button
          onClick={saveSettings}
          disabled={isSaving}
          size="lg"
          className="shadow-lg"
        >
          <Save className="h-5 w-5 ml-2" />
          {isSaving ? 'שומר...' : 'שמור את כל השינויים'}
        </Button>
      </div>
    </div>
  )
}
