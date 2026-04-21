import type { NormalizedDocument } from '@/features/upload-resume/lib/normalization'

export type ParserProfile = 'hh_ru' | 'en_cv' | 'generic'

export interface ParserProfileDetectionResult {
  profile: ParserProfile
}

export function detectParserProfile(doc: NormalizedDocument): ParserProfileDetectionResult {
  const text = doc.lines.join('\n').toLowerCase()

  if (
    /желаемая должность|резюме обновлено|опыт вождения|гражданство|проживает|готова к переезду/i.test(text) ||
    /опыт работы/.test(text)
  ) {
    return { profile: 'hh_ru' }
  }

  if (
    /\babout\b/.test(text) &&
    /\bskills\b/.test(text) &&
    /\bexperience\b/.test(text) &&
    /\beducation\b/.test(text)
  ) {
    return { profile: 'en_cv' }
  }

  return { profile: 'generic' }
}
