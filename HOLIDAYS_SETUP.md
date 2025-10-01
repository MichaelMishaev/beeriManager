# הפעלת מערכת החגים - Holidays Setup

## שלב 1: הרצת Migration (יצירת הטבלה)

### אופציה א': דרך Supabase Dashboard
1. היכנס ל-Supabase Dashboard של הפרויקט
2. עבור ל: **SQL Editor**
3. העתק והדבק את תוכן הקובץ:
   ```
   scripts/migrations/005_add_holidays_hebrew_only.sql
   ```
4. לחץ **Run**

### אופציה ב': דרך psql (Command Line)
```bash
psql -h <your-supabase-host> -U postgres -d postgres -f scripts/migrations/005_add_holidays_hebrew_only.sql
```

### אופציה ג': דרך Supabase CLI
```bash
supabase db push
```

---

## שלב 2: טעינת נתוני החגים (Seed Data)

### דרך Supabase Dashboard:
1. SQL Editor
2. העתק והדבק:
   ```
   scripts/seed-holidays-2024-2025-hebrew.sql
   ```
3. Run

### דרך psql:
```bash
psql -h <your-supabase-host> -U postgres -d postgres -f scripts/seed-holidays-2024-2025-hebrew.sql
```

---

## שלב 3: הפעלת הקומפוננטות

לאחר שהטבלה נוצרה, הסר את ההערות מהקבצים הבאים:

### `src/components/features/dashboard/Dashboard.tsx`
```typescript
// הסר // מהשורות הבאות:
import { NextHolidayWidget } from '@/components/features/holidays/NextHolidayWidget'
import { HolidaysFAB } from '@/components/features/holidays/HolidaysFAB'

// והוסף בחזרה:
const [holidaysModalOpen, setHolidaysModalOpen] = useState(false)
<NextHolidayWidget onClick={() => setHolidaysModalOpen(true)} />
<HolidaysFAB />
```

### `src/components/features/homepage/PublicHomepage.tsx`
```typescript
// הסר // מהשורות הבאות:
import { NextHolidayWidget } from '@/components/features/holidays/NextHolidayWidget'
import { HolidaysFAB } from '@/components/features/holidays/HolidaysFAB'

// והוסף בחזרה:
const [holidaysModalOpen, setHolidaysModalOpen] = useState(false)
<NextHolidayWidget onClick={() => setHolidaysModalOpen(true)} />
<HolidaysFAB />
```

---

## מה השתנה?

### ✅ גרסה עברית בלבד
- הוסר שדה `hebrew_name` (כפילות)
- השדה `name` כעת מכיל שמות עבריים בלבד
- הוסרו שמות באנגלית/רוסית

### ✅ מבנה הטבלה המעודכן
```sql
CREATE TABLE holidays (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,           -- שם עברי בלבד
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  holiday_type VARCHAR(50),             -- religious, national, school_break
  is_school_closed BOOLEAN DEFAULT true,
  icon_emoji VARCHAR(10),               -- 🕎, 🇮🇱, 🎉
  color VARCHAR(7),                     -- #FFBA00
  academic_year VARCHAR(20) NOT NULL,   -- תשפ״ה
  hebrew_date VARCHAR(100),             -- כ״ה בכסלו - ב׳ בטבת
  event_id UUID REFERENCES events(id),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## בדיקה

לאחר הפעלה:
1. פתח את האפליקציה
2. תראה widget של "החג הבא" בדף הבית
3. לחץ על כפתור החגים הצף (🗓️)
4. תיפתח מודל עם לוח כל החגים
5. אפשר לשתף את הלוח לוואטסאפ

---

## חגים שנטענו (תשפ״ה / 2024-2025)

- 🍎 ראש השנה (3-4 אוקטובר 2024)
- 🕊️ יום כיפור (12-13 אוקטובר 2024)
- 🏡 סוכות (17-18 אוקטובר 2024)
- 📜 שמחת תורה (25 אוקטובר 2024)
- 🕎 חנוכה (26 דצמבר 2024 - 2 ינואר 2025)
- 🌳 ט״ו בשבט (13 פברואר 2025)
- 🤡 פורים (14 מרץ 2025)
- 🍷 פסח (13-21 אפריל 2025)
- 🕯️ יום הזיכרון (5 מאי 2025)
- 🇮🇱 יום העצמאות (6 מאי 2025)
- 🔥 ל״ג בעומר (16 מאי 2025)
- 🌾 שבועות (2-3 יוני 2025)
- ☀️ חופשת הקיץ (1 יולי - 31 אוגוסט 2025)
