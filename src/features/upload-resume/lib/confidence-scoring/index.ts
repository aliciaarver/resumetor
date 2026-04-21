import type { Education, Language, PersonalInfo, Project, ResumeData, Skill, WorkExperience } from '@/entities/resume/model/types'
import type { ParseBlockMetrics, ResumeBlockKey } from '@/entities/resume/model/confidence'
import { buildConfidenceNote, buildPersonalMetrics, toConfidenceLevel, type ParseConfidenceLevel } from '@/entities/resume/model/confidence'
import type { SectionKey } from '@/features/upload-resume/lib/shared/section-aliases'
import { average, clamp01, roundScore } from '@/features/upload-resume/lib/shared/text-utils'
import type { ParseDiff } from '@/utils/parseDiff'

export interface ParseBlockReview {
  key: ResumeBlockKey
  label: string
  score: number
  confidence: ParseConfidenceLevel
  note: string
  rawText: string
  extractedCount: number
  imported: boolean
}

export interface ParseReview {
  rawText: string
  hasWarnings: boolean
  blocks: ParseBlockReview[]
  diff: ParseDiff | null
}

export interface ScoreBlocksInput {
  resume: Partial<ResumeData>
  effectiveBuckets: Record<SectionKey, string[]>
  lines: string[]
  rawText: string
  t: (key: string, params?: Record<string, string | number>) => string
}

const ORDERED_BLOCK_KEYS: ResumeBlockKey[] = [
  'personal',
  'aboutMe',
  'workExperience',
  'education',
  'skills',
  'languages',
  'projects',
]

export function buildParseReview(input: ScoreBlocksInput): ParseReview {
  const { resume, effectiveBuckets, lines, rawText, t } = input
  const blockMetrics = buildParseBlockMetrics(resume, effectiveBuckets, lines)

  const blocks: ParseBlockReview[] = ORDERED_BLOCK_KEYS.map((key) => {
    const metrics = blockMetrics[key]
    const confidence = toConfidenceLevel(metrics)

    return {
      key,
      label: t(`review.${key}`),
      score: metrics.score,
      confidence,
      note: buildConfidenceNote(key, metrics, confidence, t),
      rawText: metrics.rawText,
      extractedCount: metrics.extractedCount,
      imported: confidence === 'high' || confidence === 'medium',
    }
  })

  return {
    rawText,
    hasWarnings: blocks.some((block) => block.confidence === 'low'),
    blocks,
    diff: null,
  }
}

function buildParseBlockMetrics(
  resume: Partial<ResumeData>,
  sectionBuckets: Record<SectionKey, string[]>,
  lines: string[],
): Record<ResumeBlockKey, ParseBlockMetrics> {
  const personal = resume.personal ?? emptyPersonal()
  const aboutText = resume.aboutMe?.trim() ?? ''
  const workEntries = resume.workExperience ?? []
  const educationEntries = resume.education ?? []
  const skills = resume.skills ?? []
  const languages = resume.languages ?? []
  const projects = resume.projects ?? []

  const personalRawText = lines.slice(0, 35).join('\n').trim()

  return {
    personal: buildPersonalMetrics(personal, personalRawText),
    aboutMe: {
      score: roundScore(scoreAboutBlock(aboutText, sectionBuckets.about)),
      rawText: sectionBuckets.about.join('\n').trim(),
      extractedCount: aboutText ? 1 : 0,
    },
    workExperience: {
      score: roundScore(scoreWorkEntries(workEntries, sectionBuckets.experience)),
      rawText: sectionBuckets.experience.join('\n').trim(),
      extractedCount: workEntries.length,
    },
    education: {
      score: roundScore(scoreEducationEntries(educationEntries, sectionBuckets.education)),
      rawText: sectionBuckets.education.join('\n').trim(),
      extractedCount: educationEntries.length,
    },
    skills: {
      score: roundScore(scoreSkills(skills, sectionBuckets.skills)),
      rawText: sectionBuckets.skills.join('\n').trim(),
      extractedCount: skills.length,
    },
    languages: {
      score: roundScore(scoreLanguages(languages, sectionBuckets.languages)),
      rawText: sectionBuckets.languages.join('\n').trim(),
      extractedCount: languages.length,
    },
    projects: {
      score: roundScore(scoreProjects(projects, sectionBuckets.projects)),
      rawText: sectionBuckets.projects.join('\n').trim(),
      extractedCount: projects.length,
    },
  }
}

function emptyPersonal(): PersonalInfo {
  return {
    fullName: '',
    firstName: '',
    lastName: '',
    middleName: '',
    position: '',
    location: '',
    citizenship: '',
    workPermit: '',
    workFormats: [],
    birthDate: '',
    gender: '',
    age: '',
    photo: '',
    phone: '',
    links: [],
  }
}

function scoreAboutBlock(aboutText: string, rawLines: string[]): number {
  if (!rawLines.length && !aboutText) return 0
  if (!aboutText) return 0.2
  if (aboutText.length >= 180) return 0.9
  if (aboutText.length >= 80) return 0.7
  return 0.45
}

function scoreWorkEntries(entries: WorkExperience[], rawLines: string[]): number {
  if (!rawLines.length && !entries.length) return 0
  if (!entries.length) return 0.2

  const completeness = average(entries.map((entry) => {
    let score = 0
    if (entry.company.trim()) score += 0.35
    if (entry.position.trim()) score += 0.25
    if (entry.location.trim()) score += 0.1
    if (entry.fromMonth.trim() || entry.toMonth.trim() || entry.isCurrent) score += 0.25
    if (entry.description.trim()) score += 0.15
    if (entry.skills.length) score += 0.1
    return score
  }))

  return clamp01(0.2 + Math.min(0.35, entries.length * 0.15) + completeness * 0.45)
}

function scoreEducationEntries(entries: Education[], rawLines: string[]): number {
  if (!rawLines.length && !entries.length) return 0
  if (!entries.length) return 0.2

  const completeness = average(entries.map((entry) => {
    let score = 0
    if (entry.institution.trim()) score += 0.4
    if (entry.degree.trim() || entry.field.trim()) score += 0.3
    if (entry.fromMonth.trim() || entry.toMonth.trim() || entry.isCurrent) score += 0.3
    return score
  }))

  return clamp01(0.2 + Math.min(0.3, entries.length * 0.18) + completeness * 0.5)
}

function scoreSkills(entries: Skill[], rawLines: string[]): number {
  if (!rawLines.length && !entries.length) return 0
  if (!entries.length) return 0.2

  const validSkills = entries.filter((entry) => entry.name.trim().length >= 2)
  if (!validSkills.length) return 0.2

  return clamp01(0.25 + Math.min(0.45, validSkills.length * 0.08) + (rawLines.length ? 0.2 : 0))
}

function scoreLanguages(entries: Language[], rawLines: string[]): number {
  if (!rawLines.length && !entries.length) return 0
  if (!entries.length) return 0.2

  const completeness = average(entries.map((entry) => {
    let score = 0
    if (entry.name.trim()) score += 0.6
    if (entry.proficiency.trim()) score += 0.4
    return score
  }))

  return clamp01(0.2 + Math.min(0.3, entries.length * 0.18) + completeness * 0.5)
}

function scoreProjects(entries: Project[], rawLines: string[]): number {
  if (!rawLines.length && !entries.length) return 0
  if (!entries.length) return 0.2

  const completeness = average(entries.map((entry) => {
    let score = 0
    if (entry.title.trim()) score += 0.4
    if (entry.subtitle.trim()) score += 0.15
    if (entry.link.trim()) score += 0.15
    if (entry.description.trim()) score += 0.3
    return score
  }))

  return clamp01(0.2 + Math.min(0.25, entries.length * 0.16) + completeness * 0.55)
}
