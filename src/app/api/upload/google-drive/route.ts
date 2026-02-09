import { NextRequest, NextResponse } from 'next/server'
import { drive as googleDrive, auth as googleAuth } from '@googleapis/drive'
import { logger } from '@/lib/logger'
import { extractTextFromFile } from '@/lib/textExtraction'

export async function POST(req: NextRequest) {
  try {
    logger.apiCall('POST', '/api/upload/google-drive', { attempt: true })

    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Get Google Drive credentials from environment
    const credentials = {
      client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }

    if (!credentials.client_email || !credentials.private_key) {
      logger.error('Google Drive credentials not configured', { component: 'GoogleDrive' })
      return NextResponse.json(
        { success: false, error: 'Google Drive not configured' },
        { status: 500 }
      )
    }

    // Initialize Google Drive API
    const auth = new googleAuth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    })

    const drive = googleDrive({ version: 'v3', auth })

    // Get the folder ID from environment (specific folder for protocols)
    const folderId = process.env.GOOGLE_DRIVE_PROTOCOLS_FOLDER_ID

    if (!folderId) {
      logger.error('Google Drive folder ID not configured', { component: 'GoogleDrive' })
      return NextResponse.json(
        { success: false, error: 'Google Drive folder not configured' },
        { status: 500 }
      )
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Extract text from document
    let extractedText = ''
    try {
      const extraction = await extractTextFromFile(buffer, file.type)
      extractedText = extraction.text || ''
      if (extraction.error) {
        logger.warn('Text extraction failed', {
          component: 'TextExtraction',
          error: extraction.error,
          fileType: file.type
        })
      } else if (extractedText) {
        logger.success(`Extracted ${extractedText.length} characters from ${file.name}`, {
          component: 'TextExtraction'
        })
      }
    } catch (error) {
      logger.warn('Text extraction error', { component: 'TextExtraction', error })
    }

    // Upload file to Google Drive
    const response = await drive.files.create({
      requestBody: {
        name: file.name,
        parents: [folderId],
      },
      media: {
        mimeType: file.type,
        body: buffer,
      },
      fields: 'id,name,webViewLink,webContentLink',
    })

    // Make the file publicly accessible (view only)
    await drive.permissions.create({
      fileId: response.data.id!,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    })

    logger.success(`File uploaded to Google Drive: ${response.data.name}`, {
      component: 'GoogleDrive'
    })

    return NextResponse.json({
      success: true,
      data: {
        id: response.data.id,
        name: response.data.name,
        url: response.data.webViewLink,
        downloadUrl: response.data.webContentLink,
        extractedText: extractedText,
        size: buffer.length,
        type: file.type
      },
    })
  } catch (error) {
    logger.error('Error uploading to Google Drive', { component: 'GoogleDrive', error })
    return NextResponse.json(
      { success: false, error: 'Failed to upload file to Google Drive' },
      { status: 500 }
    )
  }
}
