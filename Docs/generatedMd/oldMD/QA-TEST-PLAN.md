# 🧪 beeriManager - Comprehensive QA Test Plan

## Test Environment
- **URL**: http://localhost:4500 (Dev) / http://pipguru.club (Prod)
- **Browser**: Chrome, Safari, Firefox, Mobile Safari
- **Devices**: Desktop (1920x1080), Tablet (768px), Mobile (375px, 414px)
- **Language**: Hebrew (RTL)

---

## 1️⃣ PHOTOS FEATURE (NEW) 📸

### 1.1 Database & Schema
- [ ] **SQL Migration**
  - [ ] Run `scripts/add-photos-url-to-events.sql` in Supabase
  - [ ] Verify `photos_url` column exists: `SELECT photos_url FROM events LIMIT 1;`
  - [ ] Check column type is TEXT
  - [ ] Verify column accepts NULL values
  - [ ] Test inserting event with photos_url
  - [ ] Test inserting event without photos_url (NULL)

### 1.2 EventForm - Photos URL Input
- [ ] **Navigate to**: `/admin/events/new`
- [ ] Click "הצג הגדרות מתקדמות"
- [ ] **Verify Field Exists**
  - [ ] "קישור לגלריית תמונות" label visible
  - [ ] Camera icon displayed
  - [ ] Helper text: "הדבק קישור לתיקיית Google Drive..."
  - [ ] Input field is LTR direction
- [ ] **Validation Tests**
  - [ ] Leave empty → Should save successfully (optional field)
  - [ ] Enter invalid URL "abc123" → Should show error
  - [ ] Enter "http://example.com" → Should accept
  - [ ] Enter "https://drive.google.com/..." → Should accept
  - [ ] Enter spaces/special chars → Should validate
- [ ] **Save & Retrieve**
  - [ ] Create event with photos URL
  - [ ] Navigate away and back
  - [ ] Verify URL persisted correctly
- [ ] **Edit Existing Event**
  - [ ] Open event for editing
  - [ ] Add photos URL to existing event
  - [ ] Save and verify
  - [ ] Remove photos URL
  - [ ] Save and verify removal

### 1.3 Events Page - Tabs & Filters
- [ ] **Navigate to**: `/events`
- [ ] **Tab Structure**
  - [ ] 4 tabs visible: "הכל | קרובים | עבר | עם תמונות"
  - [ ] Camera icon on "עם תמונות" tab
  - [ ] Tabs are RTL aligned
  - [ ] Active tab highlighted correctly
- [ ] **Tab: הכל (All)**
  - [ ] Shows all events (past + future)
  - [ ] Events sorted by date
  - [ ] Camera icon on cards with photos_url
  - [ ] "תמונות" badge on cards with photos_url
- [ ] **Tab: קרובים (Upcoming)**
  - [ ] Shows only future events (start_datetime > now)
  - [ ] No past events shown
  - [ ] Empty state if no upcoming events
- [ ] **Tab: עבר (Past)**
  - [ ] Shows only past events (end_datetime < now)
  - [ ] No future events shown
  - [ ] Empty state if no past events
- [ ] **Tab: עם תמונות (With Photos)**
  - [ ] Shows ONLY past events with photos_url
  - [ ] Excludes future events (even with photos_url)
  - [ ] Excludes past events without photos_url
  - [ ] Empty state: "אין עדיין תמונות מאירועים"
  - [ ] Camera icon in empty state
- [ ] **Event Cards Display**
  - [ ] Camera icon in top-right if photos_url exists
  - [ ] "תמונות" badge displayed
  - [ ] Badge styling correct (outline variant)
  - [ ] Click card → navigates to event detail
  - [ ] Hover effect works

### 1.4 Event Detail Page - Photo Gallery
- [ ] **Navigate to**: `/events/[id]` with photos_url
- [ ] **Gallery Card Visibility**
  - [ ] Card ONLY shows if:
    - [ ] photos_url is set AND
    - [ ] end_datetime < now (past event)
  - [ ] Card NOT shown for future events (even with photos_url)
  - [ ] Card NOT shown for past events without photos_url
- [ ] **Gallery Card Design**
  - [ ] Title: "גלריית תמונות מהאירוע"
  - [ ] Camera icon in title
  - [ ] Card has light blue background (border-primary/20)
  - [ ] Description text present
  - [ ] "פתח גלריה" button prominent
  - [ ] Button opens link in new tab
  - [ ] Button has Camera icon
- [ ] **Action Buttons Row**
  - [ ] "תמונות" button appears if photos_url exists
  - [ ] Button has Camera icon
  - [ ] Opens in new tab
  - [ ] Works on mobile (doesn't overlap)
- [ ] **External Link Behavior**
  - [ ] Clicking "פתח גלריה" opens Google Drive
  - [ ] Opens in new tab (target="_blank")
  - [ ] Has rel="noopener noreferrer"
  - [ ] Works with Google Photos URLs
  - [ ] Works with Google Drive folder URLs

### 1.5 Homepage - Photos Carousel
- [ ] **Navigate to**: `/` (homepage)
- [ ] **Section Visibility**
  - [ ] Section ONLY appears if:
    - [ ] At least 1 past event with photos_url exists
  - [ ] Section hidden if no photos
- [ ] **Section Header**
  - [ ] Title: "גלריית תמונות מאירועים"
  - [ ] Camera icon next to title
  - [ ] "כל הגלריות" link on right
  - [ ] Link goes to `/events?tab=photos`
- [ ] **Horizontal Scroll**
  - [ ] Cards scroll horizontally (CSS overflow-x)
  - [ ] Smooth scrolling (snap-scroll)
  - [ ] Mouse wheel scrolls horizontally
  - [ ] Touch/swipe works on mobile
  - [ ] Scrollbar visible (thin style)
  - [ ] No vertical scroll within section
- [ ] **Photo Cards**
  - [ ] Show up to 4 most recent events
  - [ ] Cards are 280px wide
  - [ ] Camera icon watermark (large, faded)
  - [ ] Event title (line-clamp-2)
  - [ ] Date in top-right (small)
  - [ ] Location with 📍 emoji
  - [ ] "צפה בתמונות" button at bottom
  - [ ] Hover effect on card
  - [ ] Click opens Google Drive link
- [ ] **Data Filtering**
  - [ ] Only past events shown
  - [ ] Only events with photos_url shown
  - [ ] Sorted by most recent first
  - [ ] Limited to 4 events

---

## 2️⃣ EVENTS MANAGEMENT 📅

### 2.1 Events List Page
- [ ] **Navigate to**: `/events`
- [ ] **Layout & Structure**
  - [ ] Header: "אירועים" with Calendar icon
  - [ ] Description text visible
  - [ ] "תצוגת לוח שנה" button
  - [ ] "אירוע חדש" button (primary)
- [ ] **Events Grid**
  - [ ] Responsive: 1 col mobile, 2 tablet, 3 desktop
  - [ ] Cards have proper spacing
  - [ ] Hover effect works
  - [ ] Click navigates to detail page
- [ ] **Event Card Content**
  - [ ] Event title (truncated if long)
  - [ ] Date formatted in Hebrew
  - [ ] Location displayed with bullet separator
  - [ ] Event type badge (color-coded)
  - [ ] Description (line-clamp-2)
- [ ] **Empty State**
  - [ ] Shows when no events
  - [ ] Helpful message
  - [ ] Icon displayed

### 2.2 Event Detail Page
- [ ] **Navigate to**: `/events/[id]`
- [ ] **Header Section**
  - [ ] Breadcrumb: "חזרה לאירועים"
  - [ ] Event title (large, bold)
  - [ ] Event type badge
  - [ ] All info cards visible
- [ ] **Date & Time Card**
  - [ ] Calendar icon
  - [ ] Full Hebrew date
  - [ ] Time range if end_datetime exists
  - [ ] Formatted correctly (he-IL)
- [ ] **Location Card**
  - [ ] MapPin icon
  - [ ] Location text
  - [ ] Only shows if location exists
- [ ] **Participants Card**
  - [ ] Users icon
  - [ ] Current / Max shown
  - [ ] Progress bar
  - [ ] Percentage calculated correctly
  - [ ] Only shows if max_participants exists
- [ ] **Organizer Card**
  - [ ] Organizer name
  - [ ] Only shows if organizer_name exists
- [ ] **Description Card**
  - [ ] Full description with whitespace preserved
  - [ ] Proper line breaks
- [ ] **Action Buttons**
  - [ ] "הרשמה לאירוע" button
  - [ ] "הצג בלוח שנה" button
  - [ ] Responsive layout (stack on mobile)
- [ ] **Event Feedback Form**
  - [ ] Form visible at bottom
  - [ ] All fields working

### 2.3 Create Event (Admin)
- [ ] **Navigate to**: `/admin/events/new`
- [ ] **Basic Fields**
  - [ ] Title (required, min 2 chars)
  - [ ] Description (optional, textarea)
  - [ ] Event type (required, dropdown)
  - [ ] Priority (dropdown, default: normal)
- [ ] **Date & Time**
  - [ ] Start datetime (required, datetime-local)
  - [ ] End datetime (optional, min = start)
  - [ ] Validation: end must be after start
- [ ] **Location**
  - [ ] MapPin icon
  - [ ] Text input
  - [ ] Optional field
- [ ] **Registration Settings**
  - [ ] Toggle switch works
  - [ ] When enabled:
    - [ ] Registration deadline field appears
    - [ ] Max attendees field appears
    - [ ] Validation works
- [ ] **Payment Settings**
  - [ ] Toggle switch works
  - [ ] When enabled:
    - [ ] Payment amount field appears
    - [ ] Validates positive numbers
    - [ ] Decimal support (₪)
- [ ] **Advanced Settings**
  - [ ] Toggle "הצג/הסתר" works
  - [ ] Budget allocated field
  - [ ] Photos URL field (tested above)
  - [ ] Status dropdown
- [ ] **Form Validation**
  - [ ] Submit with empty title → Error
  - [ ] Submit with invalid URL → Error
  - [ ] Submit with end before start → Error
  - [ ] All errors show in red
  - [ ] Validation summary at bottom
- [ ] **Form Actions**
  - [ ] "ביטול" button works (navigate back)
  - [ ] "צור אירוע" button disabled when invalid
  - [ ] "צור אירוע" shows loading state
  - [ ] Success → redirect to event detail

### 2.4 Edit Event (Admin)
- [ ] **Navigate to**: `/admin/events/[id]/edit`
- [ ] **Pre-fill Data**
  - [ ] All fields populated with existing data
  - [ ] Datetime fields formatted correctly
  - [ ] Checkboxes/toggles reflect state
  - [ ] Dropdowns show current selection
- [ ] **Update Functionality**
  - [ ] Modify title → Save → Verify
  - [ ] Change date → Save → Verify
  - [ ] Toggle registration → Save → Verify
  - [ ] Add photos URL → Save → Verify
- [ ] **Version Control**
  - [ ] Version number increments
  - [ ] updated_at timestamp changes
  - [ ] updated_by set (if auth enabled)

---

## 3️⃣ HOMEPAGE & NAVIGATION 🏠

### 3.1 Public Homepage (Non-authenticated)
- [ ] **Navigate to**: `/`
- [ ] **Header**
  - [ ] "ברוכים הבאים להורים בית הספר"
  - [ ] Subtitle text
  - [ ] Centered layout
- [ ] **Photos Section** (tested above in 1.5)
- [ ] **Upcoming Events Section**
  - [ ] Title: "אירועים קרובים"
  - [ ] Shows next 5 events
  - [ ] Event cards with date badge
  - [ ] Click navigates to detail
  - [ ] "צפה בכל האירועים" if >5
- [ ] **Calendar Widget**
  - [ ] MobileCalendar component renders
  - [ ] Current month shown
  - [ ] Events marked on dates
  - [ ] Hebrew month name
- [ ] **Feedback Section**
  - [ ] "שלח משוב" card
  - [ ] MessageSquare icon
  - [ ] Link works

### 3.2 Admin Dashboard (Authenticated)
- [ ] **Navigate to**: `/admin`
- [ ] **Header**
  - [ ] "לוח בקרה למנהל"
  - [ ] Description text
  - [ ] "הגדרות" button
- [ ] **Quick Stats**
  - [ ] 4 stat cards
  - [ ] Numbers update dynamically
  - [ ] Click navigates to relevant section
  - [ ] Loading skeleton while fetching
- [ ] **Admin Sections**
  - [ ] All 7 cards visible (Events, Tasks, Committees, etc.)
  - [ ] Drag & drop reordering works
  - [ ] Order persists in localStorage
  - [ ] Icons and colors correct
  - [ ] Links in each card work
- [ ] **Quick Actions**
  - [ ] All 5 action buttons work
  - [ ] Icons displayed
  - [ ] Responsive layout

### 3.3 Main Navigation
- [ ] **Navigation Bar**
  - [ ] Logo/title clickable (home)
  - [ ] All menu items visible
  - [ ] RTL aligned
  - [ ] Active page highlighted
- [ ] **Mobile Navigation**
  - [ ] Hamburger menu on mobile
  - [ ] Menu opens/closes correctly
  - [ ] All items accessible
  - [ ] Overlay works
  - [ ] No scroll on body when open
- [ ] **Breadcrumbs**
  - [ ] Show on nested pages
  - [ ] "חזרה ל..." links work
  - [ ] RTL arrow direction

---

## 4️⃣ FEEDBACK SYSTEM 💬

### 4.1 Submit Feedback (Public)
- [ ] **Navigate to**: `/feedback` or homepage form
- [ ] **Anonymous Form**
  - [ ] Message textarea (required)
  - [ ] Category dropdown (optional)
  - [ ] No name/email required
  - [ ] Character count shown
  - [ ] Min/max validation
- [ ] **Submit**
  - [ ] Loading state
  - [ ] Success message
  - [ ] Form clears
  - [ ] Error handling

### 4.2 View Feedback (Admin)
- [ ] **Navigate to**: `/admin/feedback`
- [ ] **Feedback List**
  - [ ] All feedback items shown
  - [ ] Date, category, excerpt visible
  - [ ] Status indicators
  - [ ] Click to expand/view full
- [ ] **Status Management**
  - [ ] Mark as read/unread
  - [ ] Change status (new, in_progress, resolved)
  - [ ] Add internal notes
  - [ ] Soft delete
- [ ] **Filtering**
  - [ ] Filter by status
  - [ ] Filter by category
  - [ ] Filter by date range
  - [ ] Search text
- [ ] **Statistics**
  - [ ] Total count
  - [ ] By status breakdown
  - [ ] By category breakdown
  - [ ] Charts/graphs (if implemented)

---

## 5️⃣ COMMITTEES SYSTEM 👥

### 5.1 Committees List
- [ ] **Navigate to**: `/admin/committees`
- [ ] **List View**
  - [ ] All committees visible
  - [ ] Color indicators
  - [ ] Member count
  - [ ] Responsibilities listed
- [ ] **Committee Card**
  - [ ] Name, description
  - [ ] Color badge
  - [ ] Members with avatars
  - [ ] Edit/delete actions

### 5.2 Create/Edit Committee
- [ ] **Navigate to**: `/admin/committees/new`
- [ ] **Form Fields**
  - [ ] Name (required)
  - [ ] Description (optional)
  - [ ] Color picker
  - [ ] Members (multi-select or add)
  - [ ] Responsibilities (tags/chips)
- [ ] **Validation**
  - [ ] Name required
  - [ ] Color format validated
  - [ ] Members list valid
- [ ] **WhatsApp Integration**
  - [ ] Share button available
  - [ ] Generates WhatsApp link
  - [ ] Message template correct
  - [ ] Opens WhatsApp correctly

---

## 6️⃣ TASKS & RESPONSIBILITIES ✅

### 6.1 Tasks List
- [ ] **Navigate to**: `/tasks`
- [ ] **Task Display**
  - [ ] All tasks shown
  - [ ] Status indicators (pending, in_progress, completed)
  - [ ] Due date visible
  - [ ] Owner name
  - [ ] Priority indicators
- [ ] **Filtering**
  - [ ] Filter by status
  - [ ] Filter by priority
  - [ ] Filter by owner
  - [ ] Overdue tasks highlighted

### 6.2 Create/Assign Task
- [ ] **Navigate to**: `/admin/tasks/new`
- [ ] **Form Fields**
  - [ ] Title (required)
  - [ ] Description
  - [ ] Owner name (required)
  - [ ] Owner phone
  - [ ] Due date (datetime)
  - [ ] Priority
  - [ ] Event link (optional)
- [ ] **Assignment**
  - [ ] Can assign to committee member
  - [ ] Notification sent (if enabled)
  - [ ] Task appears in owner's list

---

## 7️⃣ RESPONSIVE DESIGN 📱

### 7.1 Mobile (375px - iPhone SE)
- [ ] **Layout**
  - [ ] No horizontal scroll
  - [ ] Text readable (min 14px)
  - [ ] Buttons tap-friendly (44px min)
  - [ ] Spacing adequate
- [ ] **Navigation**
  - [ ] Hamburger menu works
  - [ ] Bottom nav (if used) accessible
  - [ ] Back button visible
- [ ] **Forms**
  - [ ] Inputs full-width
  - [ ] Labels above inputs
  - [ ] Keyboard doesn't break layout
  - [ ] Submit button fixed or visible
- [ ] **Cards/Lists**
  - [ ] Stack vertically
  - [ ] Touch targets adequate
  - [ ] Swipe gestures work
- [ ] **Photos Carousel**
  - [ ] Horizontal scroll smooth
  - [ ] Touch/swipe works
  - [ ] Cards sized appropriately
  - [ ] No layout shift

### 7.2 Tablet (768px - iPad)
- [ ] **Layout**
  - [ ] 2-column grids work
  - [ ] Sidebar (if any) visible
  - [ ] Spacing optimized
- [ ] **Navigation**
  - [ ] Full menu visible or expanded
  - [ ] Breadcrumbs accessible
- [ ] **Events Grid**
  - [ ] 2 columns
  - [ ] Cards properly sized
- [ ] **Photos Carousel**
  - [ ] Shows 2-3 cards visible
  - [ ] Scroll smooth

### 7.3 Desktop (1920px)
- [ ] **Layout**
  - [ ] Max-width containers (avoid full-width)
  - [ ] 3+ column grids
  - [ ] Proper whitespace
- [ ] **Navigation**
  - [ ] Horizontal menu
  - [ ] Hover states work
- [ ] **Events Grid**
  - [ ] 3 columns
  - [ ] Cards well-proportioned
- [ ] **Photos Carousel**
  - [ ] Shows 4-5 cards visible
  - [ ] Mouse wheel scroll works

### 7.4 RTL (Right-to-Left) Support
- [ ] **Text Direction**
  - [ ] Hebrew text reads right-to-left
  - [ ] Icons on correct side (left for RTL)
  - [ ] Arrows point correct direction
- [ ] **Layout**
  - [ ] Sidebar on right (if RTL)
  - [ ] Form labels aligned right
  - [ ] Breadcrumbs flow right-to-left
- [ ] **Components**
  - [ ] Dropdown menus open correctly
  - [ ] Modals centered
  - [ ] Tooltips positioned correctly
  - [ ] Date pickers RTL-friendly

---

## 8️⃣ UI/UX TESTING 🎨

### 8.1 Color & Contrast
- [ ] **Color Palette**
  - [ ] Sky Blue #87CEEB used correctly
  - [ ] Blue-Green #0D98BA for accents
  - [ ] Prussian Blue #003153 for dark elements
  - [ ] Yellow #FFBA00 for highlights
  - [ ] Orange #FF8200 for CTAs
- [ ] **Contrast Ratios**
  - [ ] Text on background: 4.5:1 minimum (WCAG AA)
  - [ ] Large text: 3:1 minimum
  - [ ] Button text readable
  - [ ] Disabled state visible but distinct

### 8.2 Typography
- [ ] **Font Sizes**
  - [ ] Headings: H1 (3xl), H2 (2xl), H3 (xl)
  - [ ] Body: base (16px)
  - [ ] Small: sm (14px)
  - [ ] Tiny: xs (12px)
- [ ] **Hebrew Font**
  - [ ] Font family supports Hebrew
  - [ ] Letters properly formed
  - [ ] Nikud (if needed) displays
  - [ ] Line-height adequate for Hebrew

### 8.3 Spacing & Layout
- [ ] **Padding/Margin**
  - [ ] Consistent spacing scale (4px, 8px, 16px, 24px, 32px)
  - [ ] Cards have adequate padding
  - [ ] Sections separated clearly
- [ ] **Alignment**
  - [ ] Text aligned right (RTL)
  - [ ] Icons aligned correctly
  - [ ] Forms aligned right
- [ ] **Grid System**
  - [ ] Responsive breakpoints work
  - [ ] Gap/gutter consistent
  - [ ] No overlap at any size

### 8.4 Interactive Elements
- [ ] **Buttons**
  - [ ] Primary, secondary, outline variants distinct
  - [ ] Hover state visible
  - [ ] Active state visible
  - [ ] Disabled state clear
  - [ ] Loading state (spinner)
  - [ ] Icon + text spacing
- [ ] **Links**
  - [ ] Underline or distinct color
  - [ ] Hover state
  - [ ] Visited state (if applicable)
  - [ ] External link icon
- [ ] **Forms**
  - [ ] Focus state (outline/ring)
  - [ ] Error state (red border + message)
  - [ ] Success state
  - [ ] Placeholder text visible
  - [ ] Required indicator (*)
- [ ] **Modals/Dialogs**
  - [ ] Overlay visible (semi-transparent)
  - [ ] Close button accessible
  - [ ] ESC key closes
  - [ ] Click outside closes (if appropriate)
  - [ ] No scroll on body when open

### 8.5 Loading & States
- [ ] **Loading States**
  - [ ] Skeleton loaders on initial load
  - [ ] Spinners for actions
  - [ ] Progress bars (if long operation)
  - [ ] Disable submit during load
- [ ] **Empty States**
  - [ ] Helpful message
  - [ ] Icon/illustration
  - [ ] CTA to create/add
- [ ] **Error States**
  - [ ] Clear error message in Hebrew
  - [ ] Retry action available
  - [ ] Error icon
  - [ ] Not scary/technical

### 8.6 Animations & Transitions
- [ ] **Page Transitions**
  - [ ] Smooth (no jarring)
  - [ ] Duration: 150-300ms
  - [ ] Easing: ease-in-out
- [ ] **Component Animations**
  - [ ] Hover transitions smooth
  - [ ] Modal fade in/out
  - [ ] Dropdown slide
  - [ ] Toast notifications slide in
- [ ] **Performance**
  - [ ] No janky animations
  - [ ] 60fps maintained
  - [ ] No layout shift

---

## 9️⃣ DATA VALIDATION & EDGE CASES 🔍

### 9.1 Input Validation
- [ ] **Required Fields**
  - [ ] Empty submission blocked
  - [ ] Error message shown
  - [ ] Field highlighted
- [ ] **Data Types**
  - [ ] Numbers: only digits accepted
  - [ ] Dates: valid format enforced
  - [ ] URLs: protocol required
  - [ ] Emails: format validated
  - [ ] Phone: format validated
- [ ] **Length Limits**
  - [ ] Min length enforced
  - [ ] Max length enforced
  - [ ] Character count shown
  - [ ] Trim whitespace
- [ ] **Special Characters**
  - [ ] HTML/scripts escaped
  - [ ] SQL injection prevented
  - [ ] XSS prevented
  - [ ] Emoji support

### 9.2 Edge Cases
- [ ] **No Data**
  - [ ] Empty events list
  - [ ] Empty tasks list
  - [ ] Empty committees list
  - [ ] Empty feedback list
  - [ ] All show appropriate empty states
- [ ] **Large Data**
  - [ ] 100+ events → pagination/virtual scroll
  - [ ] Long event titles → truncate
  - [ ] Long descriptions → show more/less
  - [ ] Large images → lazy load
- [ ] **Dates**
  - [ ] Past events handled
  - [ ] Far future events (10 years)
  - [ ] Leap years
  - [ ] DST transitions
  - [ ] Timezone handling
- [ ] **Photos**
  - [ ] Event with no photos_url
  - [ ] Event with invalid URL
  - [ ] Event with photos but in future
  - [ ] Past event no photos
  - [ ] All past events have photos
- [ ] **Hebrew Text**
  - [ ] Mixed Hebrew + English
  - [ ] Hebrew + numbers
  - [ ] Hebrew + emojis
  - [ ] Very long Hebrew words
  - [ ] Nikud/diacritics

### 9.3 Concurrent Operations
- [ ] **Multiple Tabs**
  - [ ] Edit same event in 2 tabs
  - [ ] Version conflict handling
  - [ ] Data refresh on focus
- [ ] **Offline Behavior**
  - [ ] Service worker caches pages
  - [ ] Offline indicator shown
  - [ ] Queue actions for sync
  - [ ] Sync when back online

---

## 🔟 PERFORMANCE TESTING ⚡

### 10.1 Load Times
- [ ] **Initial Load**
  - [ ] Homepage < 2s (3G)
  - [ ] Events page < 2s
  - [ ] Event detail < 1s
- [ ] **Subsequent Navigation**
  - [ ] Client-side nav < 200ms
  - [ ] Prefetching works (Next.js)
- [ ] **Assets**
  - [ ] Images optimized (WebP, lazy)
  - [ ] CSS/JS minified
  - [ ] Fonts preloaded

### 10.2 Rendering Performance
- [ ] **FCP (First Contentful Paint)** < 1.8s
- [ ] **LCP (Largest Contentful Paint)** < 2.5s
- [ ] **CLS (Cumulative Layout Shift)** < 0.1
- [ ] **FID (First Input Delay)** < 100ms
- [ ] **TTI (Time to Interactive)** < 3.8s

### 10.3 Runtime Performance
- [ ] **Smooth Scrolling**
  - [ ] No jank on scroll
  - [ ] Photos carousel smooth
  - [ ] Infinite scroll (if used)
- [ ] **Memory Leaks**
  - [ ] Navigate 100 times → no leak
  - [ ] Open/close modals → no leak
  - [ ] Event listeners cleaned up

---

## 1️⃣1️⃣ ACCESSIBILITY (A11Y) ♿

### 11.1 Keyboard Navigation
- [ ] **Tab Order**
  - [ ] Logical tab order (RTL aware)
  - [ ] No tab traps
  - [ ] Focus visible
  - [ ] Skip to content link
- [ ] **Keyboard Shortcuts**
  - [ ] ESC closes modals
  - [ ] Enter submits forms
  - [ ] Arrow keys in lists (if applicable)

### 11.2 Screen Readers
- [ ] **ARIA Labels**
  - [ ] Buttons have aria-label
  - [ ] Links have descriptive text
  - [ ] Form inputs have labels
  - [ ] Icons have aria-hidden or label
- [ ] **Semantic HTML**
  - [ ] Headings hierarchy (h1 → h2 → h3)
  - [ ] Lists use <ul>/<ol>
  - [ ] Forms use <form>
  - [ ] Buttons use <button>
- [ ] **Screen Reader Test**
  - [ ] Test with VoiceOver (Mac/iOS)
  - [ ] Test with NVDA (Windows)
  - [ ] Hebrew text reads correctly
  - [ ] Navigation makes sense

### 11.3 Visual Accessibility
- [ ] **Color Blindness**
  - [ ] Info not conveyed by color alone
  - [ ] Icons + text, not just color
  - [ ] Test with colorblind simulator
- [ ] **Low Vision**
  - [ ] Zoom to 200% → still usable
  - [ ] High contrast mode works
  - [ ] Focus indicators clear
- [ ] **Motion Sensitivity**
  - [ ] Respect prefers-reduced-motion
  - [ ] Option to disable animations
  - [ ] No auto-playing videos

---

## 1️⃣2️⃣ BROWSER & DEVICE TESTING 🌐

### 12.1 Browsers
- [ ] **Chrome** (latest)
  - [ ] Desktop
  - [ ] Mobile (Android)
- [ ] **Safari** (latest)
  - [ ] macOS
  - [ ] iOS (iPhone, iPad)
- [ ] **Firefox** (latest)
  - [ ] Desktop
  - [ ] Mobile (Android)
- [ ] **Edge** (latest)
  - [ ] Desktop

### 12.2 Mobile Devices
- [ ] **iOS**
  - [ ] iPhone SE (375px)
  - [ ] iPhone 13/14 (390px)
  - [ ] iPhone 14 Pro Max (428px)
  - [ ] iPad (768px)
- [ ] **Android**
  - [ ] Pixel 5 (393px)
  - [ ] Samsung Galaxy (412px)
  - [ ] Tablet (600px+)

### 12.3 Browser Features
- [ ] **Service Worker**
  - [ ] Registers correctly
  - [ ] Caches assets
  - [ ] Updates on new version
- [ ] **Local Storage**
  - [ ] Saves preferences
  - [ ] Survives refresh
  - [ ] Handles quota exceeded
- [ ] **Session Storage**
  - [ ] Temporary data saved
  - [ ] Cleared on tab close

---

## 1️⃣3️⃣ SECURITY TESTING 🔒

### 13.1 Authentication
- [ ] **Password Auth**
  - [ ] Global password required for admin
  - [ ] Password hashed (bcrypt)
  - [ ] Session management
  - [ ] Logout works
  - [ ] Session timeout
- [ ] **Authorization**
  - [ ] Public routes accessible
  - [ ] Admin routes protected
  - [ ] Redirect to login if unauthorized
  - [ ] No bypass via URL manipulation

### 13.2 Input Sanitization
- [ ] **XSS Prevention**
  - [ ] Script tags escaped
  - [ ] Event handlers stripped
  - [ ] Test: `<script>alert('xss')</script>`
- [ ] **SQL Injection**
  - [ ] Parameterized queries (Supabase)
  - [ ] Test: `'; DROP TABLE events; --`
- [ ] **CSRF**
  - [ ] CSRF tokens on forms
  - [ ] Same-origin policy
  - [ ] Test with Postman/curl

### 13.3 Data Privacy
- [ ] **Anonymous Feedback**
  - [ ] No IP address logged
  - [ ] No identifying info required
  - [ ] Cannot trace to user
- [ ] **Photos URLs**
  - [ ] Public Google Drive links only
  - [ ] No private/restricted folders
  - [ ] Links expire (if set)

---

## 1️⃣4️⃣ INTEGRATION TESTING 🔗

### 14.1 Supabase Integration
- [ ] **Database**
  - [ ] CRUD operations work
  - [ ] Row Level Security enforced
  - [ ] Triggers fire correctly
  - [ ] Constraints enforced
- [ ] **Real-time**
  - [ ] Subscriptions work (if used)
  - [ ] Updates reflect across tabs
  - [ ] Connection resilient

### 14.2 Google Calendar API
- [ ] **Sync**
  - [ ] Events sync to calendar
  - [ ] Updates sync bidirectionally
  - [ ] Deletions sync
  - [ ] google_event_id stored
- [ ] **Error Handling**
  - [ ] API rate limit handled
  - [ ] Auth token expiry handled
  - [ ] Network errors handled

### 14.3 WhatsApp Integration
- [ ] **Share Links**
  - [ ] Generates correct wa.me link
  - [ ] Message template correct
  - [ ] Opens WhatsApp app
  - [ ] Works on mobile
  - [ ] Works on desktop (WhatsApp Web)

---

## 1️⃣5️⃣ DEPLOYMENT & PRODUCTION 🚀

### 15.1 Build Process
- [ ] **Build Succeeds**
  - [ ] `npm run build` succeeds
  - [ ] No TypeScript errors
  - [ ] No ESLint errors
  - [ ] Bundle size acceptable (<500KB)
- [ ] **Environment Variables**
  - [ ] All required vars set
  - [ ] Secrets not in code
  - [ ] .env.production used

### 15.2 Railway Deployment
- [ ] **Deploy**
  - [ ] Push to main → auto-deploy
  - [ ] Build logs clean
  - [ ] Health check passes
  - [ ] Domain (pipguru.club) resolves
- [ ] **SSL/HTTPS**
  - [ ] Certificate valid
  - [ ] No mixed content warnings
  - [ ] Secure cookies

### 15.3 Production Testing
- [ ] **Smoke Test**
  - [ ] Homepage loads
  - [ ] Events page loads
  - [ ] Admin login works
  - [ ] Create event works
  - [ ] Photos feature works
- [ ] **Monitoring**
  - [ ] Error tracking (Sentry/similar)
  - [ ] Analytics tracking
  - [ ] Uptime monitoring
  - [ ] Performance monitoring

---

## 🎯 TEST EXECUTION CHECKLIST

### Priority 1 (Critical) - Must Pass
- [ ] Photos feature fully functional
- [ ] Events CRUD works
- [ ] Mobile responsive (375px)
- [ ] RTL layout correct
- [ ] No console errors
- [ ] Build succeeds

### Priority 2 (High) - Should Pass
- [ ] All forms validate correctly
- [ ] Admin auth works
- [ ] Feedback system works
- [ ] Tablets responsive (768px)
- [ ] Loading states work
- [ ] Error handling graceful

### Priority 3 (Medium) - Nice to Have
- [ ] All animations smooth
- [ ] Empty states helpful
- [ ] Accessibility good (WCAG AA)
- [ ] Desktop optimized (1920px)
- [ ] Performance good (Lighthouse 90+)

---

## 📊 TEST REPORT TEMPLATE

```markdown
# Test Report - [Date]

## Environment
- URL: _______________
- Browser: _______________
- Device: _______________
- Tester: _______________

## Summary
- Tests Run: _____ / _____
- Passed: _____ ✅
- Failed: _____ ❌
- Blocked: _____ 🚫
- Pass Rate: _____%

## Critical Issues
1. [Issue description]
   - Severity: Critical/High/Medium/Low
   - Steps to reproduce:
   - Expected:
   - Actual:
   - Screenshot/video:

## Recommendations
- [ ] Fix critical issues before prod
- [ ] Performance optimization needed
- [ ] Accessibility improvements
- [ ] Additional features to consider

## Sign-off
- [ ] All P1 tests passed
- [ ] Ready for production
```

---

## 🛠️ TOOLS & AUTOMATION

### Recommended Tools
- **Manual Testing**: Chrome DevTools, Safari Web Inspector
- **Mobile Testing**: BrowserStack, real devices
- **Performance**: Lighthouse, WebPageTest
- **Accessibility**: axe DevTools, WAVE
- **Visual Regression**: Percy, Chromatic
- **Automation**: Playwright, Cypress (future)

### Playwright Test Script (Example)
```typescript
// tests/photos-feature.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Photos Feature', () => {
  test('should show photos tab on events page', async ({ page }) => {
    await page.goto('/events');
    await expect(page.locator('text=עם תמונות')).toBeVisible();
  });

  test('should display photos carousel on homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=גלריית תמונות מאירועים')).toBeVisible();
  });

  test('should open Google Drive link', async ({ page, context }) => {
    await page.goto('/events/4'); // Event with photos
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.click('text=פתח גלריה')
    ]);
    await expect(newPage.url()).toContain('drive.google.com');
  });
});
```

---

## 📝 NOTES

- Run tests in **Hebrew locale** to verify all text displays correctly
- Test on **actual devices**, not just DevTools simulation
- Pay attention to **RTL edge cases** (arrows, icons, animations)
- **Photos feature** is the newest - give extra attention
- Document all bugs in **GitHub Issues** with screenshots
- **Prioritize mobile** - most users will be on mobile

---

**Last Updated**: October 1, 2025
**Version**: 1.0
**Status**: Ready for Execution ✅
