import { Suspense } from 'react'
import Link from 'next/link'
import { Users, Plus, Edit, Trash2, UserCheck, Briefcase } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import { WhatsAppShareButton } from '@/components/committees/WhatsAppShareButton'

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

  // Get unique members and responsibilities for drill-down
  const allMembers = data?.flatMap(c => c.members || []) || []
  const uniqueMembers = [...new Set(allMembers)]

  const allResponsibilities = data?.flatMap(c => c.responsibilities || []) || []
  const uniqueResponsibilities = [...new Set(allResponsibilities)]

  return {
    total: count || 0,
    totalMembers,
    totalResponsibilities,
    uniqueMembers,
    uniqueResponsibilities,
    committees: data || []
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
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: committee.color }}
                  />
                  <CardTitle className="text-xl">
                    {committee.name}
                  </CardTitle>
                </div>
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
              {/* Summary Info */}
              <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">חברי וועדה:</span>
                  <span className="font-bold" style={{ color: committee.color }}>
                    {committee.members?.length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">תחומי אחריות:</span>
                  <span className="font-bold" style={{ color: committee.color }}>
                    {committee.responsibilities?.length || 0}
                  </span>
                </div>
              </div>

              {/* Members Preview */}
              {committee.members && committee.members.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-2">
                    חברי וועדה
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {committee.members.slice(0, 3).map((member: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {member}
                      </Badge>
                    ))}
                    {committee.members.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{committee.members.length - 3} נוספים
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Responsibilities Preview */}
              {committee.responsibilities && committee.responsibilities.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-2">
                    תחומי אחריות
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {committee.responsibilities.slice(0, 3).map((resp: string, idx: number) => (
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
                        +{committee.responsibilities.length - 3} נוספים
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <WhatsAppShareButton committee={committee} />
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
    <Card className="hover:shadow-md transition-shadow mb-6">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <CardTitle>סקירה כללית</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-3">
          {/* Total Committees */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <CardDescription>סך הכל וועדות</CardDescription>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-4xl font-bold">{stats.total}</div>
            <div className="space-y-2">
              {stats.committees.slice(0, 3).map((committee: any) => (
                <div key={committee.id} className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: committee.color }}
                  />
                  <span className="text-sm text-muted-foreground truncate">
                    {committee.name}
                  </span>
                </div>
              ))}
              {stats.committees.length > 3 && (
                <p className="text-xs text-muted-foreground">
                  +{stats.committees.length - 3} נוספות
                </p>
              )}
            </div>
          </div>

          {/* Total Members */}
          <div className="space-y-3 border-r border-l border-border px-6">
            <div className="flex items-center justify-between">
              <CardDescription>סך חברי וועדה</CardDescription>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-4xl font-bold">{stats.totalMembers}</div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {stats.uniqueMembers.length} חברים ייחודיים
              </p>
              <div className="flex flex-wrap gap-1">
                {stats.uniqueMembers.slice(0, 4).map((member: string, idx: number) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {member}
                  </Badge>
                ))}
                {stats.uniqueMembers.length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +{stats.uniqueMembers.length - 4}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Total Responsibilities */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <CardDescription>סך תחומי אחריות</CardDescription>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-4xl font-bold">{stats.totalResponsibilities}</div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {stats.uniqueResponsibilities.length} תחומים ייחודיים
              </p>
              <div className="flex flex-wrap gap-1">
                {stats.uniqueResponsibilities.slice(0, 3).map((resp: string, idx: number) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {resp}
                  </Badge>
                ))}
                {stats.uniqueResponsibilities.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{stats.uniqueResponsibilities.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
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

      {/* Stats Cards */}
      <Suspense fallback={<div className="h-32 bg-gray-100 rounded-lg animate-pulse" />}>
        <StatsCards />
      </Suspense>

      {/* Committees List */}
      <Suspense fallback={<CommitteesListSkeleton />}>
        <CommitteesList />
      </Suspense>
    </div>
  )
}