'use client'

import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Calendar as CalendarIcon, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MobileCalendar } from '@/components/ui/MobileCalendar'
import { NextHolidayWidget } from '@/components/features/holidays/NextHolidayWidget'

// Mock calendar events for demo
const mockCalendarEvents = [
  {
    id: '1',
    title: 'חנוכה',
    date: new Date(2025, 9, 7), // Oct 7
    type: 'holiday' as const,
    isSchoolClosed: true
  },
  {
    id: '2',
    title: 'פורים',
    date: new Date(2025, 9, 15), // Oct 15
    type: 'holiday' as const,
    isSchoolClosed: true
  }
]

export default function CalendarLayoutsTestPage() {
  const [selectedApproach, setSelectedApproach] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">🎨 Calendar Layout Approaches - Visual Test</CardTitle>
            <p className="text-muted-foreground">
              Click on each approach to see it in action on mobile viewport
            </p>
          </CardHeader>
        </Card>

        {/* Approach Selection Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Approach 1: Collapsible */}
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedApproach('collapsible')}
          >
            <CardHeader>
              <CardTitle className="text-lg">1️⃣ Collapsible Calendar</CardTitle>
              <Badge className="w-fit">Recommended ⭐</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Next Holiday always visible, tap to expand/collapse calendar
              </p>
              <div className="text-xs text-blue-600">
                ✅ Best UX<br/>
                ✅ Space efficient<br/>
                ✅ Familiar pattern
              </div>
            </CardContent>
          </Card>

          {/* Approach 2: Horizontal Scroll */}
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedApproach('horizontal')}
          >
            <CardHeader>
              <CardTitle className="text-lg">2️⃣ Horizontal Scroll</CardTitle>
              <Badge variant="secondary" className="w-fit">Stories Style</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Swipe horizontally between widgets
              </p>
              <div className="text-xs text-blue-600">
                ✅ Familiar gesture<br/>
                ⚠️ Calendar hidden initially<br/>
                ✅ Clean look
              </div>
            </CardContent>
          </Card>

          {/* Approach 3: Sticky + Compact */}
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedApproach('sticky')}
          >
            <CardHeader>
              <CardTitle className="text-lg">3️⃣ Sticky + Compact</CardTitle>
              <Badge variant="outline" className="w-fit">Progressive</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Sticky header, compact calendar (week view)
              </p>
              <div className="text-xs text-blue-600">
                ✅ Always visible<br/>
                ✅ Space efficient<br/>
                ✅ Quick access
              </div>
            </CardContent>
          </Card>

          {/* Approach 4: Bottom Sheet */}
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedApproach('bottomsheet')}
          >
            <CardHeader>
              <CardTitle className="text-lg">4️⃣ Bottom Sheet</CardTitle>
              <Badge variant="secondary" className="w-fit">Modal</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Floating button opens calendar from bottom
              </p>
              <div className="text-xs text-blue-600">
                ✅ No space taken<br/>
                ✅ Full calendar view<br/>
                ⚠️ Extra tap needed
              </div>
            </CardContent>
          </Card>

          {/* Approach 5: Tabs */}
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedApproach('tabs')}
          >
            <CardHeader>
              <CardTitle className="text-lg">5️⃣ Tabbed Interface</CardTitle>
              <Badge variant="outline" className="w-fit">Separated</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Switch between Next Holiday and Calendar views
              </p>
              <div className="text-xs text-blue-600">
                ✅ Clear separation<br/>
                ✅ Full space each<br/>
                ⚠️ Context switching
              </div>
            </CardContent>
          </Card>

          {/* Approach 6: Card Stack */}
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedApproach('cardstack')}
          >
            <CardHeader>
              <CardTitle className="text-lg">6️⃣ Card Stack Peek</CardTitle>
              <Badge variant="secondary" className="w-fit">Layered</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Stacked cards with peek preview
              </p>
              <div className="text-xs text-blue-600">
                ✅ Visual depth<br/>
                ✅ Discoverable<br/>
                ⚠️ Less common
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mobile Preview Modal */}
        {selectedApproach && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden relative">
              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 left-4 z-10"
                onClick={() => setSelectedApproach(null)}
              >
                <X className="h-5 w-5" />
              </Button>

              {/* Device Frame */}
              <div className="bg-gray-100 rounded-3xl p-4 h-[600px] overflow-y-auto">
                <div className="text-xs text-center text-gray-500 mb-2">
                  📱 Mobile Preview
                </div>

                {selectedApproach === 'collapsible' && <CollapsibleApproach />}
                {selectedApproach === 'horizontal' && <HorizontalScrollApproach />}
                {selectedApproach === 'sticky' && <StickyCompactApproach />}
                {selectedApproach === 'bottomsheet' && <BottomSheetApproach />}
                {selectedApproach === 'tabs' && <TabbedApproach />}
                {selectedApproach === 'cardstack' && <CardStackApproach />}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Approach 1: Collapsible
function CollapsibleApproach() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="space-y-4">
      {/* Next Holiday Widget - Always Visible */}
      <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="text-4xl">🕎</div>
            <div className="flex-1">
              <h3 className="text-xl font-bold">חנוכה</h3>
              <p className="text-sm text-muted-foreground">כ״ה בכסלו - ב׳ בטבת</p>
              <p className="text-sm font-medium mt-1">📅 בעוד 5 ימים</p>
            </div>
          </div>

          {/* Expand/Collapse Button */}
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4 ml-2" />
                הסתר לוח שנה
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 ml-2" />
                הצג לוח שנה
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Collapsible Calendar */}
      {isExpanded && (
        <div className="animate-in slide-in-from-top duration-300">
          <MobileCalendar
            events={mockCalendarEvents}
            showLegend={false}
            showWeeklySummary={false}
          />
        </div>
      )}

      {/* Other Content Below */}
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-gray-500">
            📋 אירועים קרובים מופיעים כאן...
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// Approach 2: Horizontal Scroll
function HorizontalScrollApproach() {
  const [activeIndex] = useState(0)

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <div className="flex gap-4 pb-4 snap-x snap-mandatory">
          {/* Next Holiday Card */}
          <div className="min-w-full snap-center">
            <NextHolidayWidget onClick={() => {}} />
          </div>

          {/* Calendar Card */}
          <div className="min-w-full snap-center">
            <MobileCalendar
              events={mockCalendarEvents}
              showLegend={false}
              showWeeklySummary={false}
            />
          </div>
        </div>
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center gap-2">
        <div className={`h-2 w-2 rounded-full ${activeIndex === 0 ? 'bg-primary' : 'bg-gray-300'}`} />
        <div className={`h-2 w-2 rounded-full ${activeIndex === 1 ? 'bg-primary' : 'bg-gray-300'}`} />
      </div>

      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-gray-500">
            ← החלק שמאלה לראות לוח שנה
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// Approach 3: Sticky + Compact
function StickyCompactApproach() {
  const [showFullMonth, setShowFullMonth] = useState(false)

  return (
    <div className="space-y-4">
      {/* Sticky Next Holiday */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm pb-2">
        <NextHolidayWidget onClick={() => {}} />
      </div>

      {/* Compact Week View */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center justify-between">
            <span>השבוע הזה</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFullMonth(!showFullMonth)}
            >
              {showFullMonth ? 'הסתר' : 'הצג חודש מלא'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Week Row */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'].map((day, i) => (
              <div key={i} className="text-xs text-gray-500">{day}</div>
            ))}
            {[1, 2, 3, 4, 5, 6, 7].map((num) => (
              <div
                key={num}
                className={`aspect-square flex items-center justify-center text-sm rounded-lg ${
                  num === 2 ? 'bg-primary text-white font-bold' :
                  num === 7 ? 'bg-orange-100 text-orange-900 relative' : ''
                }`}
              >
                {num}
                {num === 7 && <div className="absolute bottom-1 w-1 h-1 rounded-full bg-orange-500" />}
              </div>
            ))}
          </div>

          {showFullMonth && (
            <div className="mt-4 pt-4 border-t">
              <MobileCalendar
                events={mockCalendarEvents}
                showLegend={false}
                showWeeklySummary={false}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Approach 4: Bottom Sheet
function BottomSheetApproach() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="space-y-4 relative min-h-[500px]">
      {/* Next Holiday - Always Visible */}
      <NextHolidayWidget onClick={() => {}} />

      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-gray-500">
            📋 תוכן נוסף מופיע כאן...
          </p>
        </CardContent>
      </Card>

      {/* Floating Calendar Button */}
      <Button
        className="fixed bottom-4 right-4 rounded-full h-14 w-14 shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        <CalendarIcon className="h-6 w-6" />
      </Button>

      {/* Bottom Sheet */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 z-20">
          <div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl p-4 animate-in slide-in-from-bottom duration-300"
          >
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
            <MobileCalendar
              events={mockCalendarEvents}
              showLegend={false}
              showWeeklySummary={false}
            />
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => setIsOpen(false)}
            >
              סגור
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// Approach 5: Tabbed
function TabbedApproach() {
  const [activeTab, setActiveTab] = useState<'holiday' | 'calendar'>('holiday')

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
        <Button
          variant={activeTab === 'holiday' ? 'default' : 'ghost'}
          size="sm"
          className="flex-1"
          onClick={() => setActiveTab('holiday')}
        >
          החג הבא
        </Button>
        <Button
          variant={activeTab === 'calendar' ? 'default' : 'ghost'}
          size="sm"
          className="flex-1"
          onClick={() => setActiveTab('calendar')}
        >
          לוח שנה
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === 'holiday' ? (
        <NextHolidayWidget onClick={() => {}} />
      ) : (
        <MobileCalendar
          events={mockCalendarEvents}
          showLegend={false}
          showWeeklySummary={false}
        />
      )}
    </div>
  )
}

// Approach 6: Card Stack
function CardStackApproach() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="space-y-4 relative">
      {/* Card Stack Container */}
      <div className="relative">
        {/* Calendar Card (Behind) - Peeking */}
        {!isExpanded && (
          <div
            className="absolute top-12 left-0 right-0 bg-blue-100 h-12 rounded-t-2xl z-0 cursor-pointer"
            onClick={() => setIsExpanded(true)}
          >
            <div className="flex items-center justify-center h-full">
              <CalendarIcon className="h-5 w-5 text-blue-600 ml-2" />
              <span className="text-sm text-blue-600">לוח שנה</span>
            </div>
          </div>
        )}

        {/* Next Holiday Card (Front) */}
        <div className={`relative z-10 ${isExpanded ? '' : 'shadow-xl'}`}>
          <NextHolidayWidget onClick={() => {}} />
        </div>
      </div>

      {/* Expanded Calendar */}
      {isExpanded && (
        <div className="animate-in slide-in-from-bottom duration-300">
          <MobileCalendar
            events={mockCalendarEvents}
            showLegend={false}
            showWeeklySummary={false}
          />
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-2"
            onClick={() => setIsExpanded(false)}
          >
            <ChevronUp className="h-4 w-4 ml-2" />
            הסתר
          </Button>
        </div>
      )}
    </div>
  )
}
