'use client'

import { useState } from 'react'
import { Settings, Save, Key, Bell, Globe, Calendar, Shield, Palette, Lock } from 'lucide-react'
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
  contact_email: string
  contact_phone: string

  // Features
  enable_google_calendar: boolean
  enable_anonymous_feedback: boolean
  enable_event_registrations: boolean
  enable_whatsapp_share: boolean
  require_approval_for_events: boolean
  require_approval_for_tasks: boolean

  // Notifications
  email_notifications: boolean
  whatsapp_notifications: boolean
  notification_email: string

  // Google Calendar
  google_calendar_id: string
  google_calendar_sync_interval: number

  // UI/UX
  theme_color: string
  enable_dark_mode: boolean
  items_per_page: number
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
    contact_email: 'committee@school.org',
    contact_phone: '050-1234567',

    // Features
    enable_google_calendar: true,
    enable_anonymous_feedback: true,
    enable_event_registrations: true,
    enable_whatsapp_share: true,
    require_approval_for_events: false,
    require_approval_for_tasks: false,

    // Notifications
    email_notifications: false,
    whatsapp_notifications: false,
    notification_email: '',

    // Google Calendar
    google_calendar_id: '',
    google_calendar_sync_interval: 15,

    // UI/UX
    theme_color: '#0D98BA',
    enable_dark_mode: false,
    items_per_page: 20,
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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">כללי</TabsTrigger>
          <TabsTrigger value="features">תכונות</TabsTrigger>
          <TabsTrigger value="notifications">התראות</TabsTrigger>
          <TabsTrigger value="integrations">אינטגרציות</TabsTrigger>
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
                  <Label htmlFor="contact_email">אימייל ליצירת קשר</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={settings.contact_email}
                    onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_phone">טלפון ליצירת קשר</Label>
                  <Input
                    id="contact_phone"
                    value={settings.contact_phone}
                    onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
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
                  <Label>סנכרון עם Google Calendar</Label>
                  <p className="text-sm text-muted-foreground">
                    סנכרון אוטומטי של אירועים עם לוח השנה של גוגל
                  </p>
                </div>
                <Switch
                  checked={settings.enable_google_calendar}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, enable_google_calendar: checked })
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
                  checked={settings.enable_anonymous_feedback}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, enable_anonymous_feedback: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>הרשמה לאירועים</Label>
                  <p className="text-sm text-muted-foreground">
                    אפשר הרשמה מקוונת לאירועים
                  </p>
                </div>
                <Switch
                  checked={settings.enable_event_registrations}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, enable_event_registrations: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>שיתוף ב-WhatsApp</Label>
                  <p className="text-sm text-muted-foreground">
                    הצג כפתורי שיתוף מהיר ל-WhatsApp
                  </p>
                </div>
                <Switch
                  checked={settings.enable_whatsapp_share}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, enable_whatsapp_share: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>אישור לאירועים</Label>
                  <p className="text-sm text-muted-foreground">
                    דרוש אישור מנהל לפני פרסום אירועים
                  </p>
                </div>
                <Switch
                  checked={settings.require_approval_for_events}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, require_approval_for_events: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>אישור למשימות</Label>
                  <p className="text-sm text-muted-foreground">
                    דרוש אישור מנהל לפני פרסום משימות
                  </p>
                </div>
                <Switch
                  checked={settings.require_approval_for_tasks}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, require_approval_for_tasks: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                הגדרות התראות
              </CardTitle>
              <CardDescription>
                ניהול התראות ועדכונים אוטומטיים
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>התראות מייל</Label>
                  <p className="text-sm text-muted-foreground">
                    שלח התראות במייל על פעילויות חשובות
                  </p>
                </div>
                <Switch
                  checked={settings.email_notifications}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, email_notifications: checked })
                  }
                />
              </div>

              {settings.email_notifications && (
                <div className="space-y-2 pr-4">
                  <Label htmlFor="notification_email">כתובת מייל להתראות</Label>
                  <Input
                    id="notification_email"
                    type="email"
                    value={settings.notification_email}
                    onChange={(e) => setSettings({ ...settings, notification_email: e.target.value })}
                    placeholder="example@school.org"
                  />
                </div>
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>התראות WhatsApp</Label>
                  <p className="text-sm text-muted-foreground">
                    שלח התראות ב-WhatsApp (דורש אינטגרציה)
                  </p>
                </div>
                <Switch
                  checked={settings.whatsapp_notifications}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, whatsapp_notifications: checked })
                  }
                  disabled
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Settings */}
        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                אינטגרציות חיצוניות
              </CardTitle>
              <CardDescription>
                חיבור לשירותים חיצוניים
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                  <Calendar className="h-8 w-8 text-blue-600" />
                  <div className="flex-1">
                    <h3 className="font-semibold">Google Calendar</h3>
                    <p className="text-sm text-muted-foreground">
                      סנכרון דו-כיווני עם לוח שנה של גוגל
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="google_calendar_id">מזהה לוח שנה (Calendar ID)</Label>
                  <Input
                    id="google_calendar_id"
                    value={settings.google_calendar_id}
                    onChange={(e) => setSettings({ ...settings, google_calendar_id: e.target.value })}
                    placeholder="example@group.calendar.google.com"
                    disabled={!settings.enable_google_calendar}
                  />
                  <p className="text-xs text-muted-foreground">
                    ניתן למצוא בהגדרות לוח השנה בגוגל
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sync_interval">תדירות סנכרון (דקות)</Label>
                  <Input
                    id="sync_interval"
                    type="number"
                    min="5"
                    max="60"
                    value={settings.google_calendar_sync_interval}
                    onChange={(e) => setSettings({ ...settings, google_calendar_sync_interval: parseInt(e.target.value) })}
                    disabled={!settings.enable_google_calendar}
                  />
                </div>
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
                <Label htmlFor="theme_color">צבע ראשי</Label>
                <div className="flex gap-2">
                  <Input
                    id="theme_color"
                    type="color"
                    value={settings.theme_color}
                    onChange={(e) => setSettings({ ...settings, theme_color: e.target.value })}
                    className="w-20 h-10"
                  />
                  <Input
                    value={settings.theme_color}
                    onChange={(e) => setSettings({ ...settings, theme_color: e.target.value })}
                    placeholder="#0D98BA"
                  />
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>מצב כהה</Label>
                  <p className="text-sm text-muted-foreground">
                    הפעל מצב כהה (בפיתוח)
                  </p>
                </div>
                <Switch
                  checked={settings.enable_dark_mode}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, enable_dark_mode: checked })
                  }
                  disabled
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="items_per_page">פריטים בעמוד</Label>
                <Input
                  id="items_per_page"
                  type="number"
                  min="10"
                  max="100"
                  step="10"
                  value={settings.items_per_page}
                  onChange={(e) => setSettings({ ...settings, items_per_page: parseInt(e.target.value) })}
                />
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
