import {
  CURRENT_MARKER_RE,
  EXPERIENCE_KEYWORD_RE,
  MONTH_YEAR_RE,
  URL_RE,
} from './regexes'

export function cleanLine(value: string): string {
  return value
    .replace(new RegExp(URL_RE.source, 'gi'), '')
    .replace(/\s+/g, ' ')
    .replace(/^[·•\-–—\s]+|[·•\-–—\s]+$/g, '')
    .trim()
}

export function preserveStructuredLine(value: string): string {
  return value
    .replace(/\s+$/g, '')
    .replace(/\s+[|¦]+$/g, '')
    .trimEnd()
}

export function normalizeHeading(line: string): string {
  return line
    .trim()
    .toLowerCase()
    .replace(/[.:]+$/, '')
    .replace(/\s*[-–—]\s*\d.*$/, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function splitTagList(value: string): string[] {
  return value
    .split(/[,;|•·/]+/g)
    .map((part) => part.trim())
    .filter(Boolean)
}

export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function firstUrl(lines: string[]): string {
  for (const line of lines) {
    const match = line.match(URL_RE)
    if (match) return match[0]
  }
  return ''
}

export function normalizePersonalValue(line: string): string {
  return line.replace(/^[^:]{1,30}:\s*/, '').trim()
}

export function stripExperienceDurationSuffix(line: string): string {
  return line
    .replace(/\s+\d+(?:\s*[.,]\s*\d+)?\s*\+?\s*(?:years?|yrs?|год(?:а)?|лет|месяц(?:а|ев)?)(?:\s+experience)?\s*$/i, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function normalizeCompanyName(line: string): string {
  return line
    .replace(/\b([A-Za-zА-Яа-яЁё])\s+(\d)\b/g, '$1$2')
    .replace(/\b(\d)\s+([A-Za-zА-Яа-яЁё]{1,8})\b/g, '$1$2')
    .replace(/\s+/g, ' ')
    .trim()
}

export function normalizeComparableText(value: string): string {
  return value
    .toLowerCase()
    .replace(new RegExp(URL_RE.source, 'gi'), '')
    .replace(/[^a-zа-яё0-9]+/gi, '')
}

export function extractEmployerFromDateLine(line: string): string {
  return normalizeCompanyName(stripExperienceDurationSuffix(cleanLine(
    line
      .replace(new RegExp(MONTH_YEAR_RE.source, 'gi'), ' ')
      .replace(CURRENT_MARKER_RE, ' ')
      .replace(/^[\s\-–—|,:;]+/, '')
      .replace(/[\s\-–—|,:;]+$/, '')
      .replace(/\s+/g, ' ')
  )))
}

export function extractRoleTitle(line: string): string {
  const roleMatch = line.match(/^роль\s*:\s*(.+?)(?:\s+в\s+команде|\.\s*|$)/i)
  if (!roleMatch?.[1]) return ''
  return cleanLine(roleMatch[1])
}

export function looksLikeJobTitle(line: string): boolean {
  const wordCount = line.split(/\s+/).length
  if (line.length > 70 || wordCount > 8) return false
  if (/[.!?]$/.test(line)) return false
  if (/^\d/.test(line)) return false
  if (/\d\s*(?:год|лет|year|month|месяц)/i.test(line)) return false
  if (/^(?:стек|stack):/i.test(line)) return false
  if (/^[•\-–—]/.test(line)) return false
  return true
}

export function looksLikeRoleTitle(line: string): boolean {
  if (!looksLikeJobTitle(line)) return false

  return (
    EXPERIENCE_KEYWORD_RE.test(line) ||
    /\b(?:senior|middle|junior|lead|staff|principal|intern|ведущий|старший|младший|стаж[её]р)\b/i.test(line) ||
    /\b(?:frontend|front[- ]?end|backend|back[- ]?end|full[- ]?stack|fullstack|mobile|ios|android|web|qa|sdet|devops|ux|ui)\b/i.test(line)
  )
}

export function average(values: number[]): number {
  if (!values.length) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

export function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value))
}

export function roundScore(value: number): number {
  return Math.round(value * 100) / 100
}
