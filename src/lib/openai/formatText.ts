import OpenAI from 'openai'

export interface FormattedTextResult {
  html: string
  error?: string
}

/**
 * Format plain text extracted from PDF/DOCX into clean HTML using ChatGPT
 * Detects headers, paragraphs, lists, and preserves structure
 */
export async function formatTextToHTML(plainText: string): Promise<FormattedTextResult> {
  if (!plainText || plainText.trim().length === 0) {
    return { html: '', error: 'No text provided' }
  }

  // Initialize OpenAI client at runtime, not at module level
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  // Limit text length to avoid high costs (max ~4000 words)
  const maxLength = 16000 // ~4000 words
  const truncatedText = plainText.length > maxLength
    ? plainText.substring(0, maxLength) + '...'
    : plainText

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Cheaper and better than GPT-3.5-turbo!
      messages: [
        {
          role: 'system',
          content: `You are a text formatter. Convert plain text from protocols/documents into clean, semantic HTML.

Rules:
1. Detect and mark headers (h2, h3) based on context (ALL CAPS, short lines, etc)
2. Create paragraphs with <p> tags
3. Detect lists and use <ul>/<ol> with <li>
4. Detect tables if present and use <table> tags
5. Use <strong> for emphasized text
6. Keep Hebrew text direction RTL-friendly
7. Output ONLY the HTML, no explanations
8. Use semantic HTML5 tags
9. Add CSS classes: 'protocol-header', 'protocol-section', 'protocol-list'

Example output:
<h2 class="protocol-header">כותרת הפרוטוקול</h2>
<p class="protocol-section">תוכן הפרוטוקול...</p>
<ul class="protocol-list">
  <li>פריט ראשון</li>
</ul>`
        },
        {
          role: 'user',
          content: `Format this protocol text into clean HTML:\n\n${truncatedText}`
        }
      ],
      temperature: 0.3, // Low temperature for consistent formatting
      max_tokens: 2000,
    })

    const html = completion.choices[0]?.message?.content?.trim() || ''

    if (!html) {
      return { html: '', error: 'No HTML generated' }
    }

    return { html }
  } catch (error) {
    console.error('OpenAI formatting error:', error)

    // Fallback: Simple auto-formatting without AI
    const fallbackHtml = autoFormatText(plainText)
    return {
      html: fallbackHtml,
      error: 'OpenAI failed, used fallback formatting'
    }
  }
}

/**
 * Fallback: Simple auto-formatting without AI
 */
function autoFormatText(text: string): string {
  const lines = text.split('\n').filter(line => line.trim())
  let html = ''

  for (const line of lines) {
    const trimmed = line.trim()

    // Detect headers (ALL CAPS or very short lines at start)
    if (trimmed === trimmed.toUpperCase() && trimmed.length < 50) {
      html += `<h2 class="protocol-header">${trimmed}</h2>\n`
    }
    // Detect list items
    else if (/^[-•*]\s/.test(trimmed)) {
      html += `<li>${trimmed.replace(/^[-•*]\s/, '')}</li>\n`
    }
    // Regular paragraph
    else {
      html += `<p class="protocol-section">${trimmed}</p>\n`
    }
  }

  return html
}
