// Re-export types and data from the bilingual content file
export type { RegulationSection, AppendixSection } from '@/lib/regulations/content-data'
export { regulationsHe, regulationsRu, getRegulationsByLocale, regulationsStatus } from '@/lib/regulations/content-data'

// For backward compatibility, export the Hebrew version as default
import { regulationsHe, regulationsStatus } from '@/lib/regulations/content-data'

export const regulationsContent = {
  ...regulationsHe,
  status: regulationsStatus,
}
