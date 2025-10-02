import { Suspense } from 'react'
import { Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'

async function getCommittees() {
  const supabase = createClient()

  const { data: committees, error } = await supabase
    .from('committees')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching committees:', error)
    return []
  }

  return committees || []
}

function CommitteesListSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse" />
      ))}
    </div>
  )
}

async function CommitteesList() {
  const committees = await getCommittees()

  if (committees.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">אין וועדות</h3>
        <p className="text-muted-foreground">
          עדיין לא נוספו וועדות למערכת
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {committees.map((committee) => (
        <Card
          key={committee.id}
          className="hover:shadow-lg transition-shadow relative overflow-hidden"
        >
          {/* Color indicator bar */}
          <div
            className="absolute top-0 left-0 right-0 h-2"
            style={{ backgroundColor: committee.color }}
          />

          <CardHeader className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-xl flex items-center gap-2">
                  {committee.name}
                </CardTitle>
                {committee.description && (
                  <CardDescription className="mt-2 line-clamp-2">
                    {committee.description}
                  </CardDescription>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              {/* Members */}
              {committee.members && committee.members.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      חברי וועדה
                    </span>
                    <Badge variant="secondary">
                      {committee.members.length}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {committee.members.map((member: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="text-sm">
                        {member}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Responsibilities */}
              {committee.responsibilities && committee.responsibilities.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      תחומי אחריות
                    </span>
                    <Badge variant="secondary">
                      {committee.responsibilities.length}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {committee.responsibilities.map((resp: string, idx: number) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="text-sm"
                        style={{
                          borderColor: committee.color,
                          color: committee.color
                        }}
                      >
                        {resp}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function PublicCommitteesPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3 mb-3">
          <Users className="h-10 w-10" />
          וועדות הורים
        </h1>
        <p className="text-muted-foreground text-lg">
          כל הוועדות התחומיות ותחומי האחריות שלהן
        </p>
      </div>

      {/* Committees List */}
      <Suspense fallback={<CommitteesListSkeleton />}>
        <CommitteesList />
      </Suspense>
    </div>
  )
}