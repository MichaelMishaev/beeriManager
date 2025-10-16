# White Shirt Friday Reminder Feature 👕

## Overview
A smart banner component that automatically reminds parents every week that Friday is "white shirt day" for all students.

## ✅ Implementation Complete

### 🎯 Visibility Window
- **Shows**: Thursday 9:00 AM → Friday 9:00 AM (24-hour reminder window)
- **Hides**: Automatically after Friday 9:00 AM
- **Updates**: Checks every minute for time-based visibility

### 🎨 Design Features
- **Gradient background**: Sky blue to white (school colors)
- **Yellow border**: Attention-grabbing accent
- **Shirt icon**: White rounded background with blue shirt emoji
- **Slide-down animation**: Smooth entrance effect
- **Mobile-first**: Fully responsive design
- **Dismissible**: X button to hide until next occurrence

### 🌍 Internationalization
**Hebrew (Primary)**:
- Thursday: "👕 תזכורת: מחר יום שישי - חולצה לבנה!"
- Friday: "👕 תזכורת: היום חולצה לבנה!"
- Description: "כל תלמידי בית הספר"

**Russian (Secondary)**:
- Thursday: "👕 Напоминание: завтра пятница - белая рубашка!"
- Friday: "👕 Напоминание: сегодня белая рубашка!"
- Description: "Для всех учеников школы"

### 📱 User Experience
1. **First Visibility** (Thursday 9:00 AM):
   - Banner slides down smoothly
   - Shows "Tomorrow is white shirt Friday"
   - Gives parents 24 hours to prepare

2. **Friday Morning** (Until 9:00 AM):
   - Message changes to "Today is white shirt day"
   - Final reminder before school starts

3. **Dismissal**:
   - User can dismiss with X button
   - Stored in localStorage
   - Automatically resets next Thursday 9:00 AM

4. **Automatic Hide** (Friday 9:00 AM):
   - Banner disappears automatically
   - No manual action needed
   - Clean, non-intrusive UX

### 🔧 Technical Implementation

#### Files Created/Modified
1. **Component**: `/src/components/features/homepage/WhiteShirtBanner.tsx`
   - React component with time-based visibility logic
   - localStorage for dismissal tracking
   - Automatic refresh every 60 seconds

2. **Translations**:
   - `/messages/he.json` - Hebrew translations
   - `/messages/ru.json` - Russian translations

3. **Integration**:
   - `/src/components/features/homepage/PublicHomepage.tsx` - Public view
   - `/src/components/features/dashboard/Dashboard.tsx` - Admin view

4. **Styles**:
   - `/src/app/globals.css` - Added slideDown animation

5. **Tests**:
   - `/scripts/test-white-shirt-banner.ts` - Logic validation

#### Test Results
```
✅ All 16 test cases passed
- Wednesday: Hidden ✓
- Thursday before 9 AM: Hidden ✓
- Thursday 9 AM - 11:59 PM: Visible ✓
- Friday 12:00 AM - 8:59 AM: Visible ✓
- Friday after 9 AM: Hidden ✓
- Weekend: Hidden ✓
```

### 💾 LocalStorage Schema
```typescript
{
  "whiteShirtBannerDismissed": "2025-10-23T09:00:00.000Z" // Next Thursday 9 AM
}
```

### 🎯 Key Features
- ✅ Time-based automatic visibility
- ✅ Bilingual support (Hebrew + Russian)
- ✅ Mobile-responsive design
- ✅ Smooth animations
- ✅ Dismissible with persistence
- ✅ Zero configuration needed
- ✅ Automatic weekly reset
- ✅ Non-intrusive UX
- ✅ Accessible design

### 📊 Usage Statistics (Future Enhancement)
Consider tracking:
- Banner impressions per week
- Dismissal rate
- Time of day when most viewed
- User engagement metrics

### 🚀 Future Enhancements (Optional)
1. **Push Notification**: Optional Thursday evening reminder
2. **Custom Message**: Admin can customize the reminder text
3. **Different Days**: Support other weekly reminders (not just Friday)
4. **Color Variations**: Support different shirt colors for different grades
5. **Analytics**: Track how many parents see/dismiss the banner

### 🔍 Testing the Feature

#### Manual Testing
1. Change your computer's date/time to Thursday 8:59 AM → Banner should NOT show
2. Change to Thursday 9:00 AM → Banner should appear
3. Change to Friday 8:59 AM → Banner should still show
4. Change to Friday 9:00 AM → Banner should disappear

#### Automated Testing
```bash
npx tsx scripts/test-white-shirt-banner.ts
```

### 📝 Notes
- Banner appears on both public homepage and admin dashboard
- Time checks use local browser timezone (Israel time assumed)
- Banner is lightweight and doesn't impact page load performance
- Works offline (PWA compatible)

### 🎨 Design Specs
```css
Background: Linear gradient (sky-100 → white → sky-100)
Border: 2px solid yellow-400
Border Radius: 8px (rounded-lg)
Padding: 16px
Shadow: Medium (shadow-md)
Animation: slideDown 0.5s ease-out
Icon Size: 24x24px (h-6 w-6)
Icon Background: White rounded-full with padding
```

### 🌐 Browser Compatibility
- ✅ Chrome/Edge (Chromium)
- ✅ Safari (iOS + macOS)
- ✅ Firefox
- ✅ Mobile browsers
- ✅ PWA installed apps

---

**Created**: 2025-10-16
**Status**: ✅ Production Ready
**Tested**: ✅ All test cases passed
**Deployed**: Ready for deployment
