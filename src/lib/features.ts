/**
 * Feature Flags for i18n Rollout
 *
 * Phase 1: Infrastructure only (i18nEnabled: false)
 * Phase 2: UI translation (i18nEnabled: true, dbI18nEnabled: false)
 * Phase 3: Full bilingual (all flags: true)
 */

export const featureFlags = {
  // Enable i18n routing and UI translations
  i18nEnabled: true,

  // Enable database i18n columns (JSONB)
  dbI18nEnabled: false,

  // Show language switcher in UI
  showLanguageSwitcher: true,

  // Use i18n for date/time formatting
  i18nDateFormatting: true,
} as const

export type FeatureFlags = typeof featureFlags
