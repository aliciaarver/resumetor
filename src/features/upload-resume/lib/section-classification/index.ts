import type { ParserFeatureFlags } from '@/utils/parserFeatureFlags'
import {
  ABOUT_KEYWORD_RE,
  COMPANY_RE,
  CURRENT_MARKER_RE,
  DATE_RE,
  EDUCATION_KEYWORD_RE,
  EMAIL_RE,
  EXPERIENCE_ACTION_RE,
  EXPERIENCE_KEYWORD_RE,
  HH_SKIP_SECTIONS_RE,
  PHONE_RE,
  PROFICIENCY_RE,
  PROJECT_KEYWORD_RE,
  SKILL_KEYWORD_RE,
  SKILL_TOKEN_RE,
  URL_RE,
} from '@/features/upload-resume/lib/shared/regexes'
import { LANGUAGE_NAME_RE } from '@/features/upload-resume/lib/shared/language-maps'
import type { SectionKey } from '@/features/upload-resume/lib/shared/section-aliases'
import {
  detectSection,
  looksLikeDurationSummary,
  looksLikeEntryHeaderPrelude,
  looksLikePersonalMetaLine,
  looksLikeTopPersonalMeta,
} from '@/features/upload-resume/lib/shared/heuristics'
import { normalizeHeading } from '@/features/upload-resume/lib/shared/text-utils'
import type { NormalizedDocument } from '@/features/upload-resume/lib/normalization'
import type { ParserProfileDetectionResult } from '@/features/upload-resume/lib/profile-detection'

export type { SectionKey }

export interface SectionScores {
  about: number
  experience: number
  education: number
  skills: number
  languages: number
  projects: number
}

export interface AnalyzedLine {
  text: string
  index: number
  normalized: string
  explicitSection: SectionKey | null
  scores: SectionScores
  bestSection: SectionKey | null
  bestScore: number
  isContactLike: boolean
  hasDate: boolean
  hasLanguage: boolean
  hasProficiency: boolean
  hasSkillKeyword: boolean
  hasProjectKeyword: boolean
  isBullet: boolean
  isSentenceLike: boolean
}

export interface ClassifiedDocument {
  sectionBuckets: Record<SectionKey, string[]>
  explicitSectionBuckets: Record<SectionKey, string[]>
  inferredPosition: string
}

export function classifyDocument(
  doc: NormalizedDocument,
  _profile: ParserProfileDetectionResult,
  featureFlags: ParserFeatureFlags,
): ClassifiedDocument {
  const { lines } = doc
  const sectionBuckets: Record<SectionKey, string[]> = {
    about: [],
    experience: [],
    education: [],
    skills: [],
    languages: [],
    projects: [],
  }
  const explicitSectionBuckets = collectExplicitSectionBuckets(lines)
  const analyzedLines = lines.map((line, index) => analyzeLine(line, index, lines.length))

  let currentSection: SectionKey | null = null
  let inExplicitSection = false
  let structuredSectionSeen = false
  let inHhSkipSection = false
  let inferredPosition = ''

  for (let index = 0; index < analyzedLines.length; index++) {
    const line = analyzedLines[index]
    const previousLine = analyzedLines[index - 1]
    const nextLine = analyzedLines[index + 1]

    if (HH_SKIP_SECTIONS_RE.test(line.text.trim())) {
      inHhSkipSection = true
      currentSection = null
      inExplicitSection = false
      continue
    }

    if (line.explicitSection) {
      inHhSkipSection = false
      currentSection = line.explicitSection
      inExplicitSection = true
      structuredSectionSeen = line.explicitSection !== 'about'
      continue
    }

    if (inHhSkipSection) {
      const trimmed = line.text.trim()
      if (
        !inferredPosition &&
        trimmed.length > 2 &&
        trimmed.length <= 100 &&
        !looksLikePersonalMetaLine(trimmed) &&
        !looksLikeDurationSummary(trimmed) &&
        !HH_SKIP_SECTIONS_RE.test(trimmed) &&
        !/^(?:специализации|занятость|график работы|желательное время|опыт вождения)/i.test(trimmed) &&
        !/^[—\-•]/.test(trimmed)
      ) {
        inferredPosition = trimmed
      }
      continue
    }

    if (line.isContactLike && line.index < 12) {
      continue
    }

    if (looksLikeTopPersonalMeta(line.text, line.index)) {
      continue
    }

    if (inExplicitSection && currentSection) {
      sectionBuckets[currentSection].push(line.text)
      if (currentSection !== 'about') {
        structuredSectionSeen = true
      }
      continue
    }

    const startsExperienceEntryWithFollowingDate =
      !line.explicitSection &&
      !line.hasDate &&
      !line.isBullet &&
      !line.isContactLike &&
      Boolean(nextLine?.hasDate) &&
      line.text.length <= 120

    const likelyInsideExperienceFlow =
      currentSection === 'experience' ||
      previousLine?.bestSection === 'experience' ||
      previousLine?.bestSection === 'skills' ||
      /^(?:stack|стек)\s*:/i.test(previousLine?.text ?? '')

    if (likelyInsideExperienceFlow && startsExperienceEntryWithFollowingDate) {
      currentSection = 'experience'
      inExplicitSection = true
      sectionBuckets.experience.push(line.text)
      structuredSectionSeen = true
      continue
    }

    const inferredSection = inferSectionForLine(
      line,
      previousLine,
      nextLine,
      currentSection,
      structuredSectionSeen,
      featureFlags,
    )

    if (
      featureFlags.enableExplicitSectionOverrides &&
      inExplicitSection &&
      currentSection &&
      inferredSection &&
      inferredSection !== currentSection
    ) {
      const shouldKeepExplicitExperience =
        currentSection === 'experience' &&
        inferredSection === 'skills' &&
        !line.explicitSection
      const shouldKeepExplicitAbout =
        currentSection === 'about' &&
        inferredSection === 'experience' &&
        !line.explicitSection

      if (shouldKeepExplicitExperience || shouldKeepExplicitAbout) {
        // stay inside the explicit block
      } else {
        const currentScore = line.scores[currentSection]
        const inferredScore = line.scores[inferredSection]
        if (inferredScore >= currentScore + 2 && inferredScore >= 5) {
          currentSection = inferredSection
          inExplicitSection = false
        }
      }
    }

    if (!currentSection || !inExplicitSection) {
      if (inferredSection) {
        if (
          currentSection === 'experience' &&
          inferredSection === 'skills' &&
          /^(?:stack|стек)\s*:/i.test(line.text)
        ) {
          currentSection = 'experience'
        } else if (
          currentSection === 'about' &&
          inferredSection === 'experience' &&
          !line.explicitSection
        ) {
          currentSection = 'about'
        } else {
          currentSection = inferredSection
        }
      } else if (featureFlags.enableAboutFallbackInference && !structuredSectionSeen && looksLikeAboutFallback(line)) {
        currentSection = 'about'
      }
    }

    if (!currentSection) {
      continue
    }

    if (!inferredSection && !shouldContinueSection(currentSection, line, previousLine, nextLine, featureFlags)) {
      if (featureFlags.enableAboutFallbackInference && !structuredSectionSeen && looksLikeAboutFallback(line)) {
        sectionBuckets.about.push(line.text)
      }
      continue
    }

    sectionBuckets[currentSection].push(line.text)
    if (currentSection !== 'about') {
      structuredSectionSeen = true
    }
  }

  return { sectionBuckets, explicitSectionBuckets, inferredPosition }
}

export function collectExplicitSectionBuckets(lines: string[]): Record<SectionKey, string[]> {
  const buckets: Record<SectionKey, string[]> = {
    about: [],
    experience: [],
    education: [],
    skills: [],
    languages: [],
    projects: [],
  }

  let current: SectionKey | null = null

  for (const line of lines) {
    if (HH_SKIP_SECTIONS_RE.test(line.trim())) {
      current = null
      continue
    }

    const explicit = detectSection(line)
    if (explicit) {
      current = explicit
      continue
    }

    if (current) {
      buckets[current].push(line)
    }
  }

  return buckets
}

function analyzeLine(line: string, index: number, totalLines: number): AnalyzedLine {
  const normalized = normalizeHeading(line)
  const explicitSection = detectSection(line)
  const lower = line.toLowerCase()
  const languageMatches = [...lower.matchAll(new RegExp(LANGUAGE_NAME_RE.source, 'gi'))]
  const hasLanguage = languageMatches.length > 0
  const hasProficiency = PROFICIENCY_RE.test(line)
  const hasDate = DATE_RE.test(line) || CURRENT_MARKER_RE.test(line)
  const hasExperienceKeyword = EXPERIENCE_KEYWORD_RE.test(line)
  const hasExperienceAction = EXPERIENCE_ACTION_RE.test(line)
  const hasCompanyMarker = COMPANY_RE.test(line)
  const hasEducationKeyword = EDUCATION_KEYWORD_RE.test(line)
  const hasAboutKeyword = ABOUT_KEYWORD_RE.test(line)
  const hasSkillKeyword = SKILL_KEYWORD_RE.test(line) || SKILL_TOKEN_RE.test(line)
  const hasProjectKeyword = PROJECT_KEYWORD_RE.test(line)
  const isContactLike = EMAIL_RE.test(line) || PHONE_RE.test(line) || URL_RE.test(line)
  const isBullet = /^[•·*\-–—]\s+|^\d+[.)]\s+/.test(line)
  const isSentenceLike = line.length > 60 || /[.!?]$/.test(line) || line.split(/\s+/).length > 10

  const scores: SectionScores = {
    about: 0,
    experience: 0,
    education: 0,
    skills: 0,
    languages: 0,
    projects: 0,
  }

  if (explicitSection) {
    scores[explicitSection] += 10
  }

  if (hasAboutKeyword) scores.about += 4
  if (isSentenceLike) scores.about += index < Math.max(8, totalLines * 0.2) ? 2 : 1
  if (!hasDate && !hasLanguage && !isContactLike && index < 6 && line.length <= 120) scores.about += 1

  if (hasDate) scores.experience += 3
  if (hasExperienceKeyword) scores.experience += 4
  if (hasCompanyMarker) scores.experience += 2
  if (hasExperienceAction) scores.experience += 2
  if (isBullet && hasExperienceAction) scores.experience += 2

  if (hasEducationKeyword) scores.education += 5
  if (hasDate) scores.education += 2
  if (/gpa|coursework|faculty|department|факультет|кафедра/i.test(line)) scores.education += 2

  if (hasSkillKeyword) scores.skills += 4
  if (isBullet && hasSkillKeyword) scores.skills += 2
  if (!hasDate && /[,/|•·]/.test(line) && line.length < 140) scores.skills += 1

  if (hasLanguage) scores.languages += Math.min(5, languageMatches.length * 2)
  if (hasProficiency) scores.languages += 3
  if (hasLanguage && /[,/|]/.test(line)) scores.languages += 1

  if (hasProjectKeyword) scores.projects += 4
  if (/(https?:\/\/|www\.|github\.com|linkedin\.com|t\.me|telegram)/i.test(line)) scores.projects += 2
  if (hasDate) scores.projects += 1
  if (isBullet && (hasProjectKeyword || isSentenceLike)) scores.projects += 1

  if (isContactLike) {
    scores.about -= 2
    scores.experience -= 2
    scores.education -= 2
    scores.skills -= 1
    scores.languages -= 1
    scores.projects -= 1
  }
  if (hasLanguage) {
    scores.about -= 2
    scores.experience -= 3
    scores.education -= 2
    scores.skills -= 1
  }
  if (hasEducationKeyword) {
    scores.experience -= 1
    scores.about -= 1
    scores.projects -= 1
  }
  if (hasExperienceKeyword || hasExperienceAction || hasCompanyMarker) {
    scores.education -= 1
    scores.projects -= 1
  }
  if (hasSkillKeyword) {
    scores.about -= 1
    scores.experience -= 1
    scores.education -= 1
  }
  if (hasProjectKeyword) {
    scores.about -= 1
    scores.skills -= 1
  }

  const bestSection = pickBestSection(scores, 3)

  return {
    text: line,
    index,
    normalized,
    explicitSection,
    scores,
    bestSection,
    bestScore: bestSection ? scores[bestSection] : 0,
    isContactLike,
    hasDate,
    hasLanguage,
    hasProficiency,
    hasSkillKeyword,
    hasProjectKeyword,
    isBullet,
    isSentenceLike,
  }
}

function inferSectionForLine(
  line: AnalyzedLine,
  previousLine: AnalyzedLine | undefined,
  nextLine: AnalyzedLine | undefined,
  currentSection: SectionKey | null,
  structuredSectionSeen: boolean,
  featureFlags: ParserFeatureFlags,
): SectionKey | null {
  const contextualScores: SectionScores = { ...line.scores }

  if (featureFlags.enableContextualSectionBoosts) {
    for (const section of Object.keys(contextualScores) as SectionKey[]) {
      if (previousLine?.bestSection === section && previousLine.bestScore >= 4) {
        contextualScores[section] += 1.5
      }
      if (nextLine?.bestSection === section && nextLine.bestScore >= 4) {
        contextualScores[section] += 1
      }
      if (currentSection === section) {
        contextualScores[section] += 1
      }
    }
  }

  if (line.isBullet && currentSection === 'experience') {
    contextualScores.experience += 2
  }
  if (featureFlags.enableAboutFallbackInference && line.isSentenceLike && currentSection === 'about' && !structuredSectionSeen) {
    contextualScores.about += 1.5
  }
  if (line.hasDate && nextLine?.bestSection === 'education') {
    contextualScores.education += 1.5
  }
  if (line.hasDate && nextLine?.bestSection === 'experience') {
    contextualScores.experience += 1.5
  }
  if (line.hasSkillKeyword && currentSection === 'skills') {
    contextualScores.skills += 2
  }
  if (line.hasProjectKeyword && currentSection === 'projects') {
    contextualScores.projects += 2
  }
  if (line.hasLanguage && currentSection === 'languages') {
    contextualScores.languages += 2
  }
  if (!line.hasDate && currentSection === 'education' && previousLine?.bestSection === 'education') {
    contextualScores.education += 1
  }
  if (currentSection === 'projects' && line.isSentenceLike) {
    contextualScores.projects += 1
  }

  return pickBestSection(contextualScores, 3)
}

function pickBestSection(scores: SectionScores, threshold: number): SectionKey | null {
  let bestSection: SectionKey | null = null
  let bestScore = Number.NEGATIVE_INFINITY

  for (const section of Object.keys(scores) as SectionKey[]) {
    const score = scores[section]
    if (score > bestScore) {
      bestScore = score
      bestSection = section
    }
  }

  return bestScore >= threshold ? bestSection : null
}

function looksLikeAboutFallback(line: AnalyzedLine): boolean {
  if (line.isContactLike || line.hasDate || line.hasLanguage) return false
  return line.isSentenceLike || (line.index < 6 && line.text.length > 30)
}

function shouldContinueSection(
  section: SectionKey,
  line: AnalyzedLine,
  previousLine: AnalyzedLine | undefined,
  nextLine: AnalyzedLine | undefined,
  featureFlags: ParserFeatureFlags,
): boolean {
  if (line.bestSection === section) return true
  if (section === 'about') return line.isSentenceLike && !line.hasDate && !line.hasLanguage
  if (section === 'skills') {
    return line.hasSkillKeyword || (
      featureFlags.enableLooseSkillsContinuation &&
      line.isBullet &&
      line.text.length < 120
    )
  }
  if (section === 'languages') {
    return line.hasLanguage || (
      featureFlags.enableLooseLanguagesContinuation &&
      line.hasProficiency
    )
  }
  if (section === 'projects') {
    return line.hasProjectKeyword || (
      featureFlags.enableLooseProjectsContinuation &&
      (line.isSentenceLike || URL_RE.test(line.text))
    )
  }
  if (section === 'education') {
    return line.hasDate || EDUCATION_KEYWORD_RE.test(line.text) || previousLine?.bestSection === 'education'
  }
  if (section === 'experience') {
    return (
      line.hasDate ||
      line.isBullet ||
      EXPERIENCE_KEYWORD_RE.test(line.text) ||
      previousLine?.bestSection === 'experience' ||
      (
        Boolean(nextLine?.hasDate) &&
        !line.isContactLike &&
        !/^(?:stack|стек)\s*:/i.test(line.text) &&
        line.text.length <= 120
      ) ||
      (looksLikeEntryHeaderPrelude(line.text) && Boolean(nextLine?.hasDate))
    )
  }
  return false
}
