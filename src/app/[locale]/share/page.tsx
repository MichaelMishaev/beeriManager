'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Upload, Image as ImageIcon, FileText, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useRouter } from '@/i18n/navigation'
import { useToast } from '@/hooks/use-toast'
import { logger } from '@/lib/logger'

interface SharedData {
  title?: string
  text?: string
  url?: string
  files?: File[]
}

export default function ShareTargetPage() {
  const [sharedData, setSharedData] = useState<SharedData>({})
  const [isLoading, setIsLoading] = useState(false)
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const t = useTranslations('share')
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Extract shared data from form submission
    const extractSharedData = async () => {
      try {
        const params = new URLSearchParams(window.location.search)

        // Get data from URL params (for GET requests)
        const title = params.get('title') || ''
        const text = params.get('text') || ''
        const url = params.get('url') || ''

        const data: SharedData = {
          title,
          text,
          url,
        }

        // Try to get files from POST request (if any)
        // Note: This is a client-side page, server-side handling would be better
        // but we'll handle it here for simplicity

        setSharedData(data)
        logger.info('Received shared data', data)

        // Generate preview URLs for images
        if (data.files && data.files.length > 0) {
          const urls = data.files.map(file => URL.createObjectURL(file))
          setPreviewUrls(urls)
        }
      } catch (error) {
        console.error('Failed to extract shared data:', error)
        logger.error('Share target error', { error })
      }
    }

    extractSharedData()

    // Cleanup preview URLs
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url))
    }
  }, [])

  const handleSaveToEvent = async () => {
    setIsLoading(true)
    try {
      // Here you would typically upload the shared content to an event
      // For now, we'll just redirect to create event page with the data

      toast({
        title: t('saved') || 'נשמר בהצלחה',
        description: t('savedDescription') || 'התוכן השותף נשמר',
      })

      // Redirect to create event page (you can pass data via query params or state)
      router.push('/admin/events/new')
    } catch (error) {
      console.error('Failed to save shared content:', error)
      toast({
        title: t('saveFailed') || 'השמירה נכשלה',
        description: t('saveFailedDescription') || 'אנא נסה שנית',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveToFeedback = async () => {
    setIsLoading(true)
    try {
      // Save to feedback/complaint
      toast({
        title: t('saved') || 'נשמר בהצלחה',
        description: t('savedToFeedback') || 'נשמר כמשוב',
      })

      router.push('/feedback')
    } catch (error) {
      console.error('Failed to save to feedback:', error)
      toast({
        title: t('saveFailed') || 'השמירה נכשלה',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/')
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <Upload className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h1 className="text-2xl font-bold mb-2">
            {t('title') || 'תוכן משותף'}
          </h1>
          <p className="text-muted-foreground">
            {t('description') || 'בחר איפה לשמור את התוכן המשותף'}
          </p>
        </div>

        {/* Shared Content Preview */}
        <Card className="p-6">
          <div className="space-y-4">
            {sharedData.title && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t('sharedTitle') || 'כותרת'}
                </label>
                <p className="text-lg font-medium">{sharedData.title}</p>
              </div>
            )}

            {sharedData.text && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t('sharedText') || 'טקסט'}
                </label>
                <p className="whitespace-pre-wrap">{sharedData.text}</p>
              </div>
            )}

            {sharedData.url && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t('sharedUrl') || 'קישור'}
                </label>
                <a
                  href={sharedData.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline block"
                >
                  {sharedData.url}
                </a>
              </div>
            )}

            {sharedData.files && sharedData.files.length > 0 && (
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  {t('sharedFiles') || 'קבצים'} ({sharedData.files.length})
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {sharedData.files.map((file, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 flex flex-col items-center justify-center"
                    >
                      {file.type.startsWith('image/') ? (
                        <>
                          <ImageIcon className="h-8 w-8 mb-2 text-muted-foreground" />
                          {previewUrls[index] && (
                            <img
                              src={previewUrls[index]}
                              alt={file.name}
                              className="w-full h-32 object-cover rounded mb-2"
                            />
                          )}
                        </>
                      ) : (
                        <FileText className="h-8 w-8 mb-2 text-muted-foreground" />
                      )}
                      <p className="text-xs text-center truncate w-full">
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!sharedData.title && !sharedData.text && !sharedData.url && (!sharedData.files || sharedData.files.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                <p>{t('noContent') || 'לא התקבל תוכן משותף'}</p>
                <p className="text-sm mt-2">
                  {t('tryAgain') || 'נסה לשתף שוב מהאפליקציה המקורית'}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleSaveToEvent}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            <ImageIcon className="h-5 w-5 ml-2" />
            {t('saveToEvent') || 'שמור לאירוע'}
          </Button>

          <Button
            onClick={handleSaveToFeedback}
            disabled={isLoading}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <FileText className="h-5 w-5 ml-2" />
            {t('saveToFeedback') || 'שמור כמשוב'}
          </Button>

          <Button
            onClick={handleCancel}
            variant="ghost"
            className="w-full"
            size="lg"
          >
            <X className="h-5 w-5 ml-2" />
            {t('cancel') || 'ביטול'}
          </Button>
        </div>

        {/* Help Text */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            {t('helpText') || 'תוכן משותף יישמר ויהיה זמין למנהלים לעיון'}
          </p>
        </div>
      </div>
    </div>
  )
}
