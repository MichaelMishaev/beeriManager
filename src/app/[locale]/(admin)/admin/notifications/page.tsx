'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import {
  CalendarPlus,
  CheckCircle,
  CheckSquare,
  Clock,
  FileText,
  Lightbulb,
  Send,
  Shirt,
  Users,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AdminFormSection,
  AdminGroup,
  AdminPageHeader,
  AdminRow,
} from '@/components/features/admin'
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
  const t = useTranslations('admin.messaging.push')
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
        title: t('toast.validationError'),
        description: t('toast.titleAndBodyRequired'),
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
        title: t('toast.sent'),
        description: t('toast.sentTo', { count: result.sent }),
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
        title: t('toast.sendFailed'),
        description: t('toast.sendFailedDescription'),
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

  const templates = [
    {
      key: 'newEvent',
      icon: CalendarPlus,
      iconClassName: undefined,
      // Payload text is data: it is what gets sent to subscribers, not admin UI text
      data: { title: 'אירוע חדש', body: 'אירוע חדש נוסף ללוח השנה. לחצו לצפייה בפרטים.', url: '/events' },
    },
    {
      key: 'newTask',
      icon: CheckSquare,
      iconClassName: undefined,
      data: { title: 'משימה חדשה', body: 'משימה חדשה נוספה. בדקו את רשימת המשימות שלכם.', url: '/tasks' },
    },
    {
      key: 'newProtocol',
      icon: FileText,
      iconClassName: undefined,
      data: { title: 'פרוטוקול חדש', body: 'פרוטוקול ישיבה חדש פורסם. לחצו לקריאה.', url: '/protocols' },
    },
    {
      key: 'reminder',
      icon: Clock,
      iconClassName: undefined,
      data: { title: 'תזכורת', body: 'תזכורת לאירוע הקרוב. נשמח לראותכם!', url: '/events' },
    },
    {
      key: 'whiteShirtTomorrow',
      icon: Shirt,
      iconClassName: 'bg-[#FFBA00]/25 text-[#8a5a00]',
      data: {
        title: '👕 תזכורת: חולצה לבנה מחר!',
        body: 'שלום הורים יקרים, מחר יום חולצה לבנה! אנא וודאו שילדכם מגיע עם חולצה לבנה לבית הספר.',
        url: '/',
      },
    },
    {
      key: 'whiteShirtWeek',
      icon: Shirt,
      iconClassName: 'bg-[#FFBA00]/25 text-[#8a5a00]',
      data: {
        title: '👕 תזכורת: חולצה לבנה השבוע',
        body: 'שלום הורים יקרים, השבוע יש יום חולצה לבנה! אנא וודאו שילדכם מגיע עם חולצה לבנה לבית הספר.',
        url: '/',
      },
    },
  ] as const

  const fieldHint = 'text-xs text-gray-500'

  return (
    <div className="space-y-5">
      <AdminPageHeader title={t('title')} subtitle={t('description')} backHref="/admin/more" />

      {/* Stats */}
      <AdminGroup>
        <AdminRow
          icon={Users}
          title={t('stats.total')}
          subtitle={t('stats.totalHint')}
          trailing={<span className="text-xl font-bold text-[#003153]">{stats.totalSubscriptions}</span>}
        />
        <AdminRow
          icon={CheckCircle}
          iconClassName="bg-[#d1fae5] text-[#065f46]"
          title={t('stats.active')}
          subtitle={t('stats.activeHint')}
          trailing={<span className="text-xl font-bold text-[#003153]">{stats.activeSubscriptions}</span>}
        />
        <AdminRow
          icon={XCircle}
          title={t('stats.inactive')}
          subtitle={t('stats.inactiveHint')}
          trailing={
            <span className="text-xl font-bold text-[#003153]">
              {stats.totalSubscriptions - stats.activeSubscriptions}
            </span>
          }
        />
      </AdminGroup>

      {/* Send Notification Form */}
      <form onSubmit={handleSendNotification} className="space-y-3">
        <AdminFormSection title={t('form.title')} description={t('form.description')}>
          <div className="space-y-2">
            <Label htmlFor="title">{t('form.notificationTitle')} *</Label>
            <Input
              id="title"
              className="h-11"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={t('form.titlePlaceholder')}
              required
              maxLength={50}
            />
            <p className={fieldHint}>
              {formData.title.length}/50 {t('form.characters')}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">{t('form.notificationBody')} *</Label>
            <Textarea
              id="body"
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              placeholder={t('form.bodyPlaceholder')}
              required
              maxLength={200}
              rows={4}
            />
            <p className={fieldHint}>
              {formData.body.length}/200 {t('form.characters')}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">{t('form.notificationUrl')}</Label>
            <Input
              id="url"
              className="h-11"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="/"
            />
            <p className={fieldHint}>{t('form.urlHint')}</p>
          </div>
        </AdminFormSection>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="submit"
            disabled={isSending || stats.activeSubscriptions === 0}
            className="min-h-[44px] flex-1"
          >
            <Send className="me-2 h-4 w-4 rtl:-scale-x-100" />
            {isSending ? t('form.sending') : t('form.send', { count: stats.activeSubscriptions })}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="min-h-[44px]"
            onClick={sendTestNotification}
          >
            {t('form.test')}
          </Button>
        </div>
      </form>

      {/* Quick Templates */}
      <AdminGroup title={t('templates.title')} description={t('templates.description')}>
        {templates.map((tpl) => (
          <AdminRow
            key={tpl.key}
            icon={tpl.icon}
            iconClassName={tpl.iconClassName}
            title={t(`templates.${tpl.key}`)}
            onClick={() => setFormData({ ...tpl.data })}
          />
        ))}
      </AdminGroup>

      {/* Tips */}
      <AdminFormSection>
        <div className="space-y-2 text-sm">
          <p className="flex items-center gap-2 font-medium text-[#003153]">
            <Lightbulb className="h-4 w-4 text-[#FFBA00]" aria-hidden="true" />
            {t('tips.title')}
          </p>
          <ul className="list-inside list-disc space-y-1 text-gray-600">
            <li>{t('tips.tip1')}</li>
            <li>{t('tips.tip2')}</li>
            <li>{t('tips.tip3')}</li>
            <li>{t('tips.tip4')}</li>
            <li>{t('tips.tip5')}</li>
          </ul>
        </div>
      </AdminFormSection>
    </div>
  )
}
