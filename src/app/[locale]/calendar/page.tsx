import BeeriCalendar from '@/components/calendar/BeeriCalendar'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'לוח אירועים | ועד הורים',
  description: 'לוח אירועים של ועד ההורים'
}

async function getEvents() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'published')
    .order('start_datetime', { ascending: true })

  if (error) {
    console.error('Error fetching events:', error)
    return []
  }

  return data || []
}

async function getHolidays() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('holidays')
    .select('*')
    .order('start_date', { ascending: true })

  if (error) {
    console.error('Error fetching holidays:', error)
    return []
  }

  return data || []
}

export default async function CalendarPage() {
  const events = await getEvents()
  const holidays = await getHolidays()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">לוח אירועים</h1>
        <p className="text-muted-foreground">
          כל האירועים, החגים והפעילויות של ועד ההורים
        </p>
      </div>

      <BeeriCalendar
        events={events}
        holidays={holidays}
        view="month"
        showCreateButton={false}
      />
    </div>
  )
}