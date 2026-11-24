import type { Highlight } from '@/types'

export type HighlightType = Highlight['type']

// `icon` is the emoji stored on the highlight (content shown on the public carousel).
export const highlightTypes: readonly { value: HighlightType; icon: string }[] = [
  { value: 'achievement', icon: '🏆' },
  { value: 'sports', icon: '⚽' },
  { value: 'award', icon: '🎖️' },
  { value: 'event', icon: '🎉' },
  { value: 'announcement', icon: '📢' },
]

export type EmojiGroupKey =
  | 'achievements'
  | 'ballSports'
  | 'waterSports'
  | 'otherSports'
  | 'events'
  | 'announcements'
  | 'education'
  | 'other'

// `key` points at `admin.highlights.emojis.<key>` which holds the full "emoji + name" label.
export const emojiGroups: readonly {
  group: EmojiGroupKey
  items: readonly { key: string; value: string }[]
}[] = [
  {
    group: 'achievements',
    items: [
      { key: 'trophy', value: '🏆' },
      { key: 'goldMedal', value: '🥇' },
      { key: 'silverMedal', value: '🥈' },
      { key: 'bronzeMedal', value: '🥉' },
      { key: 'medal', value: '🎖️' },
      { key: 'star', value: '⭐' },
      { key: 'sparkle', value: '✨' },
      { key: 'glowingStar', value: '🌟' },
    ],
  },
  {
    group: 'ballSports',
    items: [
      { key: 'soccer', value: '⚽' },
      { key: 'basketball', value: '🏀' },
      { key: 'volleyball', value: '🏐' },
      { key: 'tennis', value: '🎾' },
      { key: 'football', value: '🏈' },
      { key: 'baseball', value: '⚾' },
      { key: 'softball', value: '🥎' },
      { key: 'tableTennis', value: '🏓' },
      { key: 'badminton', value: '🏸' },
    ],
  },
  {
    group: 'waterSports',
    items: [
      { key: 'surfing', value: '🏄' },
      { key: 'swimming', value: '🏊' },
      { key: 'waterPolo', value: '🤽' },
      { key: 'rowing', value: '🚣' },
    ],
  },
  {
    group: 'otherSports',
    items: [
      { key: 'skiing', value: '🎿' },
      { key: 'snowboard', value: '🏂' },
      { key: 'gymnastics', value: '🤸' },
      { key: 'handball', value: '🤾' },
      { key: 'judo', value: '🥋' },
      { key: 'boxing', value: '🥊' },
      { key: 'archery', value: '🎯' },
    ],
  },
  {
    group: 'events',
    items: [
      { key: 'party', value: '🎉' },
      { key: 'confetti', value: '🎊' },
      { key: 'balloon', value: '🎈' },
      { key: 'cake', value: '🎂' },
      { key: 'gift', value: '🎁' },
    ],
  },
  {
    group: 'announcements',
    items: [
      { key: 'megaphone', value: '📢' },
      { key: 'announcementIcon', value: '📣' },
      { key: 'bell', value: '🔔' },
    ],
  },
  {
    group: 'education',
    items: [
      { key: 'graduation', value: '🎓' },
      { key: 'books', value: '📚' },
      { key: 'pencil', value: '✏️' },
      { key: 'palette', value: '🎨' },
      { key: 'theater', value: '🎭' },
      { key: 'film', value: '🎬' },
      { key: 'music', value: '🎵' },
      { key: 'guitar', value: '🎸' },
    ],
  },
  {
    group: 'other',
    items: [
      { key: 'fire', value: '🔥' },
      { key: 'strength', value: '💪' },
      { key: 'applause', value: '👏' },
      { key: 'raisedHands', value: '🙌' },
      { key: 'heart', value: '❤️' },
      { key: 'blueHeart', value: '💙' },
    ],
  },
]

// `value` is the Tailwind class string stored on the highlight; `key` points at `colors.<key>`.
export const badgeColorOptions: readonly { key: string; value: string }[] = [
  { key: 'gold', value: 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900' },
  { key: 'green', value: 'bg-gradient-to-r from-green-400 to-green-500 text-green-900' },
  { key: 'purple', value: 'bg-gradient-to-r from-purple-400 to-purple-500 text-purple-900' },
  { key: 'orange', value: 'bg-gradient-to-r from-orange-400 to-orange-500 text-orange-900' },
  { key: 'pink', value: 'bg-gradient-to-r from-pink-400 to-pink-500 text-pink-900' },
  { key: 'blue', value: 'bg-gradient-to-r from-blue-400 to-blue-500 text-blue-900' },
  { key: 'red', value: 'bg-gradient-to-r from-red-400 to-red-500 text-red-900' },
]

export type RequiredField = 'icon' | 'title_he' | 'description_he' | 'category_he'

export function validateHighlight(
  highlight: Highlight
): { isValid: true } | { isValid: false; missingField: RequiredField } {
  if (!highlight.icon || highlight.icon.trim().length === 0) {
    return { isValid: false, missingField: 'icon' }
  }
  if (!highlight.title_he || highlight.title_he.trim().length < 2) {
    return { isValid: false, missingField: 'title_he' }
  }
  if (!highlight.description_he || highlight.description_he.trim().length < 10) {
    return { isValid: false, missingField: 'description_he' }
  }
  if (!highlight.category_he || highlight.category_he.trim().length < 2) {
    return { isValid: false, missingField: 'category_he' }
  }
  return { isValid: true }
}
