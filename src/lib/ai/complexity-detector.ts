/**
 * Complexity Detector for AI Assistant
 * Determines if a message needs multi-round processing or can be handled in a single round
 */

/**
 * Detects if a message is complex and requires multi-round AI processing
 *
 * @param text - The user's message text
 * @returns true if message is complex and needs understanding confirmation, false otherwise
 *
 * Complex messages typically include:
 * - Long messages (> 100 characters)
 * - Formal greetings ("הורים יקרים", "שלום רב")
 * - Multiple lines (> 3 lines)
 * - Multiple clauses (> 2 commas)
 * - Both date and substantial description
 */
export function isComplexMessage(text: string): boolean {
  if (!text || text.trim().length === 0) {
    return false
  }

  const trimmedText = text.trim()

  // Length check - long messages likely need understanding confirmation
  if (trimmedText.length > 100) {
    return true
  }

  // Formal greetings - indicates forwarded parent message
  const hasGreeting =
    trimmedText.includes('הורים יקרים') ||
    trimmedText.includes('שלום רב') ||
    trimmedText.includes('בברכה') ||
    trimmedText.includes('בכבוד רב')

  if (hasGreeting) {
    return true
  }

  // Multiple lines - indicates structured message
  const lineCount = trimmedText.split('\n').length
  if (lineCount > 3) {
    return true
  }

  // Multiple clauses (commas) - indicates complex information
  const commaCount = (trimmedText.match(/,/g) || []).length
  if (commaCount > 2) {
    return true
  }

  // Contains both date pattern and substantial description
  const hasDatePattern = /\d{1,2}\.\d{1,2}\.\d{2,4}/.test(trimmedText)
  const hasSubstantialDescription = trimmedText.length > 50

  if (hasDatePattern && hasSubstantialDescription) {
    return true
  }

  // Default: simple message
  return false
}

/**
 * Determines if a user response is a confirmation
 * Used in understanding_check phase to detect user approval
 *
 * @param text - The user's response
 * @returns true if user is confirming understanding, false otherwise
 */
export function isConfirmation(text: string): boolean {
  if (!text) return false

  const normalized = text.trim().toLowerCase()

  const confirmations = [
    // Standard Hebrew confirmations
    'כן',           // ken - yes
    'אכן',          // akhen - indeed
    'נכון',         // nakhon - correct
    'בדיוק',        // bediyuk - exactly
    'מצוין',        // metzuyan - excellent
    'בטח',          // betakh - sure
    'בוודאי',       // bevadai - certainly
    'ברור',         // barur - obvious
    'סבבה',         // sababa - OK/cool (slang)
    'יפה',          // yafe - nice/good
    'בסדר',         // beseder - OK/alright
    'בסדר גמור',    // beseder gamur - completely OK
    'וואלה',        // walla - really/agreement (slang)
    'חד משמעית',    // khad mashma'it - definitely
    'ממש',          // mamash - really/indeed
    'כמובן',        // kamuvan - of course
    'יאללה',        // yalla - let's go/OK (slang)
    'קדימה',        // kadima - forward/go ahead
    'מסכים',        // maskim - agree
    'מאה אחוז',     // me'a akhuz - 100%
    'בטוח',         // batuakh - sure
    'אישור',        // ishur - confirmation
    'כמו שצריך',    // kmo shetsarikh - as it should be
    'מדויק',        // meduyak - accurate
    'זה זה',        // ze ze - that's it
    'בול',          // bul - spot on (slang)
    'מושלם',        // mushlam - perfect
    'רגיל',         // ragil - normal/OK (slang context)

    // Single letter shortcuts
    'כ',            // k - short for כן

    // English/Latin
    'ok',
    'okay',
    'yes',
    'yep',
    'yeah',
    'sure',

    // Emojis
    '✓',
    '✔',
    '👍',
    '👌',
    '💯',
  ]

  return confirmations.some(conf => normalized.includes(conf))
}

/**
 * Determines if a user response is a correction/negation
 * Used in understanding_check phase to detect user corrections
 *
 * @param text - The user's response
 * @returns true if user is correcting understanding, false otherwise
 */
export function isCorrection(text: string): boolean {
  if (!text) return false

  const normalized = text.trim().toLowerCase()

  const corrections = [
    // Standard Hebrew negations
    'לא',           // lo - no
    'לא נכון',      // lo nakhon - not correct
    'לא לא',        // lo lo - no no
    'שגוי',         // shaguy - wrong
    'שגויה',        // shaguya - wrong (feminine)
    'טעות',         // ta'ut - mistake/error
    'תקן',          // taken - fix/correct
    'תקני',         // takni - fix it (feminine)
    'תתקן',         // tetaken - fix it
    'לא בדיוק',     // lo bediyuk - not exactly
    'כמעט',         // kim'at - almost/not quite
    'לא ממש',       // lo mamash - not really
    'בכלל לא',      // bikhlal lo - not at all
    'אין מצב',      // ein matsav - no way (slang)
    'בלי סיכוי',    // bli sikuy - no chance
    'לא רוצה',      // lo rotze - don't want
    'לא כך',        // lo kakh - not so
    'זה לא נכון',   // ze lo nakhon - that's not correct
    'שינוי',        // shinuy - change
    'שנה',          // shne - change (imperative)
    'תשנה',         // teshane - change it
    'מוטעה',        // mut'e - mistaken
    'מטעה',         // mat'e - misleading
    'שגוי לחלוטין', // shaguy lekhlutin - completely wrong
    'לא מסכים',     // lo maskim - disagree
    'נו',           // nu - can express disagreement
    'אחרת',         // akheret - different/otherwise
    'לא זה',        // lo ze - not this

    // English/Latin negations
    'no',
    'nope',
    'wrong',
    'incorrect',
    'fix',
    'change',

    // Emojis
    '❌',
    '✖',
    '👎',
    '⛔',
  ]

  return corrections.some(corr => normalized.includes(corr))
}
