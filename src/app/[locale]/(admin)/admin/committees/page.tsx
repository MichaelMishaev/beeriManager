import { Briefcase, Pencil, Plus, UserCheck, Users } from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import { ShareButton } from '@/components/ui/share-button'
import { formatCommitteeShareData } from '@/lib/utils/share-formatters'
import { ShareAllCommitteesButton } from '@/components/committees/ShareAllCommitteesButton'
import {
  AdminEmptyState,
  AdminGroup,
  AdminPageHeader,
  AdminRow,
} from '@/components/features/admin'
import { Link } from '@/i18n/navigation'

interface Committee {
  id: string
  name: string
  description?: string
  color: string
  members?: string[]
  responsibilities?: string[]
}

async function getCommittees(): Promise<Committee[]> {
  const supabase = createClient()

  const { data: committees, error } = await supabase
    .from('committees')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching committees:', error)
    return []
  }

  return (committees || []) as Committee[]
}

export default async function CommitteesPage({ params }: { params: { locale: string } }) {
  // Admin routes skip the next-intl middleware header, so the locale must be set explicitly
  setRequestLocale(params.locale)
  const t = await getTranslations('admin.org.committees')
  const committees = await getCommittees()

  const totalMembers = committees.reduce((sum, c) => sum + (c.members?.length || 0), 0)
  const totalResponsibilities = committees.reduce(
    (sum, c) => sum + (c.responsibilities?.length || 0),
    0
  )
  const uniqueMembers = new Set(committees.flatMap((c) => c.members || []))
  const uniqueResponsibilities = new Set(committees.flatMap((c) => c.responsibilities || []))

  const newAction = (
    <Link
      href="/admin/committees/new"
      aria-label={t('newCommittee')}
      data-testid="admin-committees-new"
      className="flex h-11 w-11 items-center justify-center rounded-full bg-[#003153] text-white shadow-[0_1px_2px_rgba(0,0,0,0.12)] transition-colors hover:bg-[#003153]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D98BA]"
    >
      <Plus className="h-5 w-5" aria-hidden="true" />
    </Link>
  )

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        backHref="/admin/more"
        action={newAction}
      />

      {committees.length === 0 ? (
        <AdminEmptyState
          icon={Users}
          title={t('emptyTitle')}
          description={t('emptyDescription')}
          action={
            <Button asChild size="sm">
              <Link href="/admin/committees/new">
                <Plus className="h-4 w-4 me-2" aria-hidden="true" />
                {t('addCommittee')}
              </Link>
            </Button>
          }
        />
      ) : (
        <>
          <AdminGroup title={t('overviewTitle')}>
            <AdminRow
              leading={
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-[10px] bg-[#87CEEB]/30 text-[#003153]">
                  <Users className="h-[18px] w-[18px]" aria-hidden="true" />
                </span>
              }
              title={t('totalCommittees')}
              subtitle={committees.map((c) => c.name).join(' · ')}
              trailing={
                <span className="text-lg font-bold text-[#003153]">{committees.length}</span>
              }
            />
            <AdminRow
              leading={
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-[10px] bg-[#FFBA00]/25 text-[#003153]">
                  <UserCheck className="h-[18px] w-[18px]" aria-hidden="true" />
                </span>
              }
              title={t('totalMembers')}
              subtitle={t('uniqueMembers', { count: uniqueMembers.size })}
              trailing={<span className="text-lg font-bold text-[#003153]">{totalMembers}</span>}
            />
            <AdminRow
              leading={
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-[10px] bg-[#FF8200]/20 text-[#003153]">
                  <Briefcase className="h-[18px] w-[18px]" aria-hidden="true" />
                </span>
              }
              title={t('totalResponsibilities')}
              subtitle={t('uniqueResponsibilities', { count: uniqueResponsibilities.size })}
              trailing={
                <span className="text-lg font-bold text-[#003153]">{totalResponsibilities}</span>
              }
            />
          </AdminGroup>

          <div className="flex justify-end">
            <ShareAllCommitteesButton committees={committees} />
          </div>

          <AdminGroup>
            {committees.map((committee) => {
              const members = committee.members || []
              const responsibilities = committee.responsibilities || []

              return (
                <article
                  key={committee.id}
                  className="space-y-3 p-3"
                  data-testid="admin-committee-card"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="mt-1 h-3.5 w-3.5 flex-none rounded-full"
                      style={{ backgroundColor: committee.color }}
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-[15px] font-bold text-[#003153]">
                        {committee.name}
                      </h2>
                      {committee.description && (
                        <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">
                          {committee.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1 rounded-xl bg-[#f7f8f9] p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-600">{t('membersLabel')}</span>
                      <span className="font-bold" style={{ color: committee.color }}>
                        {members.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-600">{t('responsibilitiesLabel')}</span>
                      <span className="font-bold" style={{ color: committee.color }}>
                        {responsibilities.length}
                      </span>
                    </div>
                  </div>

                  {members.length > 0 && (
                    <div>
                      <div className="mb-1.5 text-xs font-medium text-gray-500">{t('members')}</div>
                      <div className="flex flex-wrap gap-1">
                        {members.slice(0, 3).map((member, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {member}
                          </Badge>
                        ))}
                        {members.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            {t('more', { count: members.length - 3 })}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {responsibilities.length > 0 && (
                    <div>
                      <div className="mb-1.5 text-xs font-medium text-gray-500">
                        {t('responsibilities')}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {responsibilities.slice(0, 3).map((resp, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-xs"
                            style={{ borderColor: committee.color, color: committee.color }}
                          >
                            {resp}
                          </Badge>
                        ))}
                        {responsibilities.length > 3 && (
                          <Badge
                            variant="outline"
                            className="text-xs"
                            style={{ borderColor: committee.color, color: committee.color }}
                          >
                            {t('more', { count: responsibilities.length - 3 })}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    <ShareButton
                      shareData={formatCommitteeShareData(committee)}
                      variant="outline"
                      size="sm"
                    />
                    <Button asChild size="sm" variant="outline" className="min-h-[44px] flex-1">
                      <Link href={`/admin/committees/${committee.id}/edit`}>
                        <Pencil className="h-3.5 w-3.5 me-1.5" aria-hidden="true" />
                        {t('edit')}
                      </Link>
                    </Button>
                  </div>
                </article>
              )
            })}
          </AdminGroup>
        </>
      )}
    </div>
  )
}
