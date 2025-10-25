import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { FileText, ExternalLink, Calendar, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatHebrewDate } from '@/lib/utils/date'
import { createClient } from '@/lib/supabase/server'
import { ShareProtocolButton } from '@/components/protocols/ShareProtocolButton'
import { EditProtocolButton } from '@/components/protocols/EditProtocolButton'
import { DeleteProtocolButton } from '@/components/protocols/DeleteProtocolButton'

const categoryTranslations: Record<string, string> = {
  'regular': 'ישיבה רגילה',
  'special': 'ישיבה מיוחדת',
  'annual': 'אסיפה שנתית',
  'emergency': 'ישיבת חירום'
}

function translateCategory(category: string): string {
  return categoryTranslations[category] || category
}

// Helper function to render text with task mentions highlighted
function renderTextWithTaskMentions(text: string) {
  // Pattern: @TaskTitle[task:id]
  const taskMentionPattern = /@([^[]+)\[task:([^\]]+)\]/g
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match

  while ((match = taskMentionPattern.exec(text)) !== null) {
    // Add text before the mention
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index))
    }

    // Add the task mention as a badge
    const taskTitle = match[1]
    const taskId = match[2]
    parts.push(
      <Badge
        key={`task-${taskId}-${match.index}`}
        variant="secondary"
        className="mx-1 my-0.5 inline-flex items-center gap-1"
      >
        <CheckCircle2 className="h-3 w-3" />
        {taskTitle}
      </Badge>
    )

    lastIndex = match.index + match[0].length
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex))
  }

  return parts.length > 0 ? parts : text
}

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
          {/* Agenda */}
          {protocol.agenda && (
            <Card>
              <CardHeader>
                <CardTitle>סדר יום</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {renderTextWithTaskMentions(protocol.agenda)}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Decisions */}
          {protocol.decisions && (
            <Card>
              <CardHeader>
                <CardTitle>החלטות</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {renderTextWithTaskMentions(protocol.decisions)}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Items */}
          {protocol.action_items && (
            <Card>
              <CardHeader>
                <CardTitle>משימות לביצוע</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {renderTextWithTaskMentions(protocol.action_items)}
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Content Message */}
          {!protocol.agenda && !protocol.decisions && !protocol.action_items && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>אין תוכן זמין לפרוטוקול זה</p>
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
              <EditProtocolButton protocolId={protocol.id} />
              <ShareProtocolButton protocol={protocol} />
              <DeleteProtocolButton
                protocolId={protocol.id}
                protocolTitle={protocol.title}
              />
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
                        {translateCategory(category)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Attendees */}
              {protocol.attendees && protocol.attendees.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">משתתפים:</p>
                  <div className="space-y-1">
                    {protocol.attendees.map((attendee: string, index: number) => (
                      <p key={index} className="text-sm">• {attendee}</p>
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