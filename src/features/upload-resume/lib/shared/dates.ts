import { CURRENT_MARKER_RE, MONTH_YEAR_RE } from './regexes'

const MONTH_MAP: Record<string, string> = {
  jan: '01', january: '01', feb: '02', february: '02',
  mar: '03', march: '03', apr: '04', april: '04',
  may: '05', jun: '06', june: '06', jul: '07', july: '07',
  aug: '08', august: '08', sep: '09', september: '09',
  oct: '10', october: '10', nov: '11', november: '11',
  dec: '12', december: '12',
  янв: '01', январь: '01', января: '01',
  фев: '02', февраль: '02', февраля: '02',
  мар: '03', март: '03', марта: '03',
  апр: '04', апрель: '04', апреля: '04',
  май: '05', мая: '05',
  июн: '06', июнь: '06', июня: '06',
  июл: '07', июль: '07', июля: '07',
  авг: '08', август: '08', августа: '08',
  сен: '09', сентябрь: '09', сентября: '09',
  окт: '10', октябрь: '10', октября: '10',
  ноя: '11', ноябрь: '11', ноября: '11',
  дек: '12', декабрь: '12', декабря: '12',
}

const BIRTH_MONTH_MAP: Record<string, string> = {
  января: '01', янв: '01',
  февраля: '02', фев: '02',
  марта: '03', мар: '03',
  апреля: '04', апр: '04',
  мая: '05',
  июня: '06', июн: '06',
  июля: '07', июл: '07',
  августа: '08', авг: '08',
  сентября: '09', сен: '09',
  октября: '10', окт: '10',
  ноября: '11', ноя: '11',
  декабря: '12', дек: '12',
}

export function parseMonthYear(str: string): string {
  const iso = str.match(/(\d{4})[.-](\d{2})(?!\d{2})/)
  if (iso) return `${iso[1]}-${iso[2]}`

  const slash = str.match(/(\d{1,2})\/(\d{4})/)
  if (slash) return `${slash[2]}-${slash[1].padStart(2, '0')}`

  const wordy = str.match(/([a-zа-яё.]+)\s+(\d{4})/i)
  if (wordy) {
    const m = MONTH_MAP[wordy[1].toLowerCase().replace('.', '')]
    if (m) return `${wordy[2]}-${m}`
  }

  const yearRange = str.match(/^(\d{4})\s*[-–—]/)
  if (yearRange) return yearRange[1]

  const bareYear = str.match(/^(\d{4})$/)
  if (bareYear) return bareYear[1]

  return ''
}

export function extractDates(text: string): { from: string; to: string; isCurrent: boolean } {
  const current = CURRENT_MARKER_RE.test(text)
  const rawMatches = [...text.matchAll(new RegExp(MONTH_YEAR_RE.source, 'gi'))]
    .map((m) => m[0].trim())
    .filter(Boolean)

  const dates: string[] = []
  for (const match of rawMatches) {
    const rangeMatch = match.match(/^(\d{4})\s*[-–—]\s*(\d{4})$/)
    if (rangeMatch) {
      dates.push(rangeMatch[1], rangeMatch[2])
    } else {
      dates.push(match)
    }
  }

  const from = dates[0] ? parseMonthYear(dates[0]) : ''
  const to = !current && dates[1] ? parseMonthYear(dates[1]) : ''

  return { from, to, isCurrent: current }
}

export function normalizeBirthDate(value: string): string {
  const normalized = value.replace(/\s+/g, ' ').trim()

  const iso = normalized.match(/\b(\d{4})-(\d{2})-(\d{2})\b/)
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`

  const dotted = normalized.match(/\b(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})\b/)
  if (dotted) {
    const year = dotted[3].length === 2 ? `19${dotted[3]}` : dotted[3]
    return `${year}-${dotted[2].padStart(2, '0')}-${dotted[1].padStart(2, '0')}`
  }

  const ruText = normalized.match(/(\d{1,2})\s+([а-яё]+)\s+(\d{4})/i)
  if (ruText) {
    const monthKey = ruText[2].toLowerCase()
    const month = BIRTH_MONTH_MAP[monthKey]
    if (month) return `${ruText[3]}-${month}-${ruText[1].padStart(2, '0')}`
  }

  return normalized
}
