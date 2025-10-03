import { NextRequest, NextResponse } from 'next/server'
import { extractTextFromFile } from '@/lib/textExtraction'
import { formatTextToHTML } from '@/lib/openai/formatText'
import { logger } from '@/lib/logger'

export async function POST(req: NextRequest) {
  try {
    logger.apiCall('POST', '/api/upload/local', { attempt: true })

    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Extract text from document
    let extractedText = ''
    let formattedHTML = ''

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

        // Format text to HTML using ChatGPT
        logger.info('Formatting text with ChatGPT...', { component: 'OpenAI' })
        const formatted = await formatTextToHTML(extractedText)
        formattedHTML = formatted.html

        if (formatted.error) {
          logger.warn('ChatGPT formatting warning', {
            component: 'OpenAI',
            error: formatted.error
          })
        } else {
          logger.success(`Formatted to ${formattedHTML.length} chars of HTML`, {
            component: 'OpenAI'
          })
        }
      }
    } catch (error) {
      logger.warn('Text extraction error', { component: 'TextExtraction', error })
    }

    // No need to save file - we have the formatted HTML!
    // Just return the formatted content
    logger.success(`File processed and discarded: ${file.name}`, {
      component: 'LocalStorage'
    })

    return NextResponse.json({
      success: true,
      data: {
        name: file.name,
        extractedText: extractedText,
        formattedHTML: formattedHTML,
        size: buffer.length,
        type: file.type
      },
    })
  } catch (error) {
    logger.error('Error saving file locally', { component: 'LocalStorage', error })
    return NextResponse.json(
      { success: false, error: 'Failed to save file' },
      { status: 500 }
    )
  }
}
