'use client'

import { useState, Fragment } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Phone, Mail, MessageCircle, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import type { ParentSkillResponse } from '@/types/parent-skills'
import { SKILL_NAMES_HE } from '@/types/parent-skills'
import { useToast } from '@/hooks/use-toast'

interface Props {
  responses: ParentSkillResponse[]
  isLoading: boolean
  onResponseDeleted?: () => void
}

export function SkillsResponsesTable({ responses, isLoading, onResponseDeleted }: Props) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [responseToDelete, setResponseToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id)
  }

  const formatPhoneForWhatsApp = (phone: string | null): string => {
    if (!phone) return ''
    // Remove non-digits and add 972 prefix if needed
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.startsWith('0')) {
      return '972' + cleaned.substring(1)
    }
    return cleaned
  }

  const handleDeleteClick = (responseId: string) => {
    setResponseToDelete(responseId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!responseToDelete) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/surveys/skills/${responseToDelete}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'שגיאה במחיקת התשובה')
      }

      toast({
        title: 'התשובה נמחקה בהצלחה',
        variant: 'default',
      })

      // Close dialog and reset state
      setDeleteDialogOpen(false)
      setResponseToDelete(null)

      // Notify parent component to refresh data
      if (onResponseDeleted) {
        onResponseDeleted()
      }
    } catch (error) {
      console.error('Error deleting response:', error)
      toast({
        title: 'שגיאה במחיקת התשובה',
        description: error instanceof Error ? error.message : 'אנא נסה שוב מאוחר יותר',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">טוען...</div>
  }

  if (!responses.length) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">לא נמצאו תשובות</CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">שם</TableHead>
                <TableHead className="text-right">כיתה</TableHead>
                <TableHead className="text-right">מיומנויות</TableHead>
                <TableHead className="text-right">אמצעי קשר</TableHead>
                <TableHead className="text-right">טלפון</TableHead>
                <TableHead className="text-right">פעולות</TableHead>
                <TableHead className="text-right w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {responses.map((response) => (
                <Fragment key={response.id}>
                  <TableRow className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      {response.parent_name || <span className="text-gray-400 italic">אנונימי</span>}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="font-bold text-base">
                        {response.student_grade || '-'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {response.skills.slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {SKILL_NAMES_HE[skill]}
                          </Badge>
                        ))}
                        {response.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{response.skills.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {response.preferred_contact === 'phone' && 'טלפון'}
                      {response.preferred_contact === 'email' && 'אימייל'}
                      {response.preferred_contact === 'whatsapp' && 'WhatsApp'}
                      {response.preferred_contact === 'any' && 'כל אמצעי'}
                    </TableCell>
                    <TableCell className="font-mono text-sm" dir="ltr">
                      {response.phone_number || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {response.phone_number && (
                          <>
                            <Button size="sm" variant="outline" asChild>
                              <a href={`tel:${response.phone_number}`}>
                                <Phone className="h-4 w-4" />
                              </a>
                            </Button>
                            <Button size="sm" variant="outline" className="bg-green-50 hover:bg-green-100" asChild>
                              <a
                                href={`https://wa.me/${formatPhoneForWhatsApp(response.phone_number)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <MessageCircle className="h-4 w-4 text-green-600" />
                              </a>
                            </Button>
                          </>
                        )}
                        {response.email && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={`mailto:${response.email}`}>
                              <Mail className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-red-50 hover:bg-red-100"
                          onClick={() => handleDeleteClick(response.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost" onClick={() => toggleRow(response.id)}>
                        {expandedRow === response.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </TableCell>
                  </TableRow>

                  {/* Expanded Details */}
                  {expandedRow === response.id && (
                    <TableRow>
                      <TableCell colSpan={7} className="bg-gray-50">
                        <div className="p-4 space-y-3">
                          <div>
                            <span className="font-semibold text-sm">כל המיומנויות:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {response.skills.map((skill) => (
                                <Badge key={skill} variant="secondary">
                                  {SKILL_NAMES_HE[skill]}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {response.other_specialty && response.skills.includes('other') && (
                            <div>
                              <span className="font-semibold text-sm">אחר - פרטים:</span>
                              <p className="text-sm text-gray-700 mt-1 bg-yellow-50 p-2 rounded border border-yellow-200">
                                {response.other_specialty}
                              </p>
                            </div>
                          )}

                          {response.email && (
                            <div>
                              <span className="font-semibold text-sm">אימייל:</span>
                              <p className="text-sm" dir="ltr">
                                {response.email}
                              </p>
                            </div>
                          )}

                          {response.additional_notes && (
                            <div>
                              <span className="font-semibold text-sm">הערות נוספות:</span>
                              <p className="text-sm text-gray-700 mt-1">{response.additional_notes}</p>
                            </div>
                          )}

                          <div className="text-xs text-gray-500">
                            נשלח ב-{new Date(response.created_at).toLocaleDateString('he-IL')} בשעה{' '}
                            {new Date(response.created_at).toLocaleTimeString('he-IL', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>

    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>האם למחוק תשובה זו?</AlertDialogTitle>
          <AlertDialogDescription>
            פעולה זו תמחק את התשובה מהמערכת. המחיקה היא מחיקה רכה - הנתונים יישמרו במערכת אך לא יוצגו יותר.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel disabled={isDeleting}>ביטול</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteConfirm} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
            {isDeleting ? 'מוחק...' : 'מחק'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>
  )
}
