import type { ShareData } from '@/components/ui/share-button'
import type { Event } from '@/types'

// Protocol share data formatter
export function formatProtocolShareData(
  protocol: {
    id: string
    title: string
    protocol_date: string
  },
  locale: 'he' | 'ru' = 'he'
): ShareData {
  const url = `https://beeri.online/${locale}/protocols/${protocol.id}`
  const date = new Date(protocol.protocol_date)
  const formattedDate = date.toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'he-IL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  const portalText = locale === 'ru'
    ? '\n\n📢 Не пропустите обновления! Заходите на портал:\n🌐 https://beeri.online/ru'
    : '\n\n📢 אל תפספסו שום עדכון! בקרו בפורטל:\n🌐 https://beeri.online/he'

  const text = `📋 *${protocol.title}*\n\n📅 ${formattedDate}\n\n🔗 ${locale === 'ru' ? 'Посмотреть полный протокол:' : 'לצפייה בפרוטוקול המלא:'}${portalText}`

  return { title: protocol.title, text, url }
}

// Vendor share data formatter
export function formatVendorShareData(
  vendor: {
    id: string
    name: string
    category: string
    phone?: string | null
    email?: string | null
    description?: string | null
  },
  locale: 'he' | 'ru' = 'he'
): ShareData {
  const url = `https://beeri.online/${locale}/vendors/${vendor.id}`

  const categoryLabels: Record<string, string> = {
    catering: '🍕 קייטרינג',
    equipment: '📦 ציוד',
    entertainment: '🎭 בידור',
    transportation: '🚌 הסעות',
    venue: '🏛️ אולמות',
    photography: '📷 צילום',
    printing: '🖨️ הדפסה',
    other: '🏪 אחר'
  }

  let text = `🏪 *${vendor.name}*\n\n`
  text += `📂 ${categoryLabels[vendor.category] || vendor.category}\n\n`

  if (vendor.description) {
    text += `📝 ${vendor.description}\n\n`
  }

  if (vendor.phone) {
    text += `📞 ${vendor.phone}\n`
  }

  if (vendor.email) {
    text += `📧 ${vendor.email}\n`
  }

  const portalText = locale === 'ru'
    ? '\n\n📢 Не пропустите обновления! Заходите на портал:\n🌐 https://beeri.online/ru'
    : '\n\n📢 אל תפספסו שום עדכון! בקרו בפורטל:\n🌐 https://beeri.online/he'

  text += `\n🔗 ${locale === 'ru' ? 'Подробнее:' : 'לפרטים נוספים:'}${portalText}`

  return { title: vendor.name, text, url }
}

// Event share data formatter
export function formatEventShareData(
  event: Event,
  locale: 'he' | 'ru' = 'he'
): ShareData {
  const url = `https://beeri.online/${locale}/events/${event.id}`
  const startDate = new Date(event.start_datetime)
  const localeCode = locale === 'ru' ? 'ru-RU' : 'he-IL'

  const eventTypeLabels: Record<string, Record<string, string>> = {
    he: {
      'meeting': 'ישיבה',
      'fundraiser': 'גיוס כספים',
      'general': 'כללי',
      'social': 'חברתי',
      'educational': 'חינוכי',
      'trip': 'טיול',
      'workshop': 'סדנה'
    },
    ru: {
      'meeting': 'Встреча',
      'fundraiser': 'Сбор средств',
      'general': 'Общее',
      'social': 'Социальное',
      'educational': 'Образовательное',
      'trip': 'Поездка',
      'workshop': 'Мастер-класс'
    }
  }

  const t = {
    type: locale === 'ru' ? 'Тип' : 'סוג',
    location: locale === 'ru' ? 'Место' : 'מיקום',
    viewFull: locale === 'ru' ? 'Полная информация' : 'לצפייה מלאה'
  }

  // Get localized content
  const title = (locale === 'ru' && event.title_ru) ? event.title_ru : event.title
  const description = (locale === 'ru' && event.description_ru) ? event.description_ru : event.description
  const location = (locale === 'ru' && event.location_ru) ? event.location_ru : event.location
  const eventType = eventTypeLabels[locale][event.event_type] || event.event_type

  // Format date and time
  const dateStr = startDate.toLocaleDateString(localeCode, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const timeStr = startDate.toLocaleTimeString(localeCode, {
    hour: '2-digit',
    minute: '2-digit'
  })

  // Add end time if available
  let timeDisplay = `⏰ ${timeStr}`
  if (event.end_datetime) {
    const endDate = new Date(event.end_datetime)
    const endTimeStr = endDate.toLocaleTimeString(localeCode, {
      hour: '2-digit',
      minute: '2-digit'
    })
    timeDisplay += ` - ${endTimeStr}`
  }

  // Build location text
  const locationText = location ? `\n📍 ${t.location}: ${location}` : ''

  // Build description text - show full description
  const descriptionText = description
    ? `\n\n${description}`
    : ''

  const text = `📅 *${title}*\n\n🏷️ ${t.type}: ${eventType}\n📆 ${dateStr}\n${timeDisplay}${locationText}${descriptionText}\n\n🔗 ${t.viewFull}:`

  return { title, text, url }
}

// Task share data formatter
export function formatTaskShareData(
  task: {
    id: string
    title: string
    description?: string | null
    due_date?: string | null
    priority?: string | null
    assigned_to?: string[] | null
    status?: string | null
  },
  locale: 'he' | 'ru' = 'he'
): ShareData {
  const url = `https://beeri.online/${locale}/tasks`

  const priorityLabels: Record<string, Record<string, string>> = {
    he: { high: 'גבוהה', medium: 'בינונית', low: 'נמוכה' },
    ru: { high: 'Высокий', medium: 'Средний', low: 'Низкий' }
  }

  const statusLabels: Record<string, Record<string, string>> = {
    he: { todo: 'לביצוע', 'in-progress': 'בתהליך', done: 'הושלם' },
    ru: { todo: 'К выполнению', 'in-progress': 'В процессе', done: 'Выполнено' }
  }

  let text = `✅ *${task.title}*\n\n`

  if (task.description) {
    text += `📝 ${task.description.slice(0, 100)}${task.description.length > 100 ? '...' : ''}\n\n`
  }

  if (task.due_date) {
    const dueDate = new Date(task.due_date)
    const formattedDate = dueDate.toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'he-IL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
    text += `📅 ${locale === 'ru' ? 'Срок:' : 'תאריך יעד:'} ${formattedDate}\n`
  }

  if (task.priority) {
    text += `⚡ ${locale === 'ru' ? 'Приоритет:' : 'עדיפות:'} ${priorityLabels[locale][task.priority] || task.priority}\n`
  }

  if (task.status) {
    text += `📊 ${locale === 'ru' ? 'Статус:' : 'סטטוס:'} ${statusLabels[locale][task.status] || task.status}\n`
  }

  if (task.assigned_to && task.assigned_to.length > 0) {
    text += `👤 ${locale === 'ru' ? 'Ответственный:' : 'אחראי:'} ${task.assigned_to.join(', ')}\n`
  }

  const portalText = locale === 'ru'
    ? '\n📢 Не пропустите обновления! Заходите на портал:\n🌐 https://beeri.online/ru'
    : '\n📢 אל תפספסו שום עדכון! בקרו בפורטל:\n🌐 https://beeri.online/he'

  text += portalText

  return { title: task.title, text, url }
}

// Issue share data formatter
export function formatIssueShareData(
  issue: {
    id: string
    title: string
    description?: string | null
    status?: string | null
    priority?: string | null
    category?: string | null
  },
  locale: 'he' | 'ru' = 'he'
): ShareData {
  const url = `https://beeri.online/${locale}/issues/${issue.id}`

  const statusLabels: Record<string, Record<string, string>> = {
    he: { open: 'פתוח', 'in-progress': 'בטיפול', resolved: 'נפתר', closed: 'סגור' },
    ru: { open: 'Открыто', 'in-progress': 'В работе', resolved: 'Решено', closed: 'Закрыто' }
  }

  const priorityEmojis: Record<string, string> = {
    critical: '🔴',
    high: '🟠',
    medium: '🟡',
    low: '🟢'
  }

  let text = `📋 *${issue.title}*\n\n`

  if (issue.description) {
    text += `${issue.description.slice(0, 150)}${issue.description.length > 150 ? '...' : ''}\n\n`
  }

  if (issue.status) {
    text += `📊 ${locale === 'ru' ? 'Статус:' : 'סטטוס:'} ${statusLabels[locale][issue.status] || issue.status}\n`
  }

  if (issue.priority) {
    text += `${priorityEmojis[issue.priority] || '⚪'} ${locale === 'ru' ? 'Приоритет:' : 'עדיפות:'} ${issue.priority}\n`
  }

  text += `\n🔗 ${locale === 'ru' ? 'Подробнее:' : 'לפרטים נוספים:'}`

  const portalText = locale === 'ru'
    ? '\n\n📢 Не пропустите обновления! Заходите на портал:\n🌐 https://beeri.online/ru'
    : '\n\n📢 אל תפספסו שום עדכון! בקרו בפורטל:\n🌐 https://beeri.online/he'

  text += portalText

  return { title: issue.title, text, url }
}

// Feedback share data formatter
export function formatFeedbackShareData(
  feedback: {
    id: string
    category: string
    subject?: string
    message: string
    created_at: string
  },
  locale: 'he' | 'ru' = 'he'
): ShareData {
  const categoryLabels: Record<string, Record<string, string>> = {
    he: {
      general: 'כללי',
      event: 'אירוע',
      task: 'משימה',
      suggestion: 'הצעה',
      complaint: 'פניה',
      other: 'אחר'
    },
    ru: {
      general: 'Общее',
      event: 'Событие',
      task: 'Задача',
      suggestion: 'Предложение',
      complaint: 'Обращение',
      other: 'Другое'
    }
  }

  const categoryEmojis: Record<string, string> = {
    general: '💬',
    event: '📅',
    task: '✅',
    suggestion: '💡',
    complaint: '⚠️',
    other: '📝'
  }

  const emoji = categoryEmojis[feedback.category] || '📝'
  const feedbackTitle = locale === 'ru' ? 'Отзыв от родителей' : 'משוב מהורים'
  const typeLabel = locale === 'ru' ? 'Тип:' : 'סוג:'
  const subjectLabel = locale === 'ru' ? 'Тема:' : 'נושא:'
  const dateLabel = locale === 'ru' ? 'Дата:' : 'תאריך:'

  const date = new Date(feedback.created_at)
  const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`

  let text = `${emoji} *${feedbackTitle}*\n\n`
  text += `*${typeLabel}* ${categoryLabels[locale]?.[feedback.category] || feedback.category}\n`

  if (feedback.subject) {
    text += `*${subjectLabel}* ${feedback.subject}\n`
  }

  text += `*${dateLabel}* ${formattedDate}\n`
  text += `\n-------------------\n\n`
  text += `${feedback.message}\n`
  text += `\n-------------------\n`

  const portalText = locale === 'ru'
    ? '📢 Не пропустите обновления! Заходите на портал:\n🌐 https://beeri.online/ru'
    : '📢 אל תפספסו שום עדכון! בקרו בפורטל:\n🌐 https://beeri.online/he'

  text += portalText

  return { title: feedbackTitle, text }
}

// Committee share data formatter
export function formatCommitteeShareData(
  committee: {
    id: string
    name: string
    description?: string
    members?: string[]
    responsibilities?: string[]
  },
  locale: 'he' | 'ru' = 'he'
): ShareData {
  const url = `https://beeri.online/${locale}/committees`

  let text = `🏛️ *${committee.name}*\n`

  if (committee.description) {
    text += `\n${committee.description}\n`
  }

  if (committee.members && committee.members.length > 0) {
    text += `\n👥 ${locale === 'ru' ? 'Члены комитета' : 'חברי ועדה'}: ${committee.members.join(', ')}`
  }

  if (committee.responsibilities && committee.responsibilities.length > 0) {
    text += `\n📋 ${locale === 'ru' ? 'Обязанности' : 'תחומי אחריות'}: ${committee.responsibilities.join(', ')}`
  }

  const portalText = locale === 'ru'
    ? '\n\n🔗 Подробнее:\n📢 Не пропустите обновления! Заходите на портал:\n🌐 https://beeri.online/ru'
    : '\n\n🔗 לצפייה מלאה:\n📢 אל תפספסו שום עדכון! בקרו בפורטל:\n🌐 https://beeri.online/he'

  text += portalText

  return { title: committee.name, text, url }
}

// Highlight share data formatter
export function formatHighlightShareData(
  highlight: {
    icon: string
    title_he: string
    title_ru: string
    description_he: string
    description_ru: string
    category_he: string
    category_ru: string
    event_date?: string
  },
  locale: 'he' | 'ru' = 'he'
): ShareData {
  const title = locale === 'ru' ? highlight.title_ru : highlight.title_he
  const description = locale === 'ru' ? highlight.description_ru : highlight.description_he
  const category = locale === 'ru' ? highlight.category_ru : highlight.category_he
  const url = `https://beeri.online/${locale}`

  let text = `${highlight.icon} ${title}\n\n`

  if (category) {
    text += `📌 ${category}\n\n`
  }

  text += `${description}\n\n`

  if (highlight.event_date) {
    const eventDate = new Date(highlight.event_date)
    const formattedDate = eventDate.toLocaleDateString(
      locale === 'ru' ? 'ru-RU' : 'he-IL',
      { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
    )
    text += `📅 ${formattedDate}\n\n`
  }

  const portalText = locale === 'ru'
    ? '📢 Не пропустите обновления! Заходите на портал:\n🌐'
    : '📢 אל תפספסו שום עדכון! בקרו בפורטל:\n🌐'

  text += portalText

  return { title, text, url }
}

// Ideas share data formatter
export function formatIdeasShareData(locale: 'he' | 'ru' = 'he'): ShareData {
  const title = locale === 'ru' ? 'Есть идеи?' : 'יש לכם רעיון?'

  const text = locale === 'ru'
    ? `💡 *Есть идеи?*

Поделитесь своими идеями для улучшения и новых функций!

Ваши идеи помогают нам улучшать и адаптировать систему к вашим потребностям. Каждая идея рассматривается!

🔗 *Отправить идею:*
https://beeri.online/ideas

📢 Не пропустите обновления! Заходите на портал:
🌐 https://beeri.online/ru`
    : `💡 *יש לכם רעיון?*

שתפו אותנו ברעיונות לשיפור ותכונות חדשות!

הרעיונות שלכם עוזרים לנו לשפר ולהתאים את המערכת לצרכים שלכם. כל רעיון נבדק ונשקל!

🔗 *שליחת רעיון:*
https://beeri.online/ideas

📢 אל תפספסו שום עדכון! בקרו בפורטל:
🌐 https://beeri.online/he`

  return { title, text }
}

// Holiday share data formatter
export function formatHolidayShareData(
  holiday: {
    hebrew_name: string
    hebrew_date?: string | null
    start_date: string
    end_date: string
    is_school_closed?: boolean
  },
  locale: 'he' | 'ru' = 'he'
): ShareData {
  const startDate = new Date(holiday.start_date)
  const endDate = new Date(holiday.end_date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const startDateNorm = new Date(startDate)
  startDateNorm.setHours(0, 0, 0, 0)

  const isTomorrow = startDateNorm.getTime() === tomorrow.getTime()
  const isToday = startDateNorm.getTime() === today.getTime()

  let whenText = ''
  if (isToday) {
    whenText = locale === 'ru' ? '🔴 СЕГОДНЯ' : '🔴 היום'
  } else if (isTomorrow) {
    whenText = locale === 'ru' ? '⚠️ ЗАВТРА' : '⚠️ מחר'
  } else {
    const formattedDate = startDate.toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'he-IL', {
      day: 'numeric',
      month: 'long'
    })
    whenText = `📅 ${formattedDate}`
  }

  const schoolClosedText = holiday.is_school_closed
    ? (locale === 'ru' ? '\n🏫 ШКОЛА ЗАКРЫТА' : '\n🏫 בית הספר סגור')
    : ''
  const hebrewDate = holiday.hebrew_date ? `\n(${holiday.hebrew_date})` : ''

  let dateRange = ''
  if (holiday.start_date !== holiday.end_date) {
    const endFormatted = endDate.toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'he-IL', {
      day: 'numeric',
      month: 'long'
    })
    const rangeText = locale === 'ru' ? 'по' : 'עד'
    dateRange = `\n${rangeText} ${endFormatted}`
  }

  const portalText = locale === 'ru'
    ? '\n\n📢 Не пропустите обновления! Заходите на портал:\n🌐 https://beeri.online/ru'
    : '\n\n📢 אל תפספסו שום עדכון! בקרו בפורטל:\n🌐 https://beeri.online/he'

  const text = `${whenText}\n\n*${holiday.hebrew_name}*${hebrewDate}${dateRange}${schoolClosedText}${portalText}`

  return {
    title: holiday.hebrew_name,
    text,
    url: `https://beeri.online/${locale}`
  }
}

// Committee representatives share data formatter
export function formatCommitteeRepresentativesShareData(
  members: Array<{ grade: string; name: string }>,
  locale: 'he' | 'ru' = 'he'
): ShareData {
  const RLM = '\u200F'
  const url = `https://beeri.online/${locale}`

  // Group by grade level
  const grouped = members.reduce((acc, member) => {
    const gradeLevel = member.grade[0]
    if (!acc[gradeLevel]) {
      acc[gradeLevel] = []
    }
    acc[gradeLevel].push(member)
    return acc
  }, {} as Record<string, typeof members>)

  const title = locale === 'ru' ? 'Представители родительского комитета' : 'נציגי ועד ההורים'

  const text = locale === 'ru'
    ? `${title}\n\n${Object.entries(grouped).map(([gradeLevel, gradeMembers]) =>
        `${gradeLevel} класс:\n${gradeMembers.map(m => `${m.name} - ${m.grade}${RLM}`).join('\n')}`
      ).join('\n\n')}\n\n📢 Не пропустите обновления! Заходите на портал:\n🌐 ${url}`
    : `${title}\n\n${Object.entries(grouped).map(([gradeLevel, gradeMembers]) =>
        `${gradeLevel}׳:\n${gradeMembers.map(m => `${m.name} - ${m.grade}${RLM}`).join('\n')}`
      ).join('\n\n')}\n\n📢 אל תפספסו שום עדכון! בקרו בפורטל:\n🌐 ${url}`

  return { title, text, url }
}

// All Holidays share data formatter
export function formatAllHolidaysShareData(
  holidays: Array<{
    hebrew_name: string
    hebrew_date?: string | null
    start_date: string
    end_date: string
    is_school_closed?: boolean
    icon_emoji?: string | null
  }>,
  locale: 'he' | 'ru' = 'he'
): ShareData {
  const url = `https://beeri.online/${locale}`
  const title = locale === 'ru' ? 'Праздники и события' : 'חגים ומועדים'
  const schoolClosedText = locale === 'ru' ? 'Школа закрыта' : 'בית הספר סגור'
  const dateLocaleStr = locale === 'ru' ? 'ru-RU' : 'he-IL'

  const holidayTexts = holidays.map(h => {
    const start = new Date(h.start_date)
    const end = new Date(h.end_date)

    let dateRange
    if (h.start_date === h.end_date) {
      dateRange = start.toLocaleDateString(dateLocaleStr, { day: 'numeric', month: 'long' })
    } else {
      const startStr = start.toLocaleDateString(dateLocaleStr, { day: 'numeric' })
      const endStr = end.toLocaleDateString(dateLocaleStr, { day: 'numeric', month: 'long' })
      dateRange = `${startStr}-${endStr}`
    }

    const hebrewDate = h.hebrew_date ? `\n${h.hebrew_date}` : ''
    const schoolClosed = h.is_school_closed ? `\n${schoolClosedText}` : ''

    return `${h.icon_emoji || '📅'} *${h.hebrew_name}*${hebrewDate}\n${dateRange}${schoolClosed}`
  }).join('\n\n')

  const portalText = locale === 'ru'
    ? '📢 Не пропустите обновления! Заходите на портал:\n🌐'
    : '📢 אל תפספסו שום עדכון! בקרו בפורטל:\n🌐'

  const text = `📆 *${title}*\n\n${holidayTexts}\n\n${portalText} ${url}`

  return { title, text, url }
}

// Urgent message share data formatter
export function formatUrgentMessageShareData(
  message: {
    id: string
    title_he: string
    title_ru?: string
    description_he?: string
    description_ru?: string
    icon?: string
    start_date: string
    end_date: string
  },
  locale: 'he' | 'ru' = 'he'
): ShareData {
  const url = `https://beeri.online/${locale}`
  const title = locale === 'ru' && message.title_ru ? message.title_ru : message.title_he
  const description = locale === 'ru' && message.description_ru ? message.description_ru : message.description_he

  const dateLocaleStr = locale === 'ru' ? 'ru-RU' : 'he-IL'
  const startDate = new Date(message.start_date).toLocaleDateString(dateLocaleStr)
  const endDate = new Date(message.end_date).toLocaleDateString(dateLocaleStr)
  const dateRange = `📅 ${startDate} - ${endDate}`

  let text = `${message.icon || ''} ${title}`
  if (description) {
    text += `\n\n${description}`
  }
  text += `\n\n${dateRange}`
  text += `\n\n🌐 ${url}`

  return { title, text, url }
}

// White shirt reminder share data formatter
export function formatWhiteShirtShareData(
  locale: 'he' | 'ru' = 'he',
  isFriday: boolean = false
): ShareData {
  const url = `https://beeri.online/${locale}`
  const title = locale === 'ru'
    ? (isFriday ? 'Сегодня - белая рубашка!' : 'Завтра - белая рубашка!')
    : (isFriday ? 'היום - חולצה לבנה!' : 'מחר - חולצה לבנה!')

  const description = locale === 'ru'
    ? 'Напоминание: в пятницу ученики приходят в школу в белой рубашке'
    : 'תזכורת: ביום שישי התלמידים מגיעים לבית הספר בחולצה לבנה'

  const portalText = locale === 'ru'
    ? '📢 Не пропустите обновления! Заходите на портал:\n🌐'
    : '📢 אל תפספסו שום עדכון! בקרו בפורטל:\n🌐'

  const text = `👕 ${title}\n\n${description}\n\n${portalText} ${url}`

  return { title, text, url }
}

// WhatsApp community links share data formatter
export function formatWhatsAppLinksShareData(
  grades: Array<{ grade: string; url: string; emoji?: string }>,
  locale: 'he' | 'ru' = 'he'
): ShareData {
  const url = `https://beeri.online/${locale}`
  const title = locale === 'ru' ? 'Группы WhatsApp по классам' : 'קבוצות WhatsApp לפי שכבות'

  let text = locale === 'ru'
    ? `${title} - школа Беэри\n\nПрисоединяйтесь к группе WhatsApp вашего класса!\nНажмите на нужную ссылку:\n\n`
    : `${title} - בית ספר בארי\n\nהצטרפו לקבוצת WhatsApp של שכבת ילדכם!\nלחצו על הקישור המתאים:\n\n`

  grades.forEach(grade => {
    text += `*${locale === 'ru' ? `${grade.grade} класс` : `שכבת ${grade.grade}`}*\n${grade.url}\n\n`
  })

  const portalText = locale === 'ru'
    ? '📢 Не пропустите обновления! Заходите на портал:\n🌐'
    : '📢 אל תפספסו שום עדכון! בקרו בפורטל:\n🌐'

  text += `${portalText} ${url}`

  return { title, text, url }
}

// All Committees share data formatter
export function formatAllCommitteesShareData(
  committees: Array<{
    id: string
    name: string
    description?: string
    members?: string[]
    responsibilities?: string[]
  }>,
  locale: 'he' | 'ru' = 'he'
): ShareData {
  const url = `https://beeri.online/${locale}/committees`
  const title = '📋 כל הוועדות של ועד ההורים'

  let text = `${title}\n━━━━━━━━━━━━━━━━━━━━\n\n`

  committees.forEach((committee, index) => {
    text += `${index + 1}. 🏛️ *${committee.name}*\n`

    if (committee.description) {
      text += `   ${committee.description}\n`
    }

    if (committee.members && committee.members.length > 0) {
      text += `   👥 חברים: ${committee.members.slice(0, 3).join(', ')}`
      if (committee.members.length > 3) {
        text += ` +${committee.members.length - 3}`
      }
      text += '\n'
    }

    if (committee.responsibilities && committee.responsibilities.length > 0) {
      text += `   📋 תחומי אחריות: ${committee.responsibilities.slice(0, 2).join(', ')}`
      if (committee.responsibilities.length > 2) {
        text += ` +${committee.responsibilities.length - 2}`
      }
      text += '\n'
    }

    text += '\n'
  })

  const totalMembers = committees.reduce((sum, c) => sum + (c.members?.length || 0), 0)
  const totalResp = committees.reduce((sum, c) => sum + (c.responsibilities?.length || 0), 0)

  text += `📊 *סטטיסטיקה:*\n`
  text += `• ${committees.length} וועדות\n`
  text += `• ${totalMembers} חברי ועדה\n`
  text += `• ${totalResp} תחומי אחריות\n\n`
  text += `🔗 לצפייה מלאה:\n${url}`

  return { title, text, url }
}
