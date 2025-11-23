import OpenAI from 'openai'

export interface TranslationResult {
  text: string
  error?: string
}

/**
 * Translate Hebrew text to Russian using GPT-4o-mini
 */
export async function translateHebrewToRussian(hebrewText: string): Promise<TranslationResult> {
  if (!hebrewText || hebrewText.trim().length === 0) {
    return { text: '', error: 'No text provided' }
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a professional Hebrew to Russian translator.
Translate the given Hebrew text to Russian accurately.
Rules:
1. Keep the same tone and style
2. Preserve any formatting, emojis, or special characters
3. Output ONLY the translated text, nothing else
4. If text contains names or proper nouns, transliterate them appropriately`
        },
        {
          role: 'user',
          content: hebrewText
        }
      ],
      temperature: 0.3,
      max_tokens: 4000,
    })

    const text = completion.choices[0]?.message?.content?.trim() || ''

    if (!text) {
      return { text: '', error: 'No translation generated' }
    }

    return { text }
  } catch (error) {
    console.error('OpenAI translation error:', error)
    return { text: '', error: 'Translation failed' }
  }
}

/**
 * Translate multiple Hebrew texts to Russian (one by one for accuracy)
 */
export async function batchTranslateHebrewToRussian(
  texts: { key: string; value: string }[]
): Promise<Record<string, string>> {
  if (!texts || texts.length === 0) {
    return {}
  }

  // Filter out empty texts
  const validTexts = texts.filter(t => t.value && t.value.trim().length > 0)

  if (validTexts.length === 0) {
    return {}
  }

  const result: Record<string, string> = {}

  // Translate each text individually for better accuracy with long texts
  for (const item of validTexts) {
    const translation = await translateHebrewToRussian(item.value)
    if (translation.text) {
      result[item.key] = translation.text
    }
  }

  return result
}
