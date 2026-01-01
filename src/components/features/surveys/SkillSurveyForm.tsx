'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { skillSurveySchema, type SkillSurveyFormData } from '@/lib/validations/parent-skills'
import { SKILL_NAMES_HE, GRADE_LEVELS } from '@/types/parent-skills'
import { getSortedSkillCategories } from '@/lib/utils/skills-sorting'
import {
  CheckCircle2,
  Loader2,
  Camera,
  Scale,
  Stethoscope,
  Wrench,
  Palette,
  Monitor,
  Paintbrush,
  UtensilsCrossed,
  Scissors,
  Languages,
  Calculator,
  GraduationCap,
  Car,
  PartyPopper,
  Music,
  Video,
  Share2,
  PenTool,
  Leaf,
  MoreHorizontal,
  ArrowRight,
  ArrowLeft,
  Search,
  X,
  Microscope,
  BookOpen,
  Trophy,
  Baby,
  Heart,
  Briefcase,
  Star,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'

// Icon mapping for each skill category
const SKILL_ICONS: Record<string, any> = {
  // Professional Services
  legal: Scale,
  medical: Stethoscope,
  accounting: Calculator,
  it_technology: Monitor,

  // Education & Tutoring
  teaching_tutoring: GraduationCap,
  language_tutoring: Languages,
  science_stem: Microscope,
  library_support: BookOpen,

  // Creative & Media
  photography: Camera,
  graphic_design: Palette,
  video_editing: Video,
  arts: Paintbrush,
  music: Music,
  writing_editing: PenTool,

  // Event & Communication
  event_planning: PartyPopper,
  cooking_catering: UtensilsCrossed,
  social_media: Share2,
  translation: Languages,

  // Practical Skills
  handyman: Wrench,
  sewing_fashion: Scissors,
  driving_transport: Car,
  gardening: Leaf,

  // School Support
  sports_coaching: Trophy,
  childcare: Baby,
  fundraising: Heart,
  office_admin: Briefcase,

  other: MoreHorizontal,
}

// Color palette for skill categories using brand colors
const SKILL_COLORS: Record<string, string> = {
  // Professional Services
  legal: 'from-[#003153] to-[#0D98BA]',
  medical: 'from-[#FF8200] to-[#FFBA00]',
  accounting: 'from-[#003153] to-[#FF8200]',
  it_technology: 'from-[#003153] to-[#87CEEB]',

  // Education & Tutoring
  teaching_tutoring: 'from-[#87CEEB] to-[#003153]',
  language_tutoring: 'from-[#0D98BA] to-[#FFBA00]',
  science_stem: 'from-[#87CEEB] to-[#0D98BA]',
  library_support: 'from-[#FFBA00] to-[#003153]',

  // Creative & Media
  photography: 'from-[#87CEEB] to-[#0D98BA]',
  graphic_design: 'from-[#FFBA00] to-[#FF8200]',
  video_editing: 'from-[#003153] to-[#FFBA00]',
  arts: 'from-[#FF8200] to-[#87CEEB]',
  music: 'from-[#FF8200] to-[#003153]',
  writing_editing: 'from-[#0D98BA] to-[#FF8200]',

  // Event & Communication
  event_planning: 'from-[#FFBA00] to-[#87CEEB]',
  cooking_catering: 'from-[#FFBA00] to-[#0D98BA]',
  social_media: 'from-[#87CEEB] to-[#FF8200]',
  translation: 'from-[#0D98BA] to-[#FFBA00]',

  // Practical Skills
  handyman: 'from-[#0D98BA] to-[#003153]',
  sewing_fashion: 'from-[#87CEEB] to-[#FF8200]',
  driving_transport: 'from-[#0D98BA] to-[#87CEEB]',
  gardening: 'from-[#87CEEB] to-[#0D98BA]',

  // School Support
  sports_coaching: 'from-[#FF8200] to-[#0D98BA]',
  childcare: 'from-[#FFBA00] to-[#87CEEB]',
  fundraising: 'from-[#FF8200] to-[#FFBA00]',
  office_admin: 'from-[#003153] to-[#87CEEB]',

  other: 'from-[#0D98BA] to-[#003153]',
}

type FormStep = 'welcome' | 'skills' | 'grade' | 'details'

export function SkillSurveyForm() {
  const t = useTranslations('skillsSurvey')
  const [currentStep, setCurrentStep] = useState<FormStep>('welcome')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [otherSpecialtyError, setOtherSpecialtyError] = useState<string | null>(null)

  // Ref for auto-scrolling to other_specialty input
  const otherSpecialtyRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    setFocus,
  } = useForm<SkillSurveyFormData>({
    resolver: zodResolver(skillSurveySchema),
    defaultValues: {
      skills: [],
      student_grade: undefined,
      preferred_contact: 'whatsapp', // Default to WhatsApp (most common in Israel)
    },
  })

  const otherSpecialty = watch('other_specialty')
  const selectedGrade = watch('student_grade')

  // Auto-scroll to other_specialty input when "other" is selected
  useEffect(() => {
    if (selectedSkills.includes('other')) {
      // Wait for animation to complete before scrolling and focusing
      setTimeout(() => {
        if (otherSpecialtyRef.current) {
          otherSpecialtyRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          })
        }
        // Focus the input after scrolling
        setTimeout(() => {
          setFocus('other_specialty')
        }, 300)
      }, 400)
    }
    // Clear error when "other" is deselected
    if (!selectedSkills.includes('other')) {
      setOtherSpecialtyError(null)
    }
  }, [selectedSkills, setFocus])

  // Filter skills based on search query
  const sortedSkills = getSortedSkillCategories()
  const filteredSkills = useMemo(() => {
    if (!searchQuery.trim()) return sortedSkills

    const query = searchQuery.trim().toLowerCase()
    return sortedSkills.filter((skill) => {
      const hebrewName = SKILL_NAMES_HE[skill].toLowerCase()
      const englishKey = skill.toLowerCase()
      return hebrewName.includes(query) || englishKey.includes(query)
    })
  }, [searchQuery, sortedSkills])

  const onSubmit = async (data: SkillSurveyFormData) => {
    try {
      const response = await fetch('/api/surveys/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        setIsSubmitted(true)
      } else {
        alert(result.message || 'שגיאה בשמירת התשובות')
      }
    } catch (error) {
      console.error('Submission error:', error)
      alert('שגיאה בשמירת התשובות. אנא נסה שוב')
    }
  }

  const handleSkillToggle = (skill: string) => {
    const newSkills = selectedSkills.includes(skill)
      ? selectedSkills.filter((s) => s !== skill)
      : [...selectedSkills, skill]

    setSelectedSkills(newSkills)
    setValue('skills', newSkills as any, { shouldValidate: true })
  }

  // Validate "other_specialty" before proceeding to next step
  const handleSkillsNext = () => {
    // If "other" is selected, validate that other_specialty is filled
    if (selectedSkills.includes('other')) {
      const otherSpecialtyValue = otherSpecialty?.trim()
      if (!otherSpecialtyValue || otherSpecialtyValue.length === 0) {
        setOtherSpecialtyError('יש לפרט את התחום בו תוכלו לעזור')
        // Scroll to the input to show the error
        if (otherSpecialtyRef.current) {
          otherSpecialtyRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          })
        }
        // Focus the input
        setTimeout(() => {
          setFocus('other_specialty')
        }, 300)
        return
      }
    }
    // Clear error and proceed to grade selection
    setOtherSpecialtyError(null)
    setCurrentStep('grade')
  }

  const steps: FormStep[] = ['welcome', 'skills', 'grade', 'details']
  const currentStepIndex = steps.indexOf(currentStep)
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  // Welcome Screen
  if (currentStep === 'welcome') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#87CEEB]/20 via-[#0D98BA]/10 to-[#003153]/20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-2xl"
        >
          <Card className="relative overflow-hidden border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
            {/* Decorative gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#87CEEB]/10 via-transparent to-[#0D98BA]/10 pointer-events-none" />

            <div className="relative p-8 md:p-12 text-center space-y-6">
              {/* Logo */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="flex justify-center"
              >
                <div className="relative w-32 h-32 md:w-40 md:h-40">
                  <Image
                    src="/logo-square.png"
                    alt="BeeriManager Logo"
                    fill
                    className="object-contain drop-shadow-xl"
                    priority
                  />
                </div>
              </motion.div>

              {/* Title */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="space-y-3"
              >
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#003153] to-[#0D98BA] bg-clip-text text-transparent">
                  מאגר המיומנויות שלנו
                </h1>
                <p className="text-lg text-gray-600 leading-relaxed">
                  כל אחד מאיתנו מביא כישורים ייחודיים ומיוחדים
                </p>
              </motion.div>

              {/* Description */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="bg-gradient-to-r from-[#FFBA00]/10 to-[#FF8200]/10 rounded-2xl p-6 space-y-3"
              >
                <p className="text-gray-700 text-base leading-relaxed">
                  שתפו אותנו במיומנויות המקצועיות שלכם, וביחד נוכל ליצור רשת תמיכה חזקה עבור בית הספר והקהילה שלנו.
                </p>
                <p className="text-sm text-gray-600">
                  📱 הטופס קצר ופשוט • 🔒 המידע מאובטח • ⏱️ לוקח פחות מ-3 דקות
                </p>
              </motion.div>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="pt-4"
              >
                <Button
                  onClick={() => setCurrentStep('skills')}
                  size="lg"
                  className="w-full md:w-auto px-12 py-6 text-lg font-semibold bg-gradient-to-r from-[#0D98BA] to-[#003153] hover:from-[#003153] hover:to-[#0D98BA] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  בואו נתחיל!
                  <ArrowLeft className="mr-2 h-5 w-5" />
                </Button>
              </motion.div>

              {/* Privacy note */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-xs text-gray-500 pt-4"
              >
                🔒 המידע שלכם נשמר באופן מאובטח ומשמש אך ורק לצרכי הועד
              </motion.p>
            </div>
          </Card>
        </motion.div>
      </div>
    )
  }

  // Success Screen
  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-2xl"
        >
          <Card className="relative overflow-hidden border-0 shadow-2xl bg-white">
            {/* Confetti effect background */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-100/50 via-emerald-100/30 to-teal-100/50 pointer-events-none" />

            <div className="relative p-8 md:p-12 text-center space-y-6">
              {/* Success animation */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="flex justify-center"
              >
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-xl">
                  <CheckCircle2 className="w-16 h-16 text-white" strokeWidth={3} />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-4"
              >
                <h2 className="text-3xl md:text-4xl font-bold text-green-700">
                  תודה רבה! 🎉
                </h2>
                <p className="text-xl text-gray-700 leading-relaxed">
                  הפרטים שלכם נקלטו בהצלחה במערכת
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 space-y-3"
              >
                <p className="text-gray-600 text-base">
                  ניצור איתכם קשר במידת הצורך - אתם חלק חשוב מהקהילה שלנו! 💚
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500 pt-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span>כל תרומה, קטנה כגדולה, עושה הבדל</span>
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="pt-6"
              >
                <Button
                  onClick={() => window.location.href = '/he'}
                  size="lg"
                  variant="outline"
                  className="px-8 py-6 text-base font-semibold border-2 border-green-500 text-green-700 hover:bg-green-50"
                >
                  חזרה לדף הבית
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </div>
          </Card>
        </motion.div>
      </div>
    )
  }

  // Main Form Steps
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#87CEEB]/10 via-white to-[#0D98BA]/10 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-sm"
        >
          <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="absolute inset-y-0 right-0 bg-gradient-to-l from-[#0D98BA] to-[#87CEEB] rounded-full"
            />
          </div>
          <div className="flex justify-between items-center mt-2 px-2">
            <span className="text-xs font-medium text-gray-600">
              שלב {currentStepIndex + 1} מתוך {steps.length}
            </span>
            <span className="text-xs font-medium text-[#0D98BA]">
              {Math.round(progress)}%
            </span>
          </div>
        </motion.div>

        {/* Form Content */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm overflow-hidden">
            <div className="p-6 md:p-10">
              <AnimatePresence mode="wait">
                {/* Skills Selection Step */}
                {currentStep === 'skills' && (
                  <motion.div
                    key="skills"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="text-center space-y-3 mb-8">
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                        באילו תחומים תוכלו לעזור?
                      </h2>
                      <p className="text-gray-600">
                        בחרו אחד או יותר מהתחומים (ניתן לבחור מספר אפשרויות)
                      </p>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-6">
                      <div className="relative">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                        <Input
                          type="text"
                          placeholder="חיפוש מיומנות... (לדוגמה: צילום, רפואי, IT)"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pr-10 text-right text-base py-6 border-2 focus:border-[#0D98BA] focus:ring-4 focus:ring-[#0D98BA]/20 transition-all"
                        />
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery('')}
                            type="button"
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            aria-label="נקה חיפוש"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        {filteredSkills.length} מתוך {sortedSkills.length} מיומנויות
                      </p>
                    </div>

                    {/* Skills Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                      {filteredSkills.length > 0 ? (
                        filteredSkills.map((skill) => {
                        const Icon = SKILL_ICONS[skill]
                        const isSelected = selectedSkills.includes(skill)
                        const gradientClass = SKILL_COLORS[skill]

                        return (
                          <motion.button
                            key={skill}
                            type="button"
                            onClick={() => handleSkillToggle(skill)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`
                              relative p-4 md:p-6 rounded-2xl border-2 transition-all duration-300
                              ${
                                isSelected
                                  ? 'border-transparent shadow-lg ring-2 ring-offset-2 ring-[#0D98BA]'
                                  : 'border-gray-200 hover:border-[#87CEEB] shadow-sm hover:shadow-md'
                              }
                              group overflow-hidden
                            `}
                          >
                            {/* Gradient background when selected */}
                            <div
                              className={`
                                absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-0 transition-opacity duration-300
                                ${isSelected ? 'opacity-100' : 'group-hover:opacity-10'}
                              `}
                            />

                            {/* Content */}
                            <div className="relative flex flex-col items-center gap-2 md:gap-3">
                              <div
                                className={`
                                  w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center transition-all duration-300
                                  ${
                                    isSelected
                                      ? 'bg-white/20 text-white'
                                      : 'bg-gradient-to-br ' + gradientClass + ' text-white'
                                  }
                                `}
                              >
                                <Icon className="w-6 h-6 md:w-7 md:h-7" strokeWidth={2} />
                              </div>
                              <span
                                className={`
                                  text-xs md:text-sm font-semibold text-center transition-colors duration-300
                                  ${isSelected ? 'text-white' : 'text-gray-700'}
                                `}
                              >
                                {SKILL_NAMES_HE[skill]}
                              </span>
                            </div>

                            {/* Check indicator */}
                            <AnimatePresence>
                              {isSelected && (
                                <motion.div
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0, opacity: 0 }}
                                  className="absolute top-2 left-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md"
                                >
                                  <CheckCircle2 className="w-5 h-5 text-[#0D98BA]" strokeWidth={3} />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.button>
                        )
                      })
                      ) : (
                        <div className="col-span-2 md:col-span-3 text-center py-12">
                          <div className="text-gray-400 space-y-3">
                            <Search className="h-12 w-12 mx-auto text-gray-300" />
                            <p className="text-lg font-medium text-gray-600">לא נמצאו תוצאות</p>
                            <p className="text-sm text-gray-500">נסו לחפש במילים אחרות</p>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setSearchQuery('')}
                              className="mt-4"
                            >
                              נקה חיפוש
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {errors.skills && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm text-red-500 text-center bg-red-50 p-3 rounded-lg"
                      >
                        {errors.skills.message}
                      </motion.p>
                    )}

                    {/* Other Specialty Input - Shows when "other" is selected */}
                    <AnimatePresence>
                      {selectedSkills.includes('other') && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, marginTop: 0 }}
                          animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                          exit={{ opacity: 0, height: 0, marginTop: 0 }}
                          transition={{ duration: 0.3, ease: 'easeOut' }}
                          className="overflow-hidden"
                        >
                          <div className="bg-gradient-to-r from-[#FFBA00]/10 to-[#FF8200]/10 rounded-2xl p-6 space-y-3 border-2 border-[#FFBA00]/30">
                            <div className="flex items-center gap-2 text-[#FF8200] mb-3">
                              <MoreHorizontal className="w-5 h-5" />
                              <h3 className="font-semibold text-base">באיזה תחום תוכלו לעזור?</h3>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="other_specialty" className="text-sm font-medium text-gray-700">
                                פרטו את התחום או המיומנות שלכם <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id="other_specialty"
                                {...register('other_specialty', {
                                  onChange: () => {
                                    // Clear error when user starts typing
                                    if (otherSpecialtyError) {
                                      setOtherSpecialtyError(null)
                                    }
                                  },
                                })}
                                ref={(element) => {
                                  const { ref } = register('other_specialty')
                                  ref(element)
                                  // @ts-ignore - We need to assign to .current for scrollIntoView
                                  otherSpecialtyRef.current = element
                                }}
                                placeholder="לדוגמה: עורך דין תעבורה, פיזיותרפיסט, מעצב פנים..."
                                className="text-right text-base py-3 border-2 focus:border-[#FF8200] focus:ring-4 focus:ring-[#FF8200]/20 transition-all bg-white"
                              />
                              {(errors.other_specialty || otherSpecialtyError) && (
                                <motion.p
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="text-sm text-red-500 bg-red-50 p-2 rounded"
                                >
                                  {errors.other_specialty?.message || otherSpecialtyError}
                                </motion.p>
                              )}
                              <p className="text-xs text-gray-600">
                                💡 נא לפרט כמה שיותר - זה יעזור לנו להבין איך תוכלו לתרום
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Navigation */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-6">
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={() => setCurrentStep('welcome')}
                        className="w-full sm:flex-1 border-2 order-2 sm:order-1"
                      >
                        <ArrowRight className="ml-2 h-4 md:h-5 w-4 md:w-5" />
                        <span className="text-sm md:text-base">חזרה</span>
                      </Button>
                      <Button
                        type="button"
                        size="lg"
                        onClick={handleSkillsNext}
                        disabled={selectedSkills.length === 0}
                        className="w-full sm:flex-1 bg-gradient-to-r from-[#0D98BA] to-[#003153] hover:from-[#003153] hover:to-[#0D98BA] text-white order-1 sm:order-2"
                      >
                        <span className="text-sm md:text-base">המשך</span>
                        <ArrowLeft className="mr-2 h-4 md:h-5 w-4 md:w-5" />
                      </Button>
                    </div>

                    {selectedSkills.length > 0 && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs md:text-sm text-center text-gray-500"
                      >
                        נבחרו {selectedSkills.length} {selectedSkills.length === 1 ? 'תחום' : 'תחומים'}
                      </motion.p>
                    )}
                  </motion.div>
                )}

                {/* Grade Selection Step */}
                {currentStep === 'grade' && (
                  <motion.div
                    key="grade"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="text-center space-y-3 mb-8">
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                        {t('gradeTitle')}
                      </h2>
                      <p className="text-gray-600">
                        {t('gradeSubtitle')}
                      </p>
                    </div>

                    {/* Grade Selection Grid */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 md:gap-4">
                      {GRADE_LEVELS.map((grade) => {
                        const isSelected = selectedGrade === grade

                        return (
                          <motion.button
                            key={grade}
                            type="button"
                            onClick={() => setValue('student_grade', grade, { shouldValidate: true })}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`
                              relative p-4 md:p-6 rounded-2xl border-2 transition-all duration-300
                              ${
                                isSelected
                                  ? 'border-transparent shadow-lg ring-2 ring-offset-2 ring-[#0D98BA] bg-gradient-to-br from-[#87CEEB] to-[#0D98BA]'
                                  : 'border-gray-200 hover:border-[#87CEEB] shadow-sm hover:shadow-md bg-white'
                              }
                            `}
                          >
                            <div className="relative flex flex-col items-center gap-2">
                              <span className={`
                                text-3xl md:text-4xl font-bold transition-colors duration-300
                                ${isSelected ? 'text-white' : 'text-[#003153]'}
                              `}>
                                {grade}
                              </span>
                              <span className={`
                                text-xs font-medium transition-colors duration-300
                                ${isSelected ? 'text-white/90' : 'text-gray-600'}
                              `}>
                                שכבה
                              </span>
                            </div>

                            {/* Check indicator */}
                            <AnimatePresence>
                              {isSelected && (
                                <motion.div
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0, opacity: 0 }}
                                  className="absolute top-2 left-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md"
                                >
                                  <CheckCircle2 className="w-5 h-5 text-[#0D98BA]" strokeWidth={3} />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.button>
                        )
                      })}
                    </div>

                    {errors.student_grade && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm text-red-500 text-center bg-red-50 p-3 rounded-lg"
                      >
                        {errors.student_grade.message}
                      </motion.p>
                    )}

                    {/* Navigation */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-6">
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={() => setCurrentStep('skills')}
                        className="w-full sm:flex-1 border-2 order-2 sm:order-1"
                      >
                        <ArrowRight className="ml-2 h-4 md:h-5 w-4 md:w-5" />
                        <span className="text-sm md:text-base">חזרה</span>
                      </Button>
                      <Button
                        type="button"
                        size="lg"
                        onClick={() => selectedGrade && setCurrentStep('details')}
                        disabled={!selectedGrade}
                        className="w-full sm:flex-1 bg-gradient-to-r from-[#0D98BA] to-[#003153] hover:from-[#003153] hover:to-[#0D98BA] text-white order-1 sm:order-2"
                      >
                        <span className="text-sm md:text-base">המשך</span>
                        <ArrowLeft className="mr-2 h-4 md:h-5 w-4 md:w-5" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Details Step */}
                {currentStep === 'details' && (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="text-center space-y-2 md:space-y-3 mb-6 md:mb-8">
                      <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">פרטי יצירת קשר</h2>
                      <p className="text-sm md:text-base text-gray-600">השאירו את הפרטים שלכם כדי שנוכל ליצור קשר</p>
                    </div>

                    <div className="space-y-4 md:space-y-5">
                      {/* Phone - Required */}
                      <div className="space-y-2">
                        <Label htmlFor="phone_number" className="text-sm md:text-base font-semibold text-gray-700">
                          מספר טלפון <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="phone_number"
                          {...register('phone_number')}
                          placeholder="050-1234567"
                          dir="ltr"
                          className="text-left text-base md:text-lg py-3 md:py-6 border-2 focus:border-[#0D98BA] focus:ring-4 focus:ring-[#0D98BA]/20 transition-all"
                        />
                        {errors.phone_number && (
                          <p className="text-sm text-red-500 bg-red-50 p-2 rounded">{errors.phone_number.message}</p>
                        )}
                      </div>

                      {/* Name - Optional */}
                      <div className="space-y-2">
                        <Label htmlFor="parent_name" className="text-sm md:text-base font-semibold text-gray-700">
                          שם מלא <span className="text-gray-400 text-xs md:text-sm font-normal">(אופציונלי)</span>
                        </Label>
                        <Input
                          id="parent_name"
                          {...register('parent_name')}
                          placeholder="השאירו ריק לשליחה אנונימית"
                          className="text-right text-base md:text-lg py-3 md:py-6 border-2 focus:border-[#0D98BA] focus:ring-4 focus:ring-[#0D98BA]/20 transition-all"
                        />
                        {errors.parent_name && (
                          <p className="text-sm text-red-500 bg-red-50 p-2 rounded">{errors.parent_name.message}</p>
                        )}
                      </div>

                      {/* Email - Optional */}
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm md:text-base font-semibold text-gray-700">
                          אימייל <span className="text-gray-400 text-xs md:text-sm font-normal">(אופציונלי)</span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          {...register('email')}
                          placeholder="example@email.com"
                          dir="ltr"
                          className="text-left text-base md:text-lg py-3 md:py-6 border-2 focus:border-[#0D98BA] focus:ring-4 focus:ring-[#0D98BA]/20 transition-all"
                        />
                        {errors.email && <p className="text-sm text-red-500 bg-red-50 p-2 rounded">{errors.email.message}</p>}
                      </div>

                      {/* Additional Notes - Optional */}
                      <div className="space-y-2">
                        <Label htmlFor="additional_notes" className="text-sm md:text-base font-semibold text-gray-700">
                          הערות נוספות <span className="text-gray-400 text-xs md:text-sm font-normal">(אופציונלי)</span>
                        </Label>
                        <Textarea
                          id="additional_notes"
                          {...register('additional_notes')}
                          placeholder="למשל: זמינות, פרטים נוספים על המיומנויות, הערות מיוחדות..."
                          rows={4}
                          className="text-right text-sm md:text-base border-2 focus:border-[#0D98BA] focus:ring-4 focus:ring-[#0D98BA]/20 transition-all resize-none"
                        />
                        {errors.additional_notes && (
                          <p className="text-sm text-red-500 bg-red-50 p-2 rounded">{errors.additional_notes.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-6">
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={() => setCurrentStep('grade')}
                        className="w-full sm:flex-1 border-2 order-2 sm:order-1"
                        disabled={isSubmitting}
                      >
                        <ArrowRight className="ml-2 h-4 md:h-5 w-4 md:w-5" />
                        <span className="text-sm md:text-base">חזרה</span>
                      </Button>
                      <Button
                        type="submit"
                        size="lg"
                        disabled={isSubmitting}
                        className="w-full sm:flex-1 bg-gradient-to-r from-[#0D98BA] to-[#003153] hover:from-[#003153] hover:to-[#0D98BA] text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50 order-1 sm:order-2"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="ml-2 h-4 md:h-5 w-4 md:w-5 animate-spin" />
                            <span className="text-sm md:text-base">שולח...</span>
                          </>
                        ) : (
                          <>
                            <span className="text-sm md:text-base">שלח תשובות</span>
                            <CheckCircle2 className="mr-2 h-4 md:h-5 w-4 md:w-5" />
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Privacy reminder */}
                    <p className="text-[10px] md:text-xs text-center text-gray-500 pt-3 md:pt-4">
                      🔒 הפרטים שלכם מאובטחים ולא ישותפו עם גורמים חיצוניים
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Card>
        </form>
      </div>
    </div>
  )
}
