'use client'

import type { ReactNode } from 'react'
import { ChevronDown, Languages, Save, Trash2, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { AdminFormSection } from '@/components/features/admin'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { Highlight } from '@/types'
import {
  badgeColorOptions,
  emojiGroups,
  highlightTypes,
  type HighlightType,
} from './options'

/** Local edits. Dates may be cleared with `null` (sent to the API as-is, which clears them). */
export type HighlightPatch = Partial<Omit<Highlight, 'start_date' | 'end_date'>> & {
  start_date?: string | null
  end_date?: string | null
}

interface HighlightEditorProps {
  highlight: Highlight
  canSave: boolean
  isSaving: boolean
  isTranslating: boolean
  onPatch: (patch: HighlightPatch) => void
  onSave: () => void
  onCancel: () => void
  onDelete: () => void
  onTranslate: () => void
}

const controlClass =
  'w-full min-h-[48px] cursor-pointer appearance-none rounded-lg border-2 border-gray-300 bg-white py-3 ps-4 pe-10 text-base text-gray-900 focus:border-[#0D98BA] focus:outline-none focus:ring-2 focus:ring-[#0D98BA]'

function SelectChevron() {
  return (
    <ChevronDown
      className="pointer-events-none absolute end-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
      aria-hidden="true"
    />
  )
}

function Label({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-[#003153]">
      {children}
    </label>
  )
}

export function HighlightEditor({
  highlight,
  canSave,
  isSaving,
  isTranslating,
  onPatch,
  onSave,
  onCancel,
  onDelete,
  onTranslate,
}: HighlightEditorProps) {
  const t = useTranslations('admin.highlights')
  const tc = useTranslations('admin.common')
  const typeInfo = highlightTypes.find((ty) => ty.value === highlight.type)
  const fid = (name: string) => `${highlight.id}-${name}`

  const required = (
    <span className="text-base font-bold text-red-500" title={t('hints.required')}>
      *
    </span>
  )

  return (
    <div data-testid="highlight-card" className="space-y-3 rounded-2xl ring-2 ring-[#0D98BA]">
      {/* Header: status + actions */}
      <section className="rounded-2xl bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="text-sm">{typeInfo ? t(`types.${typeInfo.value}`) : null}</Badge>
            {highlight.is_active && (
              <Badge variant="default" className="bg-green-600">
                {t('status.active')}
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {t('row.order', { order: highlight.display_order })}
            </Badge>
            {!canSave && (
              <Badge variant="destructive" className="animate-pulse text-xs">
                {t('editor.missingFields')}
              </Badge>
            )}
            {canSave && (
              <Badge variant="default" className="bg-green-600 text-xs">
                {t('editor.readyToSave')}
              </Badge>
            )}
          </div>
          <div className="flex shrink-0 gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={onSave}
              disabled={isSaving || !canSave}
              className={`min-h-[44px] ${!canSave ? 'cursor-not-allowed opacity-50' : ''}`}
              title={!canSave ? t('editor.fillAllRequired') : ''}
            >
              <Save className="me-1 h-4 w-4" />
              {isSaving ? tc('saving') : tc('save')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              aria-label={t('editor.cancelAria')}
              className="h-11 w-11 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              aria-label={t('editor.deleteAria')}
              className="h-11 w-11 p-0 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Translate */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={onTranslate}
          disabled={isTranslating}
          className="min-h-[44px] gap-2 bg-white"
        >
          <Languages className="h-4 w-4" />
          {isTranslating ? t('editor.translating') : t('editor.translate')}
        </Button>
      </div>

      {/* Type and icon */}
      <AdminFormSection title={t('sections.type')}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor={fid('type')}>
              {t('fields.type')} {required}
            </Label>
            <div className="relative">
              <select
                id={fid('type')}
                value={highlight.type}
                onChange={(e) => {
                  const type = e.target.value as HighlightType
                  const info = highlightTypes.find((ty) => ty.value === type)
                  // Update both type and icon together to avoid race condition
                  onPatch({ type, icon: info?.icon || highlight.icon })
                }}
                className={controlClass}
              >
                {highlightTypes.map((ty) => (
                  <option key={ty.value} value={ty.value}>
                    {t(`types.${ty.value}`)}
                  </option>
                ))}
              </select>
              <SelectChevron />
            </div>
          </div>

          <div>
            <Label htmlFor={fid('icon')}>
              {t('fields.icon')} {required}
            </Label>
            <div className="flex items-start gap-3">
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg border-2 border-gray-300 bg-gradient-to-br from-blue-50 to-purple-50">
                <span className="text-4xl">{highlight.icon}</span>
              </div>
              <div className="relative flex-1">
                <select
                  id={fid('icon')}
                  data-field="icon"
                  value={highlight.icon}
                  onChange={(e) => onPatch({ icon: e.target.value })}
                  className={controlClass}
                >
                  {emojiGroups.map((g) => (
                    <optgroup key={g.group} label={t(`groups.${g.group}`)}>
                      {g.items.map((item) => (
                        <option key={item.key} value={item.value}>
                          {t(`emojis.${item.key}`)}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <SelectChevron />
              </div>
            </div>
          </div>
        </div>
      </AdminFormSection>

      {/* Content */}
      <AdminFormSection title={t('sections.content')}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor={fid('title_he')}>
              {t('fields.titleHe')} {required}
              <span className="text-xs text-gray-500"> {t('hints.min2')}</span>
            </Label>
            <Input
              id={fid('title_he')}
              data-field="title_he"
              value={highlight.title_he}
              onChange={(e) => onPatch({ title_he: e.target.value })}
              placeholder={t('placeholders.titleHe')}
            />
          </div>
          <div>
            <Label htmlFor={fid('title_ru')}>
              {t('fields.titleRu')}{' '}
              <span className="text-xs text-gray-500">{t('hints.optional')}</span>
            </Label>
            <Input
              id={fid('title_ru')}
              value={highlight.title_ru}
              onChange={(e) => onPatch({ title_ru: e.target.value })}
              placeholder={t('placeholders.titleRu')}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor={fid('description_he')}>
              {t('fields.descriptionHe')} {required}
              <span className="text-xs text-gray-500"> {t('hints.min10')}</span>
            </Label>
            <Textarea
              id={fid('description_he')}
              data-field="description_he"
              value={highlight.description_he}
              onChange={(e) => onPatch({ description_he: e.target.value })}
              placeholder={t('placeholders.descriptionHe')}
              rows={6}
              className="min-h-[140px] resize-y"
            />
          </div>
          <div>
            <Label htmlFor={fid('description_ru')}>
              {t('fields.descriptionRu')}{' '}
              <span className="text-xs text-gray-500">{t('hints.optional')}</span>
            </Label>
            <Textarea
              id={fid('description_ru')}
              value={highlight.description_ru}
              onChange={(e) => onPatch({ description_ru: e.target.value })}
              placeholder={t('placeholders.descriptionRu')}
              rows={6}
              className="min-h-[140px] resize-y"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor={fid('category_he')}>
              {t('fields.categoryHe')} {required}
              <span className="text-xs text-gray-500"> {t('hints.min2')}</span>
            </Label>
            <Input
              id={fid('category_he')}
              data-field="category_he"
              value={highlight.category_he}
              onChange={(e) => onPatch({ category_he: e.target.value })}
              placeholder={t('placeholders.categoryHe')}
            />
          </div>
          <div>
            <Label htmlFor={fid('category_ru')}>
              {t('fields.categoryRu')}{' '}
              <span className="text-xs text-gray-500">{t('hints.optional')}</span>
            </Label>
            <Input
              id={fid('category_ru')}
              value={highlight.category_ru}
              onChange={(e) => onPatch({ category_ru: e.target.value })}
              placeholder={t('placeholders.categoryRu')}
            />
          </div>
        </div>

        <div>
          <Label htmlFor={fid('badge_color')}>{t('fields.badgeColor')}</Label>
          <div className="relative">
            <select
              id={fid('badge_color')}
              value={highlight.badge_color}
              onChange={(e) => onPatch({ badge_color: e.target.value })}
              className={controlClass}
            >
              {badgeColorOptions.map((color) => (
                <option key={color.key} value={color.value}>
                  {t(`colors.${color.key}`)}
                </option>
              ))}
            </select>
            <SelectChevron />
          </div>
          <div className="mt-2">
            <Badge className={highlight.badge_color}>
              {highlight.category_he || t('hints.badgeSample')}
            </Badge>
          </div>
        </div>
      </AdminFormSection>

      {/* Display settings */}
      <AdminFormSection title={t('sections.display')}>
        <div>
          <Label htmlFor={fid('display_order')}>{t('fields.order')}</Label>
          <p className="mb-2 text-xs text-gray-500">{t('hints.order')}</p>
          <Input
            id={fid('display_order')}
            type="number"
            value={highlight.display_order}
            onChange={(e) => onPatch({ display_order: parseInt(e.target.value) || 0 })}
            min={0}
            placeholder={t('placeholders.order')}
            className="text-base"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor={fid('start_date')}>
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-green-600" aria-hidden="true" />
                {t('fields.startDate')}
              </span>
            </Label>
            <p className="mb-2 text-xs text-gray-500">{t('hints.startDate')}</p>
            <Input
              id={fid('start_date')}
              type="date"
              value={highlight.start_date ? highlight.start_date.split('T')[0] : ''}
              onChange={(e) => onPatch({ start_date: e.target.value || null })}
              className="text-base"
            />
          </div>
          <div>
            <Label htmlFor={fid('end_date')}>
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-600" aria-hidden="true" />
                {t('fields.endDate')}
              </span>
            </Label>
            <p className="mb-2 text-xs text-gray-500">{t('hints.endDate')}</p>
            <Input
              id={fid('end_date')}
              type="date"
              value={highlight.end_date ? highlight.end_date.split('T')[0] : ''}
              onChange={(e) => onPatch({ end_date: e.target.value || null })}
              className="text-base"
            />
          </div>
        </div>

        <div className="flex min-h-[44px] items-center gap-3">
          <input
            type="checkbox"
            checked={highlight.is_active}
            onChange={(e) => onPatch({ is_active: e.target.checked })}
            id={`active-${highlight.id}`}
            className="h-5 w-5"
          />
          <label htmlFor={`active-${highlight.id}`} className="text-sm">
            {t('fields.active')}
          </label>
        </div>
      </AdminFormSection>
    </div>
  )
}
