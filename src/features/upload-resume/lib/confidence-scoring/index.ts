import type { PersonalInfo, ResumeData } from '@/entities/resume/model/types'
import type { ParseBlockMetrics, ResumeBlockKey } from '@/entities/resume/model/confidence'
import { buildConfidenceNote, buildPersonalMetrics, toConfidenceLevel, type ParseConfidenceLevel } from '@/entities/resume/model/confidence'
import {
  scoreAboutBlock,
  scoreEducationEntries,
  scoreLanguages,
  scoreProjects,
  scoreSkills,
  scoreWorkEntries,
} from '@/features/upload-resume/lib/shared/block-scoring'
import type { SectionKey } from '@/features/upload-resume/lib/shared/section-aliases'
import { roundScore } from '@/features/upload-resume/lib/shared/text-utils'
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


