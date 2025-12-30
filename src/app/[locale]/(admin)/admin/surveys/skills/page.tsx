import { Metadata } from 'next'
import { SkillsAdminDashboard } from '@/components/features/surveys/admin/SkillsAdminDashboard'

export const metadata: Metadata = {
  title: 'ניהול מאגר מיומנויות | BeeriManager',
  description: 'ניהול תשובות מאגר המיומנויות',
}

export default function AdminSkillsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <SkillsAdminDashboard />
    </div>
  )
}
