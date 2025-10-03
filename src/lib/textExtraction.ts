// These imports only work on server-side (Node.js), not in browser
// Import them dynamically in the functions that use them

export interface ExtractionResult {
  text: string
  pageCount?: number
  error?: string
}

/**
 * Extract text from PDF files
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<ExtractionResult> {
  try {
    const pdf = (await import('pdf-parse-fork')).default
    const data = await pdf(buffer)
    return {
      text: data.text,
      pageCount: data.numpages
    }
  } catch (error) {
    console.error('PDF extraction error:', error)
    return {
      text: '',
      error: 'Failed to extract text from PDF'
    }
  }
}

/**
 * Extract text from DOCX files
 */
export async function extractTextFromDOCX(buffer: Buffer): Promise<ExtractionResult> {
  try {
    const mammoth = await import('mammoth')
    const result = await mammoth.extractRawText({ buffer })
    return {
      text: result.value
    }
  } catch (error) {
    console.error('DOCX extraction error:', error)
    return {
      text: '',
      error: 'Failed to extract text from DOCX'
    }
  }
}

/**
 * Extract text from images using OCR
 */
export async function extractTextFromImage(buffer: Buffer): Promise<ExtractionResult> {
  try {
    const Tesseract = await import('tesseract.js')
    const { data } = await Tesseract.recognize(buffer, 'heb', {
      logger: () => {} // Suppress logs
    })
    return {
      text: data.text
    }
  } catch (error) {
    console.error('OCR extraction error:', error)
    return {
      text: '',
      error: 'Failed to extract text from image'
    }
  }
}

/**
 * Main function to extract text from any supported file type
 */
export async function extractTextFromFile(
  file: File | Buffer,
  mimeType: string
): Promise<ExtractionResult> {
  // Convert File to Buffer if needed
  let buffer: Buffer
  if (Buffer.isBuffer(file)) {
    buffer = file
  } else {
    const arrayBuffer = await file.arrayBuffer()
    buffer = Buffer.from(arrayBuffer)
  }

  // Extract based on mime type
  if (mimeType === 'application/pdf') {
    return extractTextFromPDF(buffer)
  } else if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/msword'
  ) {
    return extractTextFromDOCX(buffer)
  } else if (mimeType.startsWith('image/')) {
    return extractTextFromImage(buffer)
  }

  return {
    text: '',
    error: 'Unsupported file type for text extraction'
  }
}
