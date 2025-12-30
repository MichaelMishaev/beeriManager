// Skills Sorting Utilities
// Provides Hebrew alphabetical sorting for skill categories

import { SKILL_CATEGORIES, SKILL_NAMES_HE, type SkillCategory } from '@/types/parent-skills'

/**
 * Get skill categories sorted alphabetically by Hebrew names (א-ת)
 * Uses JavaScript's localeCompare with Hebrew locale for proper ordering
 * @returns Array of skill categories in Hebrew alphabetical order
 */
export function getSortedSkillCategories(): readonly SkillCategory[] {
  return [...SKILL_CATEGORIES].sort((a, b) => {
    const nameA = SKILL_NAMES_HE[a]
    const nameB = SKILL_NAMES_HE[b]
    return nameA.localeCompare(nameB, 'he')
  })
}

/**
 * Get sorted skills with their Hebrew names for dropdown/select components
 * Useful for admin filters and other UI components
 * @returns Array of objects with value (skill key) and label (Hebrew name)
 */
export function getSortedSkillsWithNames(): Array<{ value: SkillCategory; label: string }> {
  return getSortedSkillCategories().map((skill) => ({
    value: skill,
    label: SKILL_NAMES_HE[skill],
  }))
}
