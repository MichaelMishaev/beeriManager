'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Bell, Send, Users, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { logger } from '@/lib/logger'
import { createClient } from '@/lib/supabase/client'

interface NotificationStats {
  totalSubscriptions: number
  activeSubscriptions: number
  lastSent?: Date
}

export default function NotificationsPage() {
  const [stats, setStats] = useState<NotificationStats>({
    totalSubscriptions: 0,
    activeSubscriptions: 0,
  })
  const [isSending, setIsSending] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    url: '/',
  })
  const t = useTranslations('notifications')
  const { toast } = useToast()

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    try {
      const supabase = createClient()

      const { data, error, count } = await supabase
        .from('push_subscriptions')
        .select('*', { count: 'exact', head: false })

      if (error) {
        console.error('Failed to load stats:', error)
        return
      }

      const active = data?.filter(sub => sub.is_active).length || 0

      setStats({
        totalSubscriptions: count || 0,
        activeSubscriptions: active,
      })
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  async function handleSendNotification(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.title || !formData.body) {
      toast({
        title: t('validationError') || 'שגיאת אימות',
        description: t('titleAndBodyRequired') || 'נדרשים כותרת וטקסט',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsSending(true)

      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          body: formData.body,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-96x96.png',
          data: {
            url: formData.url,
          },
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send notification')
      }

      logger.userAction('Sent push notification', {
        sent: result.sent,
        failed: result.failed,
      })

      toast({
        title: t('notificationSent') || 'ההתראה נשלחה',
        description: `${t('sentTo') || 'נשלח ל'} ${result.sent} ${t('subscribers') || 'מנויים'}`,
      })

      // Reset form
      setFormData({
        title: '',
        body: '',
        url: '/',
      })

      // Reload stats
      await loadStats()
    } catch (error) {
      console.error('Failed to send notification:', error)
      logger.error('Send notification failed', { error })

      toast({
        title: t('sendFailed') || 'השליחה נכשלה',
        description: t('sendFailedDescription') || 'אנא נסה שנית',
        variant: 'destructive',
      })
    } finally {
      setIsSending(false)
    }
  }

  async function sendTestNotification() {
    setFormData({
      title: 'התראת בדיקה',
      body: 'זוהי התראת בדיקה מוועד ההורים. אם אתם רואים את ההודעה, המערכת עובדת תקין!',
      url: '/',
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="h-8 w-8" />
            {t('title') || 'התראות Push'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t('description') || 'שלח התראות לכל ההורים שהתקינו את האפליקציה'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('totalSubscribers') || 'סה"כ מנויים'}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSubscriptions}</div>
              <p className="text-xs text-muted-foreground">
                {t('totalSubscribersDescription') || 'משתמשים רשומים להתראות'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('activeSubscribers') || 'מנויים פעילים'}
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
              <p className="text-xs text-muted-foreground">
                {t('activeSubscribersDescription') || 'יקבלו התראות'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('inactiveSubscribers') || 'מנויים לא פעילים'}
              </CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalSubscriptions - stats.activeSubscriptions}
              </div>
              <p className="text-xs text-muted-foreground">
                {t('inactiveSubscribersDescription') || 'לא יקבלו התראות'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Send Notification Form */}
        <Card>
          <CardHeader>
            <CardTitle>{t('sendNotification') || 'שלח התראה חדשה'}</CardTitle>
            <CardDescription>
              {t('sendNotificationDescription') || 'ההתראה תישלח לכל המנויים הפעילים'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSendNotification} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">{t('notificationTitle') || 'כותרת'} *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={t('titlePlaceholder') || 'לדוגמה: אירוע חדש נוסף'}
                  required
                  maxLength={50}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.title.length}/50 {t('characters') || 'תווים'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="body">{t('notificationBody') || 'תוכן ההתראה'} *</Label>
                <Textarea
                  id="body"
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  placeholder={t('bodyPlaceholder') || 'לדוגמה: נוסף אירוע חדש ללוח השנה - טיול שנתי 2025'}
                  required
                  maxLength={200}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.body.length}/200 {t('characters') || 'תווים'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="url">{t('notificationUrl') || 'קישור (אופציונלי)'}</Label>
                <Input
                  id="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="/"
                />
                <p className="text-xs text-muted-foreground">
                  {t('urlDescription') || 'הדף שייפתח בלחיצה על ההתראה'}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={isSending || stats.activeSubscriptions === 0}
                  className="flex-1"
                >
                  <Send className="h-4 w-4 ml-2" />
                  {isSending
                    ? t('sending') || 'שולח...'
                    : `${t('send') || 'שלח'} (${stats.activeSubscriptions} ${t('subscribers') || 'מנויים'})`}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={sendTestNotification}
                >
                  {t('testNotification') || 'התראת בדיקה'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>{t('quickTemplates') || 'תבניות מהירות'}</CardTitle>
            <CardDescription>
              {t('quickTemplatesDescription') || 'לחץ להעתקת תבנית'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => setFormData({
                  title: 'אירוע חדש',
                  body: 'אירוע חדש נוסף ללוח השנה. לחצו לצפייה בפרטים.',
                  url: '/events',
                })}
              >
                📅 אירוע חדש
              </Button>

              <Button
                variant="outline"
                className="justify-start"
                onClick={() => setFormData({
                  title: 'משימה חדשה',
                  body: 'משימה חדשה נוספה. בדקו את רשימת המשימות שלכם.',
                  url: '/tasks',
                })}
              >
                ✅ משימה חדשה
              </Button>

              <Button
                variant="outline"
                className="justify-start"
                onClick={() => setFormData({
                  title: 'פרוטוקול חדש',
                  body: 'פרוטוקול ישיבה חדש פורסם. לחצו לקריאה.',
                  url: '/protocols',
                })}
              >
                📄 פרוטוקול חדש
              </Button>

              <Button
                variant="outline"
                className="justify-start"
                onClick={() => setFormData({
                  title: 'תזכורת',
                  body: 'תזכורת לאירוע הקרוב. נשמח לראותכם!',
                  url: '/events',
                })}
              >
                ⏰ תזכורת
              </Button>

              <Button
                variant="outline"
                className="justify-start bg-yellow-50 hover:bg-yellow-100 border-yellow-200"
                onClick={() => setFormData({
                  title: '👕 תזכורת: חולצה לבנה מחר!',
                  body: 'שלום הורים יקרים, מחר יום חולצה לבנה! אנא וודאו שילדכם מגיע עם חולצה לבנה לבית הספר.',
                  url: '/',
                })}
              >
                👕 חולצה לבנה מחר
              </Button>

              <Button
                variant="outline"
                className="justify-start bg-yellow-50 hover:bg-yellow-100 border-yellow-200"
                onClick={() => setFormData({
                  title: '👕 תזכורת: חולצה לבנה השבוע',
                  body: 'שלום הורים יקרים, השבוע יש יום חולצה לבנה! אנא וודאו שילדכם מגיע עם חולצה לבנה לבית הספר.',
                  url: '/',
                })}
              >
                👕 חולצה לבנה השבוע
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info */}
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="space-y-2 text-sm">
              <p className="font-medium">💡 {t('tips') || 'טיפים לשליחת התראות:'}</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>{t('tip1') || 'כתבו כותרת קצרה וברורה (עד 50 תווים)'}</li>
                <li>{t('tip2') || 'הוסיפו פרטים חשובים בתוכן (עד 200 תווים)'}</li>
                <li>{t('tip3') || 'הוסיפו קישור לעמוד הרלוונטי'}</li>
                <li>{t('tip4') || 'אל תשלחו יותר מדי התראות - שמרו על איזון'}</li>
                <li>{t('tip5') || 'השתמשו בהתראות לעדכונים חשובים בלבד'}</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
