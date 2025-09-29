# BeeriCalendar - Complete Development Guide

## Overview
BeeriCalendar is our custom-built calendar system designed specifically for parent committee needs, with full control over features and no external dependencies.

## Core Features

### Current Implementation
- **Internal calendar management** with full control
- **Recurring events** using RRULE standard
- **Hebrew/RTL support** built-in
- **Offline-first** with PWA capabilities
- **iCal export** for parent synchronization
- **QR code integration** for event registration
- **Volunteer slots** management
- **Custom reminders** system

### New Features to Implement

#### =� School Calendar Overlay
- **Official school holidays/breaks** (read-only integration)
- **Academic year boundaries** clearly marked
- **Semester/trimester divisions** visual indicators
- **Parent-teacher conference periods** highlighted
- **School closure days** automatically marked

```typescript
interface SchoolCalendarEvent {
  id: string
  title: string
  start_date: Date
  end_date: Date
  type: 'holiday' | 'break' | 'conference' | 'closure'
  is_official: true // Read-only marker
  source: 'ministry_of_education' | 'school_admin'
}
```

#### <� Grade-Level Filtering
- **Smart filtering** - Parents see only events relevant to their child's grade
- **Multi-grade support** - Parents with children in different grades
- **Grade-specific event creation** - Events targeted to specific grades
- **Cross-grade events** - Events visible to all grades (school-wide)

```typescript
interface GradeFilter {
  user_id: string
  children: {
    name: string
    grade: string // "1�", "2�", "3�", etc.
    class?: string // Optional class letter
  }[]
  show_all_grades: boolean // Admin override
}

interface Event {
  // ... existing fields
  target_grades: string[] // ["1�", "2�"] or ["all"]
  grade_specific: boolean
}
```

#### < Translation Helper
- **Hebrew�English translation** for event descriptions
- **URL-based navigation** - Shareable links that navigate to events
- **Deep linking support** - Direct event access from external sources
- **Multi-language event titles** - Store both Hebrew and English versions

```typescript
interface EventTranslation {
  event_id: string
  hebrew: {
    title: string
    description: string
    location: string
  }
  english: {
    title: string
    description: string
    location: string
  }
  auto_translated: boolean
  translation_service: 'google' | 'microsoft' | 'manual'
}

// Deep link format: /events/{eventId}?lang=he|en
// Shareable format: /share/event/{eventId}
```

#### =� Enhanced Mobile Navigation
- **Gesture navigation** - Swipe between months smoothly
- **Pinch to zoom** - Week view with zoom capabilities
- **Touch-friendly controls** - Optimized for finger navigation
- **Haptic feedback** - Tactile responses for actions

```typescript
interface GestureHandlers {
  onSwipeLeft: () => void // Next month
  onSwipeRight: () => void // Previous month
  onPinchZoom: (scale: number) => void // Week view zoom
  onDoubleTap: (date: Date) => void // Quick event creation
  onLongPress: (event: Event) => void // Context menu
}
```

#### < Dark Mode Support
- **System preference detection** - Automatic dark/light mode switching
- **Manual toggle** - User preference override
- **Calendar-optimized colors** - High contrast for event visibility
- **Eye-friendly viewing** - Reduced eye strain for evening sessions

```css
/* Dark mode color palette */
:root[data-theme="dark"] {
  --calendar-bg: #1a1a1a;
  --calendar-grid: #333;
  --event-primary: #4a90e2;
  --event-secondary: #7b68ee;
  --text-primary: #ffffff;
  --text-secondary: #cccccc;
}
```

## Database Schema

### Enhanced Events Table
```sql
-- Updated events table with new features
ALTER TABLE events ADD COLUMN target_grades TEXT[] DEFAULT '{"all"}';
ALTER TABLE events ADD COLUMN grade_specific BOOLEAN DEFAULT FALSE;
ALTER TABLE events ADD COLUMN school_calendar_overlay BOOLEAN DEFAULT FALSE;
ALTER TABLE events ADD COLUMN translation_id UUID REFERENCES event_translations(id);

-- New tables for enhanced features
CREATE TABLE event_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  hebrew JSONB NOT NULL,
  english JSONB,
  auto_translated BOOLEAN DEFAULT FALSE,
  translation_service TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE school_calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  event_type TEXT NOT NULL, -- 'holiday', 'break', 'conference', 'closure'
  is_official BOOLEAN DEFAULT TRUE,
  source TEXT DEFAULT 'school_admin',
  academic_year TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_grade_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_identifier TEXT NOT NULL, -- Since we don't have user accounts
  children JSONB NOT NULL, -- [{"name": "...", "grade": "1�"}]
  show_all_grades BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_events_target_grades ON events USING gin(target_grades);
CREATE INDEX idx_school_calendar_dates ON school_calendar_events(start_date, end_date);
CREATE INDEX idx_user_grades ON user_grade_preferences(user_identifier);
```

## API Enhancements

### New Endpoints
```typescript
// Grade filtering
GET /api/calendar/grades          // Get available grades
GET /api/calendar/user-preferences // Get user's grade preferences
POST /api/calendar/user-preferences // Set grade preferences

// School calendar overlay
GET /api/calendar/school-events   // Get official school events
POST /api/calendar/school-events  // Admin: Add school events
GET /api/calendar/overlay         // Combined view

// Translation
POST /api/events/{id}/translate   // Translate event
GET /api/events/{id}/languages    // Get available translations

// Deep linking
GET /api/events/share/{id}        // Get shareable event data
```

## ✅ **IMPLEMENTED - Component Architecture**

### MobileCalendar Component - Production Ready

#### Core Component Interface
```tsx
interface MobileCalendarProps {
  events?: CalendarEvent[]
  onDateClick?: (date: Date) => void
  onEventClick?: (event: CalendarEvent) => void
  selectedDate?: Date
  showLegend?: boolean
  showWeeklySummary?: boolean
  className?: string
}
```

#### Event Data Structure
```tsx
interface CalendarEvent {
  id: string
  title: string
  date: Date
  type: 'meeting' | 'trip' | 'fundraising' | 'event' | 'volunteer' | 'holiday'
  description?: string
  time?: string
  location?: string
}
```

#### Event Configuration System
```tsx
const EVENT_CONFIG = {
  meeting: {
    color: 'bg-red-400',
    label: 'ישיבות',
    lightBg: 'bg-red-50',
    textColor: 'text-red-800'
  },
  trip: {
    color: 'bg-green-400',
    label: 'טיולים',
    lightBg: 'bg-green-50',
    textColor: 'text-green-800'
  },
  fundraising: {
    color: 'bg-blue-400',
    label: 'גיוס כספים',
    lightBg: 'bg-blue-50',
    textColor: 'text-blue-800'
  },
  event: {
    color: 'bg-yellow-400',
    label: 'אירועים',
    lightBg: 'bg-yellow-50',
    textColor: 'text-yellow-800'
  },
  volunteer: {
    color: 'bg-purple-400',
    label: 'התנדבות',
    lightBg: 'bg-purple-50',
    textColor: 'text-purple-800'
  },
  holiday: {
    color: 'bg-white border-2 border-indigo-400',
    label: 'חגים',
    lightBg: 'bg-indigo-50',
    textColor: 'text-indigo-800'
  }
}
```

#### Mobile-First Features Implemented
```tsx
// Touch gesture handling for navigation
const handleTouchStart = useCallback((e: React.TouchEvent) => {
  setTouchEnd(null)
  setTouchStart(e.targetTouches[0].clientX)
}, [])

const handleTouchEnd = useCallback(() => {
  if (!touchStart || !touchEnd) return
  const distance = touchStart - touchEnd
  const isLeftSwipe = distance > 50
  const isRightSwipe = distance < -50

  if (isLeftSwipe) setCurrentDate(prev => addMonths(prev, 1))
  if (isRightSwipe) setCurrentDate(prev => subMonths(prev, 1))
}, [touchStart, touchEnd])

// Accessibility-compliant touch targets
.calendar-day-cell {
  min-height: 44px; // iOS/Android accessibility requirement
  @apply touch-manipulation; // Optimizes touch performance
}
```

### Enhanced Calendar Views - IMPLEMENTED

#### 1. ✅ Mobile Month View (Primary)
```tsx
// IMPLEMENTED in MobileCalendar.tsx
<div className="grid grid-cols-7 gap-1 sm:gap-2">
  {calendarDays.map((date) => {
    const dayEvents = getEventsForDate(date)
    const isTodayDate = isToday(date)
    const isSelectedDate = isSelected(date)

    return (
      <button className="calendar-day-cell" onClick={() => handleDateClick(date)}>
        {format(date, 'd')}
        {/* Event Dots */}
        {dayEvents.length > 0 && (
          <div className="event-indicators">
            {dayEvents.slice(0, 3).map((event) => (
              <button className={`event-dot ${event.type}`}
                      onClick={() => handleEventClick(event)} />
            ))}
            {dayEvents.length > 3 && <span>+{dayEvents.length - 3}</span>}
          </div>
        )}
      </button>
    )
  })}
</div>
```

#### 2. ✅ Event Legend (Implemented)
```tsx
// IMPLEMENTED - Shows all event types with color coding
{showLegend && (
  <div className="bg-white rounded-2xl shadow-lg p-4 mb-4">
    <h3 className="font-bold text-base mb-3">סוגי אירועים</h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {Object.entries(EVENT_CONFIG).map(([type, config]) => (
        <div key={type} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
          <div className={`w-3 h-3 rounded-full flex-shrink-0 ${config.color}`} />
          <span className="text-sm text-gray-700 font-medium">{config.label}</span>
        </div>
      ))}
    </div>
  </div>
)}
```

#### 3. ✅ Weekly Summary (Implemented)
```tsx
// IMPLEMENTED - Shows week event count + today's events preview
{showWeeklySummary && (
  <div className="bg-white rounded-2xl shadow-lg p-4">
    <div className="flex justify-between items-center">
      <div>
        <div className="text-sm text-indigo-800 font-bold">השבוע הזה</div>
        <div className="text-xs text-indigo-600 mt-1">
          {getWeekEventCount()} אירועים מתוכננים
        </div>
      </div>
      <div className="text-2xl">📅</div>
    </div>

    {/* Today's Events Preview */}
    <div className="mt-3">
      {getEventsForDate(new Date()).slice(0, 2).map((event) => (
        <button key={event.id} onClick={() => handleEventClick(event)}
                className={`event-item ${event.type}`}>
          <div className="event-title">{event.title}</div>
          {event.time && (
            <div className="event-details">
              {event.time} {event.location && `• ${event.location}`}
            </div>
          )}
        </button>
      ))}
    </div>
  </div>
)}
```

#### Future Components (To Be Implemented)
```tsx
// FUTURE - Grade Filter Component
interface GradeFilterProps {
  availableGrades: string[]
  selectedGrades: string[]
  onGradeToggle: (grade: string) => void
  showAllOption: boolean
}

// FUTURE - School Calendar Overlay
interface SchoolCalendarEvent {
  id: string
  title: string
  start_date: Date
  end_date: Date
  type: 'holiday' | 'break' | 'conference' | 'closure'
  is_official: true
}
```

## ✅ **IMPLEMENTED - Mobile Enhancements**

### Gesture System - Production Ready
```typescript
// IMPLEMENTED - Touch gesture handlers in MobileCalendar.tsx
const [touchStart, setTouchStart] = useState<number | null>(null)
const [touchEnd, setTouchEnd] = useState<number | null>(null)

const handleTouchStart = useCallback((e: React.TouchEvent) => {
  setTouchEnd(null)
  setTouchStart(e.targetTouches[0].clientX)
}, [])

const handleTouchMove = useCallback((e: React.TouchEvent) => {
  setTouchEnd(e.targetTouches[0].clientX)
}, [])

const handleTouchEnd = useCallback(() => {
  if (!touchStart || !touchEnd) return

  const distance = touchStart - touchEnd
  const isLeftSwipe = distance > 50    // Next month
  const isRightSwipe = distance < -50   // Previous month

  if (isLeftSwipe) {
    setCurrentDate(prev => addMonths(prev, 1))
  }
  if (isRightSwipe) {
    setCurrentDate(prev => subMonths(prev, 1))
  }
}, [touchStart, touchEnd])

// Applied to calendar container
<div
  onTouchStart={handleTouchStart}
  onTouchMove={handleTouchMove}
  onTouchEnd={handleTouchEnd}
>
```

### Mobile Performance Features - IMPLEMENTED
```css
/* Touch optimization */
.touch-manipulation {
  touch-action: manipulation; /* Prevents zoom on double-tap */
}

/* 44px minimum touch targets */
.calendar-day-cell {
  min-height: 44px;
  min-width: 44px;
}

/* Optimized transitions */
.calendar-nav-button {
  transition: all 200ms ease-in-out;
}

/* Responsive spacing */
.calendar-grid {
  gap: 0.25rem; /* Mobile: 4px */
}

@media (min-width: 640px) {
  .calendar-grid {
    gap: 0.5rem; /* Desktop: 8px */
  }
}
```

### Dark Mode Implementation
```typescript
// Dark mode context
const DarkModeContext = createContext({
  darkMode: false,
  toggleDarkMode: () => {},
  systemPreference: false
})

// Auto-detect system preference
const useSystemDarkMode = () => {
  const [systemDarkMode, setSystemDarkMode] = useState(
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => setSystemDarkMode(e.matches)

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  return systemDarkMode
}
```

## Translation System

### Deep Linking Strategy
```typescript
// URL structure for shareable events
// Format: /share/event/{eventId}?lang=he|en&grade=1�
// Redirects to: /calendar?event={eventId}&highlight=true

const generateShareableLink = (event: Event, language: 'he' | 'en') => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL
  return `${baseUrl}/share/event/${event.id}?lang=${language}`
}

// Event page with translation support
const EventPage = ({ eventId, lang }: { eventId: string, lang: 'he' | 'en' }) => {
  const { event, translation } = useEventWithTranslation(eventId, lang)

  return (
    <div dir={lang === 'he' ? 'rtl' : 'ltr'}>
      <h1>{translation?.title || event.title}</h1>
      <p>{translation?.description || event.description}</p>
    </div>
  )
}
```

## Performance Optimizations

### Enhanced Caching Strategy
```typescript
// IndexedDB for offline grade preferences
const cacheUserPreferences = async (preferences: UserGradePreferences) => {
  const db = await openDB('beeri-calendar', 1)
  await db.put('preferences', preferences, 'user-grades')
}

// Optimized event filtering
const useFilteredEvents = (events: Event[], gradeFilter: string[]) => {
  return useMemo(() => {
    if (gradeFilter.includes('all')) return events

    return events.filter(event =>
      event.target_grades.some(grade =>
        gradeFilter.includes(grade) || grade === 'all'
      )
    )
  }, [events, gradeFilter])
}
```

## Testing Strategy

### New Test Scenarios
```typescript
describe('Grade Filtering', () => {
  it('filters events by selected grades', () => {
    const events = [
      { id: '1', target_grades: ['1�'], title: 'Grade 1 Event' },
      { id: '2', target_grades: ['2�'], title: 'Grade 2 Event' },
      { id: '3', target_grades: ['all'], title: 'All Grades Event' }
    ]

    const filtered = filterEventsByGrades(events, ['1�'])
    expect(filtered).toHaveLength(2) // Grade 1 + All grades events
  })
})

describe('Dark Mode', () => {
  it('applies correct theme classes', () => {
    render(<Calendar darkMode={true} />)
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
  })
})

describe('Translation Deep Links', () => {
  it('redirects to correct event with language', async () => {
    const response = await fetch('/share/event/123?lang=en')
    expect(response.redirected).toBe(true)
    expect(response.url).toContain('/calendar?event=123')
  })
})
```

## Migration Plan

### Implementation Order
1. **Phase 1**: Dark mode + mobile gestures (visual improvements)
2. **Phase 2**: Grade filtering system (core functionality)
3. **Phase 3**: School calendar overlay (data integration)
4. **Phase 4**: Translation system + deep linking (sharing features)

### Database Migration Scripts
```sql
-- Phase 1: Add new columns
ALTER TABLE events ADD COLUMN target_grades TEXT[] DEFAULT '{"all"}';
ALTER TABLE events ADD COLUMN grade_specific BOOLEAN DEFAULT FALSE;

-- Phase 2: Create new tables
CREATE TABLE event_translations (...);
CREATE TABLE school_calendar_events (...);
CREATE TABLE user_grade_preferences (...);

-- Phase 3: Migrate existing events
UPDATE events SET grade_specific = false WHERE target_grades = '{"all"}';
```

## Deployment Considerations

### Environment Variables
```bash
# New environment variables
NEXT_PUBLIC_ENABLE_TRANSLATIONS=true
NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY=your_key_here
NEXT_PUBLIC_SCHOOL_CALENDAR_SYNC_URL=ministry_of_education_api
NEXT_PUBLIC_DEFAULT_LANGUAGE=he
```

### Feature Flags
```typescript
const featureFlags = {
  enableGradeFiltering: true,
  enableTranslations: process.env.NEXT_PUBLIC_ENABLE_TRANSLATIONS === 'true',
  enableSchoolCalendarOverlay: true,
  enableDarkMode: true,
  enableGestureNavigation: true
}
```

---

*Last Updated: December 2024*
*Version: 2.0.0 - Enhanced with new features*