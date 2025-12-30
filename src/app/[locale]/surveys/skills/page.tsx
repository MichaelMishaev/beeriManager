import { Metadata } from 'next'
import { SkillSurveyForm } from '@/components/features/surveys/SkillSurveyForm'

export const metadata: Metadata = {
  title: 'מאגר מיומנויות הורים | BeeriManager',
  description: 'שתפו אותנו במיומנויות המקצועיות שלכם',
}

export default function SkillSurveyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <SkillSurveyForm />
    </div>
  )
}
