import type { Language } from '@/entities/resume/model/types'

export const HUMAN_LANGUAGE_NAMES = new Set([
  'английский', 'english',
  'русский', 'russian',
  'немецкий', 'german', 'deutsch',
  'французский', 'french',
  'испанский', 'spanish',
  'итальянский', 'italian',
  'португальский', 'portuguese',
  'китайский', 'chinese', 'mandarin', 'cantonese',
  'японский', 'japanese',
  'корейский', 'korean',
  'арабский', 'arabic',
  'турецкий', 'turkish',
  'польский', 'polish',
  'украинский', 'ukrainian',
  'белорусский', 'belarusian',
  'чешский', 'czech',
  'словацкий', 'slovak',
  'румынский', 'romanian',
  'венгерский', 'hungarian',
  'болгарский', 'bulgarian',
  'сербский', 'serbian',
  'хорватский', 'croatian',
  'нидерландский', 'dutch',
  'голландский',
  'шведский', 'swedish',
  'норвежский', 'norwegian',
  'датский', 'danish',
  'финский', 'finnish',
  'греческий', 'greek',
  'иврит', 'hebrew',
  'хинди', 'hindi',
  'тайский', 'thai',
  'вьетнамский', 'vietnamese',
  'индонезийский', 'indonesian',
  'казахский', 'kazakh',
  'узбекский', 'uzbek',
])

export const LANGUAGE_NAME_RE = new RegExp(`(${[...HUMAN_LANGUAGE_NAMES].join('|')})`, 'gi')

export const CEFR_LEVEL_MAP: Record<string, Language['proficiency']> = {
  c2: 'Fluent',
  c1: 'Advanced',
  b2: 'Intermediate',
  b1: 'Intermediate',
  a2: 'Basic',
  a1: 'Basic',
}

export const WORD_LEVEL_MAP: Record<string, Language['proficiency']> = {
  native: 'Native', родной: 'Native',
  fluent: 'Fluent', свободно: 'Fluent',
  advanced: 'Advanced', продвинутый: 'Advanced',
  intermediate: 'Intermediate', средний: 'Intermediate',
  basic: 'Basic', beginner: 'Basic', базовый: 'Basic',
}

export function matchProficiency(context: string): Language['proficiency'] {
  const cefrMatch = context.match(/\b(c[12]|b[12]|a[12])\b/i)
  if (cefrMatch) return CEFR_LEVEL_MAP[cefrMatch[1].toLowerCase()] ?? 'Intermediate'

  const wordMatch = context.match(/(native|fluent|advanced|intermediate|basic|beginner|родной|свободно|продвинутый|средний|базовый)/i)
  if (wordMatch) return WORD_LEVEL_MAP[wordMatch[1].toLowerCase()] ?? 'Intermediate'

  return 'Intermediate'
}
