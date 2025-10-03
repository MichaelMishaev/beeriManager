'use client'

import { Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface EditProtocolButtonProps {
  protocolId: string
}

export function EditProtocolButton({ protocolId }: EditProtocolButtonProps) {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const response = await fetch('/api/auth/session')
      const data = await response.json()
      setIsAdmin(data.authenticated && data.user?.role === 'admin')
    } catch (error) {
      console.error('Auth check error:', error)
      setIsAdmin(false)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading || !isAdmin) {
    return null
  }

  return (
    <Button
      variant="default"
      size="sm"
      className="w-full"
      onClick={() => router.push(`/he/admin/protocols/${protocolId}`)}
    >
      <Edit className="h-4 w-4 ml-2" />
      ערוך פרוטוקול
    </Button>
  )
}
