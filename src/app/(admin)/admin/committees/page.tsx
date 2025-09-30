import { Suspense } from 'react'
import Link from 'next/link'
import { Users, Plus, Edit, Trash2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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

async function getCommitteeStats() {
  const supabase = createClient()

  const { data, count } = await supabase
    .from('committees')
    .select('*', { count: 'exact' })

  const totalMembers = data?.reduce((sum, c) => sum + (c.members?.length || 0), 0) || 0
  const totalResponsibilities = data?.reduce((sum, c) => sum + (c.responsibilities?.length || 0), 0) || 0

  return {
    total: count || 0,
    totalMembers,
    totalResponsibilities
  }
}

function CommitteesListSkeleton() {
  return (
    <div className="grid gap-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-40 bg-gray-200 rounded-lg animate-pulse" />
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
        <p className="text-muted-foreground mb-6">
          עדיין לא נוספו וועדות למערכת
        </p>
        <Button asChild size="sm">
          <Link href="/admin/committees/new">
            <Plus className="h-4 w-4 ml-2" />
            הוסף וועדה
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    חברי וועדה
                  </span>
                  <Badge variant="secondary">
                    {committee.members?.length || 0}
                  </Badge>
                </div>
                {committee.members && committee.members.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {committee.members.slice(0, 3).map((member, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {member}
                      </Badge>
                    ))}
                    {committee.members.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{committee.members.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Responsibilities */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    תחומי אחריות
                  </span>
                  <Badge variant="secondary">
                    {committee.responsibilities?.length || 0}
                  </Badge>
                </div>
                {committee.responsibilities && committee.responsibilities.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {committee.responsibilities.slice(0, 3).map((resp, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="text-xs"
                        style={{
                          borderColor: committee.color,
                          color: committee.color
                        }}
                      >
                        {resp}
                      </Badge>
                    ))}
                    {committee.responsibilities.length > 3 && (
                      <Badge
                        variant="outline"
                        className="text-xs"
                        style={{
                          borderColor: committee.color,
                          color: committee.color
                        }}
                      >
                        +{committee.responsibilities.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button asChild size="sm" variant="outline" className="flex-1">
                  <Link href={`/admin/committees/${committee.id}/edit`}>
                    <Edit className="h-3 w-3 ml-1" />
                    ערוך
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

async function StatsCards() {
  const stats = await getCommitteeStats()

  return (
    <div className="grid gap-4 md:grid-cols-3 mb-6">
      <Card>
        <CardHeader className="pb-3">
          <CardDescription>סך הכל וועדות</CardDescription>
          <CardTitle className="text-3xl">{stats.total}</CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardDescription>סך חברי וועדה</CardDescription>
          <CardTitle className="text-3xl">{stats.totalMembers}</CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardDescription>סך תחומי אחריות</CardDescription>
          <CardTitle className="text-3xl">{stats.totalResponsibilities}</CardTitle>
        </CardHeader>
      </Card>
    </div>
  )
}

export default function CommitteesPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="h-8 w-8" />
            וועדות
          </h1>
          <p className="text-muted-foreground mt-2">
            ניהול וועדות תחומיות ותחומי אחריות
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/committees/new">
            <Plus className="h-4 w-4 ml-2" />
            וועדה חדשה
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <Suspense fallback={<div className="h-24 bg-gray-100 rounded-lg animate-pulse" />}>
        <StatsCards />
      </Suspense>

      {/* Committees List */}
      <Suspense fallback={<CommitteesListSkeleton />}>
        <CommitteesList />
      </Suspense>
    </div>
  )
}