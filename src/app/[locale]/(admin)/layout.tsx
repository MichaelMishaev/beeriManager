import { Shield } from 'lucide-react'
import AIFloatingButton from '@/components/features/ai-assistant/AIFloatingButton'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // No client-side auth check needed - middleware already protects this route
  // If user reaches here, they're authenticated

  return (
    <div className="min-h-screen">
      {/* Admin indicator banner */}
      <div className="bg-primary text-white py-2 px-4 text-center text-sm">
        <div className="container mx-auto flex items-center justify-center gap-2">
          <Shield className="h-4 w-4" />
          <span>מצב ניהול - יש לך הרשאות עריכה מלאות</span>
        </div>
      </div>

      {/* Admin content */}
      <div className="container mx-auto px-4 py-6">
        {children}
      </div>

      {/* AI Assistant Floating Button */}
      <AIFloatingButton />
    </div>
  )
}