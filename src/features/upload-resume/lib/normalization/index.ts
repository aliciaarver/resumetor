import { HH_RESUME_UPDATED_RE } from '@/features/upload-resume/lib/shared/regexes'
import { escapeRegExp } from '@/features/upload-resume/lib/shared/text-utils'
import { detectProbableFullName } from '@/features/upload-resume/lib/shared/heuristics'
import type { ExtractedPdfDocument } from '@/features/upload-resume/lib/pdf-extraction'
import { joinPageTexts } from '@/features/upload-resume/lib/pdf-extraction'

export interface NormalizedDocument {
  rawText: string
  lines: string[]
}

export function normalizeDocument(pdf: ExtractedPdfDocument): NormalizedDocument {
  const rawText = joinPageTexts(pdf)
  const rawLines = rawText.split('\n').map((l) => l.trim()).filter(Boolean)
  const lines = stripFooterLines(rawLines)

  return { rawText, lines }
}

export function stripFooterLines(lines: string[]): string[] {
  const probableName = detectProbableFullName(lines)
  const namePattern = probableName
    ? new RegExp(`^${escapeRegExp(probableName)}\\s*•\\s*(?:Резюме обновлено|Resume updated)`, 'i')
    : null

  return lines.filter((line) => {
    if (!HH_RESUME_UPDATED_RE.test(line)) return true
    if (namePattern?.test(line)) return false
    return !/^[^•]{2,80}\s*•\s*(?:Резюме обновлено|Resume updated)/i.test(line)
  })
}
