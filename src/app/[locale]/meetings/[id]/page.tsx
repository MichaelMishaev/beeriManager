import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { verifyJWT } from '@/lib/auth/jwt'
import { MeetingAgendaPage } from '@/components/features/meetings/MeetingAgendaPage'

interface PageProps {
  params: Promise<{ id: string; locale: string }>
}

export default async function MeetingPage({ params }: PageProps) {
  const { id } = await params

  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    notFound()
  }

  const cookieStore = await cookies()
  const authToken = cookieStore.get('auth-token')
  const isAdmin = authToken ? !!(await verifyJWT(authToken.value)) : false

  return <MeetingAgendaPage meetingId={id} isAdmin={isAdmin} />
}
