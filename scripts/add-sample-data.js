// Script to add sample data to BeeriManager database
// Run with: node scripts/add-sample-data.js

const { createClient } = require('@supabase/supabase-js')

// Get these from your .env.local file
const supabaseUrl = 'https://wkfxwnayexznjhcktwwu.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrZnh3bmF5ZXh6bmpoY2t0d3d1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTE0MzA5MCwiZXhwIjoyMDc0NzE5MDkwfQ.WAiIbjrnq3qvAyczwonV1w8QHYOEff7Bq5mSeLKWa5w'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Sample events data
const sampleEvents = [
  {
    title: 'ישיבת ועד חודשית - דצמבר 2024',
    description: `ישיבת ועד הורים חודשית לחודש דצמבר.

נושאים לדיון:
- סיכום פעילות נובמבר
- תכנון אירועי חנוכה
- אישור תקציב לפעילות חורף
- עדכון על פרויקט חידוש חצר בית הספר
- הצעות להרצאות הורים

כולם מוזמנים להשתתף ולהשמיע את דעתם!`,
    event_type: 'meeting',
    priority: 'high',
    status: 'published',
    visibility: 'public',
    location: 'חדר המורים, בית ספר יסודי',
    start_datetime: new Date('2024-12-15T19:00:00').toISOString(),
    end_datetime: new Date('2024-12-15T21:00:00').toISOString(),
    registration_enabled: true,
    max_attendees: 30,
    current_attendees: 12,
    requires_payment: false,
    created_by: 'admin'
  },
  {
    title: 'מסיבת חנוכה לכל המשפחה',
    description: `חגיגת חנוכה מיוחדת לכל תלמידי בית הספר והוריהם!

בתכנית:
🕯️ הדלקת נרות משותפת
🍩 דוכני סופגניות ולביבות
🎭 הצגת חנוכה של כיתות ד׳
🎵 שירה בציבור
🎁 שוק חנוכה - יריד יצירות תלמידים

הכניסה חופשית!
יש להביא צלחות וכלים רב פעמיים.`,
    event_type: 'general',
    priority: 'urgent',
    status: 'published',
    visibility: 'public',
    location: 'אולם הספורט של בית הספר',
    start_datetime: new Date('2024-12-26T17:00:00').toISOString(),
    end_datetime: new Date('2024-12-26T20:00:00').toISOString(),
    registration_enabled: true,
    max_attendees: 500,
    current_attendees: 237,
    requires_payment: false,
    budget_allocated: 15000,
    budget_spent: 8500,
    created_by: 'admin'
  },
  {
    title: 'הרצאת הורים: "גבולות בעידן הדיגיטלי"',
    description: `הרצאה מרתקת להורים בנושא הצבת גבולות לילדים בעולם הדיגיטלי.

המרצה: ד"ר יעל כהן, פסיכולוגית קלינית ומומחית להתמכרויות דיגיטליות

נושאי ההרצאה:
• זמן מסך מומלץ לפי גילאים
• סימני אזהרה להתמכרות
• כלים מעשיים להצבת גבולות
• יצירת הסכם משפחתי לשימוש במסכים
• מענה לשאלות הורים

ההרצאה מיועדת להורי תלמידים בכל הגילאים.
כיבוד קל יוגש בהפסקה.`,
    event_type: 'workshop',
    priority: 'normal',
    status: 'published',
    visibility: 'public',
    location: 'אולם הכנסים, קומה 2',
    start_datetime: new Date('2025-01-08T20:00:00').toISOString(),
    end_datetime: new Date('2025-01-08T22:00:00').toISOString(),
    registration_enabled: true,
    max_attendees: 120,
    current_attendees: 67,
    requires_payment: true,
    payment_amount: 30,
    created_by: 'admin'
  },
  {
    title: 'טיול משפחות לירושלים',
    description: `טיול משפחות מאורגן לירושלים!

מסלול הטיול:
🚌 07:00 - יציאה מבית הספר
🏛️ 09:00 - סיור מודרך במוזיאון ישראל
🍔 12:00 - ארוחת צהריים (עצמאית)
🎨 14:00 - סדנת יצירה לילדים במוזיאון
🛍️ 16:00 - זמן חופשי בשוק מחנה יהודה
🚌 18:00 - חזרה הביתה

המחיר כולל: הסעה, כניסה למוזיאון וסדנה.
המחיר אינו כולל: ארוחת צהריים.

מספר המקומות מוגבל!`,
    event_type: 'trip',
    priority: 'high',
    status: 'published',
    visibility: 'public',
    location: 'נקודת איסוף: חניית בית הספר',
    start_datetime: new Date('2025-01-19T07:00:00').toISOString(),
    end_datetime: new Date('2025-01-19T19:00:00').toISOString(),
    registration_enabled: true,
    registration_deadline: new Date('2025-01-12T23:59:59').toISOString(),
    max_attendees: 100,
    current_attendees: 78,
    requires_payment: true,
    payment_amount: 150,
    budget_allocated: 5000,
    created_by: 'admin'
  },
  {
    title: 'יום ספורט בית ספרי',
    description: `יום ספורט וכיף לכל תלמידי בית הספר!

לו"ז היום:
08:30 - התכנסות וחלוקה לבתים
09:00 - טקס פתיחה
09:30 - תחרויות ספורט לפי שכבות
11:00 - הפסקת פירות
11:30 - משחקי בתים
13:00 - טקס סיום וחלוקת גביעים

תלמידים נדרשים להגיע עם:
- בגדי ספורט ונעלי ספורט
- כובע
- בקבוק מים
- ארוחת בוקר

ועד ההורים ידאג לפירות ושתייה קרה במהלך היום.`,
    event_type: 'general',
    priority: 'normal',
    status: 'published',
    visibility: 'public',
    location: 'מגרש הספורט של בית הספר',
    start_datetime: new Date('2025-02-05T08:30:00').toISOString(),
    end_datetime: new Date('2025-02-05T13:30:00').toISOString(),
    registration_enabled: false,
    budget_allocated: 8000,
    budget_spent: 0,
    created_by: 'admin'
  },
  {
    title: 'ערב גיוס כספים - מכירת עוגות',
    description: `ערב גיוס כספים למען שיפוץ ספריית בית הספר.

מה בתכנית:
🍰 מכירת עוגות בית - תרומת ההורים
☕ בית קפה זמני
🎶 מוזיקה חיה - תלמידי המגמה המוזיקלית
🎯 דוכני משחקים לילדים
🎁 הגרלה - פרס ראשון: סופ"ש בצימר!

כל ההכנסות קודש לשיפוץ הספרייה!

הורים המעוניינים לתרום עוגות מתבקשים להירשם מראש.`,
    event_type: 'fundraiser',
    priority: 'high',
    status: 'published',
    visibility: 'public',
    location: 'חצר בית הספר',
    start_datetime: new Date('2025-01-25T18:00:00').toISOString(),
    end_datetime: new Date('2025-01-25T21:00:00').toISOString(),
    registration_enabled: true,
    max_attendees: 200,
    current_attendees: 45,
    requires_payment: false,
    created_by: 'admin'
  }
]

// Sample tasks data
const sampleTasks = [
  {
    title: 'הזמנת כיבוד לישיבת הועד',
    description: 'להזמין כיבוד קל לישיבת הועד החודשית - עוגיות, פירות, שתייה חמה וקרה',
    status: 'pending',
    priority: 'normal',
    owner_name: 'שרה כהן',
    owner_phone: '050-1234567',
    due_date: new Date('2024-12-13').toISOString(),
    created_at: new Date().toISOString()
  },
  {
    title: 'תיאום הסעות לטיול לירושלים',
    description: 'ליצור קשר עם חברת ההסעות, לקבל הצעות מחיר ולסגור הזמנה ל-2 אוטובוסים',
    status: 'in_progress',
    priority: 'high',
    owner_name: 'דני לוי',
    owner_phone: '052-9876543',
    due_date: new Date('2025-01-10').toISOString(),
    follow_up_count: 1,
    created_at: new Date().toISOString()
  },
  {
    title: 'הכנת מצגת לישיבת ההורים',
    description: 'להכין מצגת עם סיכום פעילות הועד לרבעון האחרון',
    status: 'pending',
    priority: 'normal',
    owner_name: 'מיכל ברק',
    owner_phone: '054-5555555',
    due_date: new Date('2024-12-14').toISOString(),
    created_at: new Date().toISOString()
  },
  {
    title: 'פרסום אירוע חנוכה ברשתות החברתיות',
    description: 'להכין פוסט מעוצב ולפרסם בקבוצות הווטסאפ ובפייסבוק של ההורים',
    status: 'pending',
    priority: 'urgent',
    owner_name: 'יעל גרין',
    owner_phone: '053-3333333',
    due_date: new Date('2024-12-20').toISOString(),
    created_at: new Date().toISOString()
  },
  {
    title: 'רכישת פרסים להגרלה',
    description: 'לרכוש פרסים להגרלה בערב גיוס הכספים - תקציב 2000 ש"ח',
    status: 'pending',
    priority: 'normal',
    owner_name: 'אבי שמש',
    owner_phone: '058-7777777',
    due_date: new Date('2025-01-20').toISOString(),
    created_at: new Date().toISOString()
  }
]

// Sample issues
const sampleIssues = [
  {
    title: 'תאורה לא עובדת במסדרון הראשי',
    description: 'התאורה במסדרון הראשי של קומה 2 לא עובדת כבר שבוע. מסוכן לילדים בבוקר.',
    category: 'maintenance',
    priority: 'high',
    status: 'open',
    reporter_name: 'רונית אברהם',
    created_at: new Date().toISOString()
  },
  {
    title: 'בעיית ניקיון בשירותים',
    description: 'השירותים בקומה הראשונה לא נקיים מספיק. צריך לדבר עם חברת הניקיון.',
    category: 'maintenance',
    priority: 'normal',
    status: 'in_progress',
    reporter_name: 'חיים דוד',
    assigned_to: 'צוות התחזוקה',
    created_at: new Date().toISOString()
  },
  {
    title: 'חסר ציוד ספורט',
    description: 'חסרים כדורים ומחבטים לשיעורי החינוך הגופני',
    category: 'equipment',
    priority: 'low',
    status: 'open',
    reporter_name: 'המורה לספורט',
    created_at: new Date().toISOString()
  }
]

// Sample protocols
const sampleProtocols = [
  {
    title: 'פרוטוקול ישיבת ועד - נובמבר 2024',
    summary: 'ישיבת ועד חודשית שדנה בתכנון אירועי חנוכה, תקציב שנתי ופרויקט חידוש החצר',
    full_text: `פרוטוקול ישיבת ועד הורים
תאריך: 15.11.2024
נוכחים: 12 חברי ועד

נושאים שנדונו:
1. אישור פרוטוקול קודם - אושר פה אחד
2. תכנון אירועי חנוכה - הוחלט על מסיבה בתאריך 26.12
3. אישור תקציב לרבעון הבא - אושר תקציב של 25,000 ש"ח
4. עדכון פרויקט חידוש חצר - הפרויקט בשלבי תכנון מתקדמים

החלטות:
- לקיים מסיבת חנוכה ב-26.12
- להקצות 15,000 ש"ח לאירוע
- להתחיל בגיוס כספים לפרויקט החצר`,
    year: 2024,
    academic_year: '2024-2025',
    categories: ['ישיבות ועד'],
    protocol_date: new Date('2024-11-15').toISOString(),
    protocol_number: '2024-11',
    is_public: true,
    created_at: new Date().toISOString()
  }
]

async function addSampleData() {
  console.log('🚀 מתחיל להוסיף נתונים לדוגמה...\n')

  try {
    // First, set the user context for audit logging
    const { error: contextError } = await supabase.rpc('set_user_context', {
      p_user_name: 'System Admin',
      p_user_role: 'admin'
    }).single()

    if (contextError && contextError.message.includes('function')) {
      // If the function doesn't exist, continue without it
      console.log('⚠️  פונקציית הקשר לא קיימת, ממשיכים בלעדיה')
    }
    // Add events
    console.log('📅 מוסיף אירועים...')
    const { data: eventsData, error: eventsError } = await supabase
      .from('events')
      .insert(sampleEvents)
      .select()

    if (eventsError) {
      console.error('❌ שגיאה בהוספת אירועים:', eventsError)
    } else {
      console.log(`✅ נוספו ${eventsData.length} אירועים`)
      eventsData.forEach(event => {
        console.log(`   - ${event.title}`)
      })
    }

    // Add tasks
    console.log('\n✅ מוסיף משימות...')
    const { data: tasksData, error: tasksError } = await supabase
      .from('tasks')
      .insert(sampleTasks)
      .select()

    if (tasksError) {
      console.error('❌ שגיאה בהוספת משימות:', tasksError)
    } else {
      console.log(`✅ נוספו ${tasksData.length} משימות`)
      tasksData.forEach(task => {
        console.log(`   - ${task.title}`)
      })
    }

    // Add issues
    console.log('\n🐛 מוסיף בעיות לטיפול...')
    const { data: issuesData, error: issuesError } = await supabase
      .from('issues')
      .insert(sampleIssues)
      .select()

    if (issuesError) {
      console.error('❌ שגיאה בהוספת בעיות:', issuesError)
    } else {
      console.log(`✅ נוספו ${issuesData.length} בעיות`)
      issuesData.forEach(issue => {
        console.log(`   - ${issue.title}`)
      })
    }

    // Add protocols
    console.log('\n📝 מוסיף פרוטוקולים...')
    const { data: protocolsData, error: protocolsError } = await supabase
      .from('protocols')
      .insert(sampleProtocols)
      .select()

    if (protocolsError) {
      console.error('❌ שגיאה בהוספת פרוטוקולים:', protocolsError)
    } else {
      console.log(`✅ נוספו ${protocolsData.length} פרוטוקולים`)
    }

    console.log('\n🎉 הנתונים נוספו בהצלחה!')
    console.log('\n📱 כעת תוכל לראות את הנתונים באפליקציה:')
    console.log('   http://localhost:4500')
    console.log('   http://localhost:4500/events')
    console.log('   http://localhost:4500/tasks')

  } catch (error) {
    console.error('❌ שגיאה כללית:', error)
  }
}

// Run the script
addSampleData()