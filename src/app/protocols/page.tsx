import { Suspense } from 'react'
import { FileText, Download, ExternalLink, Search, Calendar, Plus } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatHebrewDate } from '@/lib/utils/date'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

// Fetch protocols from database
async function getProtocols() {
  const supabase = createClient()

  const { data: protocols, error } = await supabase
    .from('protocols')
    .select('*')
    .eq('is_public', true)
    .order('protocol_date', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching protocols:', error)
    return []
  }

  return protocols || []
}

// Group protocols by year
function groupProtocolsByYear(protocols: any[]) {
  const grouped: { [key: string]: any[] } = {}

  protocols.forEach(protocol => {
    const year = protocol.year || new Date(protocol.protocol_date).getFullYear()
    if (!grouped[year]) {
      grouped[year] = []
    }
    grouped[year].push(protocol)
  })

  return Object.entries(grouped)
    .sort(([a], [b]) => Number(b) - Number(a))
    .map(([year, items]) => ({ year, protocols: items }))
}

function ProtocolsListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
      ))}
    </div>
  )
}

function ProtocolCard({ protocol }: { protocol: any }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">{protocol.title}</CardTitle>
            <CardDescription className="mt-2">
              {protocol.summary}
            </CardDescription>
          </div>
          <Badge variant="outline">
            {protocol.protocol_number || `פרוטוקול ${protocol.id.slice(0, 8)}`}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatHebrewDate(new Date(protocol.protocol_date))}
            </div>
            {protocol.categories && protocol.categories.length > 0 && (
              <div className="flex items-center gap-1">
                {protocol.categories.map((cat: string, i: number) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {cat}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" asChild>
              <Link href={`/protocols/${protocol.id}`}>
                <FileText className="h-4 w-4 ml-2" />
                צפייה
              </Link>
            </Button>
            {protocol.external_link && (
              <Button size="sm" variant="outline" asChild>
                <a href={protocol.external_link} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 ml-2" />
                  מסמך מקורי
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

async function ProtocolsList() {
  const protocols = await getProtocols()

  if (protocols.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">אין פרוטוקולים</h3>
        <p className="text-muted-foreground mb-6">
          עדיין לא נוספו פרוטוקולים למערכת
        </p>
        <Button asChild>
          <Link href="/admin/protocols/new">
            <Plus className="h-4 w-4 ml-2" />
            הוסף פרוטוקול
          </Link>
        </Button>
      </div>
    )
  }

  const groupedProtocols = groupProtocolsByYear(protocols)

  return (
    <div className="space-y-8">
      {groupedProtocols.map(({ year, protocols: yearProtocols }) => (
        <div key={year} className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">{year}</h2>
            <Badge variant="outline" className="text-sm">
              {yearProtocols.length} פרוטוקולים
            </Badge>
          </div>
          <div className="grid gap-4">
            {yearProtocols.map((protocol) => (
              <ProtocolCard key={protocol.id} protocol={protocol} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// Statistics component
async function ProtocolStats() {
  const supabase = createClient()

  const { count: totalCount } = await supabase
    .from('protocols')
    .select('*', { count: 'exact', head: true })

  const currentYear = new Date().getFullYear()
  const { count: thisYearCount } = await supabase
    .from('protocols')
    .select('*', { count: 'exact', head: true })
    .eq('year', currentYear)

  return (
    <div className="grid gap-4 md:grid-cols-3 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">סה"כ פרוטוקולים</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCount || 0}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">השנה</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{thisYearCount || 0}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">שנה אקדמית</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold">תשפ"ה</div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ProtocolsPage() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">פרוטוקולים</h1>
          <p className="text-muted-foreground mt-2">
            ארכיון פרוטוקולים ומסמכי ישיבות ועד ההורים
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Search className="h-4 w-4 ml-2" />
            חיפוש
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 ml-2" />
            ייצוא
          </Button>
          <Button asChild>
            <Link href="/admin/protocols/new">
              <Plus className="h-4 w-4 ml-2" />
              פרוטוקול חדש
            </Link>
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <Suspense fallback={<div className="h-32 bg-gray-200 rounded animate-pulse" />}>
        <ProtocolStats />
      </Suspense>

      {/* Protocols List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            ארכיון פרוטוקולים
          </CardTitle>
          <CardDescription>
            כל הפרוטוקולים והמסמכים של ועד ההורים
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<ProtocolsListSkeleton />}>
            <ProtocolsList />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}