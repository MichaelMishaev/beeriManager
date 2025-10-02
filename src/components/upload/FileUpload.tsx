'use client'

import { useState } from 'react'
import { Upload, X, File, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  value?: string | string[]
  onChange?: (value: string | string[]) => void
  multiple?: boolean
  accept?: string
  maxSize?: number // in MB
  bucket?: string
  disabled?: boolean
  className?: string
}

interface UploadedFile {
  url: string
  name: string
  size: number
  type: string
}

export default function FileUpload({
  value,
  onChange,
  multiple = false,
  accept = '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png',
  maxSize = 10,
  bucket = 'documents',
  disabled = false,
  className
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(() => {
    if (!value) return []
    if (Array.isArray(value)) {
      return value.map(url => ({ url, name: url.split('/').pop() || '', size: 0, type: '' }))
    }
    return value ? [{ url: value, name: value.split('/').pop() || '', size: 0, type: '' }] : []
  })

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const filesToUpload = multiple ? Array.from(files) : [files[0]]

    for (const file of filesToUpload) {
      // Validate file size
      if (file.size > maxSize * 1024 * 1024) {
        toast.error(`הקובץ ${file.name} גדול מדי (מקסימום ${maxSize}MB)`)
        continue
      }

      await uploadFile(file)
    }
  }

  const uploadFile = async (file: File) => {
    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', bucket || 'protocols')

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch('/api/upload/google-drive', {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      const data = await response.json()

      if (data.success) {
        const newFile: UploadedFile = {
          url: data.data.url,
          name: data.data.name,
          size: data.data.size,
          type: data.data.type
        }

        const newFiles = multiple
          ? [...uploadedFiles, newFile]
          : [newFile]

        setUploadedFiles(newFiles)

        // Call onChange with URLs
        if (onChange) {
          const urls = newFiles.map(f => f.url)
          onChange(multiple ? urls : urls[0])
        }

        toast.success(`הקובץ ${file.name} הועלה בהצלחה`)
      } else {
        toast.error(data.error || 'שגיאה בהעלאת הקובץ')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('שגיאה בהעלאת הקובץ')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleRemove = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index)
    setUploadedFiles(newFiles)

    // Call onChange with updated URLs
    if (onChange) {
      const urls = newFiles.map(f => f.url)
      onChange(multiple ? urls : urls[0] || '')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return ''
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Area */}
      <div className={cn(
        'relative border-2 border-dashed rounded-lg p-6 transition-colors',
        'hover:border-primary/50 hover:bg-accent/50',
        disabled && 'opacity-50 pointer-events-none',
        isUploading && 'border-primary bg-accent'
      )}>
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          disabled={disabled || isUploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="text-center">
          {isUploading ? (
            <>
              <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-sm font-medium">מעלה קובץ...</p>
              <Progress value={uploadProgress} className="mt-3 max-w-xs mx-auto" />
            </>
          ) : (
            <>
              <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm font-medium">
                גרור קבצים לכאן או לחץ לבחירה
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {multiple ? 'ניתן להעלות מספר קבצים' : 'קובץ אחד בלבד'}
                {' • '}
                עד {maxSize}MB לקובץ
              </p>
            </>
          )}
        </div>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">קבצים שהועלו:</p>
          {uploadedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 border rounded-lg bg-background"
            >
              <div className="flex items-center gap-3">
                <File className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium truncate max-w-[300px]">
                    {file.name}
                  </p>
                  {file.size > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemove(index)}
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}