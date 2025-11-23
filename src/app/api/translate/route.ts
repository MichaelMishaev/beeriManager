import { NextRequest, NextResponse } from 'next/server'
import { batchTranslateHebrewToRussian } from '@/lib/openai/translate'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { texts } = body as { texts: { key: string; value: string }[] }

    if (!texts || !Array.isArray(texts)) {
      return NextResponse.json(
        { success: false, error: 'Invalid request: texts array required' },
        { status: 400 }
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    const translations = await batchTranslateHebrewToRussian(texts)

    return NextResponse.json({
      success: true,
      data: translations
    })
  } catch (error) {
    console.error('Translation API error:', error)
    return NextResponse.json(
      { success: false, error: 'Translation failed' },
      { status: 500 }
    )
  }
}
