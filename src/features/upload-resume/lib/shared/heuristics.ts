import {
  DATE_RE,
  CURRENT_MARKER_RE,
  EMAIL_RE,
  EXPERIENCE_KEYWORD_RE,
  PHONE_RE,
  SKILL_TOKEN_RE,
  URL_RE,
  KNOWN_CITIES_RE,
} from './regexes'
import { SECTION_ALIASES, type SectionKey } from './section-aliases'
import {
  cleanLine,
  normalizeComparableText,
  normalizeHeading,
  stripExperienceDurationSuffix,
} from './text-utils'

export function isSectionHeading(line: string): boolean {
  if (line.includes(':') && line.length > 24) return false
  if (line.length > 40) return false
  return line.split(/\s+/).length <= 4
}

export function detectSection(line: string): SectionKey | null {
  const trimmed = normalizeHeading(line)
  if (!trimmed || !isSectionHeading(trimmed)) return null

  for (const [key, aliases] of Object.entries(SECTION_ALIASES) as Array<[SectionKey, readonly string[]]>) {
    if (aliases.includes(trimmed)) return key
  }
  return null
}

export function detectProbableFullName(lines: string[]): string {
  for (const line of lines.slice(0, 20)) {
    if (
      !EMAIL_RE.test(line) &&
      !PHONE_RE.test(line) &&
      !URL_RE.test(line) &&
      !detectSection(line) &&
      line.length > 2 &&
      line.length < 80
    ) {
      return line
    }
  }

  return ''
}

export function looksLikeEntryHeaderPrelude(line: string): boolean {
  if (!line) return false
  if (DATE_RE.test(line) || CURRENT_MARKER_RE.test(line)) return false
  if (/^[•\-–—]/.test(line)) return false
  if (/^(?:stack|стек)\s*:/i.test(line)) return false
  if (/^роль\s*:/i.test(line)) return false
  if (looksLikeExperienceNoise(line) || looksLikeDurationSummary(line)) return false
  if (/[.!?]$/.test(line)) return false
  if (line.length > 80) return false

  return Boolean(stripExperienceDurationSuffix(line))
}

export function looksLikePersonalMetaLine(line: string): boolean {
  return /(?:^|\s)(?:гражданство|citizenship|дата рождения|birth date|born|удаленн|гибрид|разрешени[ея] на работу|work permit|проживает|проживаю|занятость|специализаци[яи])(?:\s|:|,|$)/i.test(line) ||
    /(?:^|\s)(?:женщина|мужчина|female|male)(?:\s|,|$)/i.test(line) ||
    /\b(?:remote|hybrid|office|onsite|work permit)\b/i.test(line) ||
    /готов[а]?\s+к\s+(?:переезду|командировкам)/i.test(line) ||
    /^(?:график работы|желательное время в пути)/i.test(line)
}

export function looksLikeGenderAgeLine(line: string): boolean {
  return /(?:^|\s)(?:женщина|мужчина|female|male)(?:\s|,|$)/i.test(line) ||
    /\d{1,2}\s*(?:лет|года|год)(?:\s|,|$)/i.test(line) ||
    /\b\d{1,2}\s*(?:years?|yrs?)\b/i.test(line)
}

export function looksLikeTopPersonalMeta(line: string, index: number): boolean {
  if (index > 40) return false
  if (looksLikePersonalMetaLine(line)) return true
  if (looksLikeGenderAgeLine(line)) return true
  if (/\b(?:дата рождения|birth date|born)\b/i.test(line)) return true
  if (/\d{1,2}\s+(?:января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)\s+\d{4}/i.test(line)) return true
  if (/готов[а]?\s+к\s+(?:переезду|командировкам)/i.test(line)) return true
  if (/^(?:проживает|проживаю)[:\s]/i.test(line)) return true
  return false
}

export function looksLikeExperienceNoise(line: string): boolean {
  if (/^\d+\s*(?:год|года|лет|месяц|месяца|месяцев)(?:\s|$)/i.test(line)) return true
  if (/^\d+(?:[.,]\d+)?\s*\+?\s*(?:years?|months?)(?:\s|$)/i.test(line)) return true

  if (
    /^(?:информационные технологии|сми\s*[,;]|маркетинг\s*[,;]|internet|media\s*[,;]|other:|frontend:|реклама\s*[,;]|розничная торговля|финансы\s*[,;]|банки\s*[,;]|страхование\s*[,;]|строительство\s*[,;]|медицина\s*[,;]|образование\s*[,;]|производство\s*[,;]|транспорт\s*[,;]|логистика\s*[,;]|консалтинг\s*[,;])/i.test(line)
  ) return true

  if (
    line.includes(',') &&
    line.split(',').length >= 3 &&
    line.length > 30 &&
    line.length < 200 &&
    !DATE_RE.test(line) &&
    !URL_RE.test(line) &&
    !EXPERIENCE_KEYWORD_RE.test(line) &&
    !SKILL_TOKEN_RE.test(line) &&
    /^[А-ЯЁA-Z]/.test(line) &&
    /^[А-Яа-яЁёA-Za-z\s,]+$/.test(line) &&
    line.split(',').every((part) => part.trim().split(/\s+/).length <= 4)
  ) return true

  if (/^[•\-]\s*(?:разработка|маркетинговые|рекламные|btl|designer|event|pr|internet|software|system integration|интернет-компания|системная интеграция|автоматизаци)/i.test(line)) return true

  return false
}

export function looksLikeDurationSummary(line: string): boolean {
  return (
    /^\d+\s*(?:год|года|лет|месяц|месяца|месяцев)(?:\s|$)/i.test(line) ||
    /^\d+(?:[.,]\d+)?\s*\+?\s*(?:years?|months?)(?:\s|$)/i.test(line)
  )
}

export function looksLikeCompanyUrlLine(line: string, company: string): boolean {
  if (!URL_RE.test(line)) return false

  const label = cleanLine(line.replace(new RegExp(URL_RE.source, 'gi'), ' '))
  if (!label) return false
  if (KNOWN_CITIES_RE.test(label)) return false

  const normalizedLabel = normalizeComparableText(label)
  const normalizedCompany = normalizeComparableText(company)

  if (!normalizedCompany) return label.split(/\s+/).length <= 6

  return (
    normalizedLabel.includes(normalizedCompany) ||
    normalizedCompany.includes(normalizedLabel)
  )
}
