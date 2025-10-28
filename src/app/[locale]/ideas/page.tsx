'use client'

import { IdeaSubmissionForm } from '@/components/features/ideas/IdeaSubmissionForm'

export default function IdeasPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">שליחת רעיון</h1>
        <p className="text-muted-foreground">
          יש לכם רעיון מעולה לשיפור או תכונה חדשה? נשמח לשמוע!
        </p>
      </div>

      <IdeaSubmissionForm />
    </div>
  )
}
