import type { PdfMetadata, ResumeData } from '@/types/resume'

export function createEmptyPdfMeta(): PdfMetadata {
  return {
    title: '',
    subject: '',
    keywords: '',
    author: '',
  }
}

export function buildSuggestedPdfMeta(resume: ResumeData, defaultTitleSuffix: string): PdfMetadata {
  const fullName =
    [resume.personal.lastName, resume.personal.firstName, resume.personal.middleName]
      .map((part) => part.trim())
      .filter(Boolean)
      .join(' ') || resume.personal.fullName.trim()
  const title = fullName ? `${fullName} — ${defaultTitleSuffix}` : ''
  const author = fullName
  const subject = resume.aboutMe.trim()
  const keywords = buildKeywords(resume)

  return {
    title,
    author,
    subject,
    keywords,
  }
}

function buildKeywords(resume: ResumeData): string {
  const candidates = [
    ...resume.workExperience.flatMap((entry) => [entry.position, entry.company]),
    ...resume.education.flatMap((entry) => [entry.degree, entry.field]),
    ...resume.skills.map((entry) => entry.name),
    ...resume.languages.map((entry) => entry.name),
    ...resume.projects.flatMap((entry) => [entry.title, entry.subtitle]),
  ]

  const unique = new Set<string>()

  for (const candidate of candidates) {
    const normalized = candidate.replace(/\s+/g, ' ').trim()
    if (!normalized) continue
    if (normalized.length > 64) continue
    unique.add(normalized)
    if (unique.size >= 10) break
  }

  return Array.from(unique).join(', ')
}
