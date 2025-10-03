import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { FileText, ExternalLink, Calendar, ArrowRight, Download, Share2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatHebrewDate } from '@/lib/utils/date'
import { createClient } from '@/lib/supabase/server'

async function getProtocol(id: string) {
  const supabase = createClient()

  const { data: protocol, error } = await supabase
    .from('protocols')
    .select('*')
    .eq('id', id)
    .eq('is_public', true)
    .single()

  if (error || !protocol) {
    return null
  }

  return protocol
}

async function getRelatedProtocols(year: number, currentId: string) {
  const supabase = createClient()

  const { data: protocols } = await supabase
    .from('protocols')
    .select('id, title, protocol_date, protocol_number')
    .eq('year', year)
    .eq('is_public', true)
    .neq('id', currentId)
    .order('protocol_date', { ascending: false })
    .limit(5)

  return protocols || []
}

function ProtocolDetailSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-64 bg-gray-200 rounded-lg animate-pulse" />
      <div className="h-96 bg-gray-200 rounded-lg animate-pulse" />
    </div>
  )
}

async function ProtocolContent({ id }: { id: string }) {
  const protocol = await getProtocol(id)

  if (!protocol) {
    notFound()
  }

  const relatedProtocols = await getRelatedProtocols(protocol.year || new Date(protocol.protocol_date).getFullYear(), protocol.id)

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="outline" size="sm" asChild>
        <Link href="/protocols">
          <ArrowRight className="h-4 w-4 ml-2" />
          חזרה לפרוטוקולים
        </Link>
      </Button>

      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-base">
                  {protocol.protocol_number || `פרוטוקול ${protocol.id.slice(0, 8)}`}
                </Badge>
                <Badge variant="secondary">
                  {protocol.year || new Date(protocol.protocol_date).getFullYear()}
                </Badge>
              </div>
              <CardTitle className="text-2xl md:text-3xl">{protocol.title}</CardTitle>
              <CardDescription className="text-base">
                {formatHebrewDate(new Date(protocol.protocol_date))}
              </CardDescription>
            </div>
            <FileText className="h-10 w-10 text-muted-foreground flex-shrink-0" />
          </div>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* ChatGPT Formatted Content */}
          {protocol.extracted_text && (
            <Card>
              <CardHeader>
                <CardTitle>תוכן הפרוטוקול</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="prose prose-sm max-w-none prose-headings:text-primary prose-h2:text-xl prose-h3:text-lg"
                  dangerouslySetInnerHTML={{ __html: protocol.extracted_text }}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">פעולות</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {protocol.external_link && (
                <Button variant="default" className="w-full" asChild size="sm">
                  <a href={protocol.external_link} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 ml-2" />
                    צפה במסמך המקורי
                  </a>
                </Button>
              )}
              <Button variant="outline" size="sm" className="w-full">
                <Download className="h-4 w-4 ml-2" />
                הורד PDF
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                <Share2 className="h-4 w-4 ml-2" />
                שתף
              </Button>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">פרטים</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">תאריך:</span>
                  <span className="font-medium">
                    {formatHebrewDate(new Date(protocol.protocol_date))}
                  </span>
                </div>
                {protocol.protocol_number && (
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">מספר:</span>
                    <span className="font-medium">{protocol.protocol_number}</span>
                  </div>
                )}
              </div>

              <Separator />

              {/* Categories */}
              {protocol.categories && protocol.categories.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">קטגוריות:</p>
                  <div className="flex flex-wrap gap-2">
                    {protocol.categories.map((category: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Participants */}
              {protocol.participants && protocol.participants.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">משתתפים:</p>
                  <div className="space-y-1">
                    {protocol.participants.map((participant: string, index: number) => (
                      <p key={index} className="text-sm">• {participant}</p>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Related Protocols */}
          {relatedProtocols.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">פרוטוקולים נוספים מאותה שנה</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {relatedProtocols.map((related) => (
                  <Link
                    key={related.id}
                    href={`/protocols/${related.id}`}
                    className="block p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <p className="text-sm font-medium line-clamp-2">
                      {related.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatHebrewDate(new Date(related.protocol_date))}
                    </p>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ProtocolDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto px-4 py-6">
      <Suspense fallback={<ProtocolDetailSkeleton />}>
        <ProtocolContent id={params.id} />
      </Suspense>
    </div>
  )
}