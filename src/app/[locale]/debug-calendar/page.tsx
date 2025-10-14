import { createClient } from '@/lib/supabase/server'

export default async function DebugCalendarPage() {
  const supabase = createClient()

  // Get ALL events (no filter)
  const { data: allEvents, error: allError } = await supabase
    .from('events')
    .select('*')
    .order('start_datetime', { ascending: true })

  // Get only published events
  const { data: publishedEvents, error: pubError } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'published')
    .order('start_datetime', { ascending: true })

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <h1 className="text-3xl font-bold mb-6">Debug Calendar Data</h1>

      <div className="space-y-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">All Events ({allEvents?.length || 0})</h2>
          {allError && <p className="text-red-600">Error: {allError.message}</p>}
          <div className="space-y-2">
            {allEvents?.map(event => (
              <div key={event.id} className="p-3 border rounded">
                <div className="font-bold">{event.title}</div>
                <div className="text-sm text-gray-600">
                  Status: <span className="font-semibold">{event.status}</span>
                </div>
                <div className="text-sm text-gray-600">
                  Start: {event.start_datetime}
                </div>
                <div className="text-sm text-gray-600">
                  ID: {event.id}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">Published Events ({publishedEvents?.length || 0})</h2>
          {pubError && <p className="text-red-600">Error: {pubError.message}</p>}
          <div className="space-y-2">
            {publishedEvents?.map(event => (
              <div key={event.id} className="p-3 border rounded bg-green-50">
                <div className="font-bold">{event.title}</div>
                <div className="text-sm text-gray-600">
                  Start: {event.start_datetime}
                </div>
                <div className="text-sm text-gray-600">
                  ID: {event.id}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
