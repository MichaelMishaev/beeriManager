// Parent Skill Directory - Zod Validation Schemas

import * as z from 'zod'
import { SKILL_CATEGORIES, CONTACT_PREFERENCES, GRADE_LEVELS } from '@/types/parent-skills'

// Phone validation - Israeli format
// Accepts: 050-1234567, 0501234567, +972501234567, 972501234567
const israeliPhoneRegex = /^(\+972|972|0)?[2-9]\d{7,8}$/

// Submission validation schema
export const skillSurveySchema = z
  .object({
    parent_name: z
      .string()
      .trim()
      .min(2, 'שם חייב להכיל לפחות 2 תווים')
      .optional()
      .or(z.literal('')),

    phone_number: z
      .string()
      .trim()
      .regex(israeliPhoneRegex, 'מספר טלפון לא תקין (נא להזין מספר ישראלי)')
      .optional()
      .or(z.literal('')),

    email: z
      .string()
      .trim()
      .email('כתובת אימייל לא תקינה')
      .optional()
      .or(z.literal('')),

    skills: z
      .array(z.enum([...SKILL_CATEGORIES] as [string, ...string[]], {
        errorMap: () => ({ message: 'מיומנות לא תקינה' }),
      }))
      .min(1, 'יש לבחור לפחות מיומנות אחת')
      .max(10, 'ניתן לבחור עד 10 מיומנויות'),

    student_grade: z.enum([...GRADE_LEVELS] as [string, ...string[]], {
      errorMap: () => ({ message: 'יש לבחור כיתה' }),
    }),

    preferred_contact: z.enum([...CONTACT_PREFERENCES] as [string, ...string[]], {
      errorMap: () => ({ message: 'יש לבחור אמצעי יצירת קשר מועדף' }),
    }),

    additional_notes: z
      .string()
      .trim()
      .max(1000, 'הערות מוגבלות ל-1000 תווים')
      .optional()
      .or(z.literal('')),

    other_specialty: z
      .string()
      .trim()
      .max(200, 'תיאור התמחות מוגבל ל-200 תווים')
      .optional()
      .or(z.literal('')),
  })
  .refine((data) => data.phone_number || data.email, {
    message: 'חייב להזין לפחות אמצעי יצירת קשר אחד (טלפון או אימייל)',
    path: ['phone_number'], // Attach error to phone_number field
  })
  .refine(
    (data) => {
      // If "other" is selected, other_specialty must be filled
      if (data.skills.includes('other' as any)) {
        return data.other_specialty && data.other_specialty.trim().length > 0
      }
      return true
    },
    {
      message: 'יש לפרט את התחום בו תוכלו לעזור',
      path: ['other_specialty'],
    }
  )

export type SkillSurveyFormData = z.infer<typeof skillSurveySchema>

// Admin search/filter validation
export const skillResponseFiltersSchema = z.object({
  skill: z.enum([...SKILL_CATEGORIES] as [string, ...string[]]).optional(),
  contact_preference: z.enum([...CONTACT_PREFERENCES] as [string, ...string[]]).optional(),
  search: z.string().trim().max(100, 'חיפוש מוגבל ל-100 תווים').optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
})

export type SkillResponseFilters = z.infer<typeof skillResponseFiltersSchema>
