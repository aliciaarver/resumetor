import type { Education, Language, PersonalInfo, Project, ResumeData, Skill, WorkExperience } from '@/entities/resume/model/types'
import {
  CURRENT_MARKER_RE,
  DATE_RE,
  EMAIL_RE,
  EXPERIENCE_KEYWORD_RE,
  HH_RESUME_UPDATED_RE,
  KNOWN_CITIES_RE,
  MONTH_YEAR_RE,
  PHONE_RE,
  PROJECT_KEYWORD_RE,
  URL_RE,
} from '@/features/upload-resume/lib/shared/regexes'
import { HUMAN_LANGUAGE_NAMES, matchProficiency } from '@/features/upload-resume/lib/shared/language-maps'
import { extractDates, normalizeBirthDate } from '@/features/upload-resume/lib/shared/dates'
import type { SectionKey } from '@/features/upload-resume/lib/shared/section-aliases'
import { scoreSkills, scoreWorkEntries } from '@/features/upload-resume/lib/shared/block-scoring'
import {
  cleanLine,
  extractEmployerFromDateLine,
  extractRoleTitle,
  firstUrl,
  looksLikeRoleTitle,
  normalizeCompanyName,
  normalizePersonalValue,
  preserveStructuredLine,
  splitTagList,
  stripExperienceDurationSuffix,
} from '@/features/upload-resume/lib/shared/text-utils'
import {
  detectSection,
  looksLikeCompanyUrlLine,
  looksLikeDurationSummary,
  looksLikeEntryHeaderPrelude,
  looksLikeExperienceNoise,
  looksLikeGenderAgeLine,
  looksLikePersonalMetaLine,
} from '@/features/upload-resume/lib/shared/heuristics'
import type { ClassifiedDocument } from '@/features/upload-resume/lib/section-classification'
import type { ParserProfile, ParserProfileDetectionResult } from '@/features/upload-resume/lib/profile-detection'
import { stripFooterLines } from '@/features/upload-resume/lib/normalization'

export interface EntityExtractionOptions {
  genericLinkLabel: string
  lines: string[]
}

export interface ExtractedResumeDraft {
  resume: Partial<ResumeData>
  effectiveBuckets: Record<SectionKey, string[]>
}

export function extractEntities(
  classified: ClassifiedDocument,
  profileDetection: ParserProfileDetectionResult,
  options: EntityExtractionOptions,
): ExtractedResumeDraft {
  const { profile } = profileDetection
  const { sectionBuckets, explicitSectionBuckets, inferredPosition } = classified

  const personal = parsePersonalInfo(options.lines.slice(0, 35), options.genericLinkLabel)
  if (inferredPosition && !personal.position) {
    personal.position = inferredPosition
  }

  const aboutMe = parseAboutBlock(sectionBuckets.about)

  const inferredWorkExperience = parseExperienceBlock(sectionBuckets.experience, profile)
  const explicitWorkExperience = explicitSectionBuckets.experience.length
    ? parseExperienceBlock(stripFooterLines(explicitSectionBuckets.experience), profile)
    : []
  const inferredWorkScore = scoreWorkEntries(inferredWorkExperience, sectionBuckets.experience)
  const explicitWorkScore = scoreWorkEntries(explicitWorkExperience, explicitSectionBuckets.experience)
  const workExperience = explicitWorkScore > inferredWorkScore ? explicitWorkExperience : inferredWorkExperience

  const education = parseEducationBlock(sectionBuckets.education)

  const inferredSkills = parseSkillsBlock(sectionBuckets.skills, profile)
  const explicitSkills = explicitSectionBuckets.skills.length
    ? parseSkillsBlock(stripFooterLines(explicitSectionBuckets.skills), profile)
    : []
  const inferredSkillsScore = scoreSkills(inferredSkills, sectionBuckets.skills)
  const explicitSkillsScore = scoreSkills(explicitSkills, explicitSectionBuckets.skills)
  const skills = explicitSkillsScore > inferredSkillsScore ? explicitSkills : inferredSkills

  const languages = parseLanguagesBlock(sectionBuckets.languages)
  const projects = parseProjectsBlock(sectionBuckets.projects)

  const effectiveExperienceRaw = explicitWorkScore > inferredWorkScore
    ? stripFooterLines(explicitSectionBuckets.experience)
    : sectionBuckets.experience
  const effectiveSkillsRaw = explicitSkillsScore > inferredSkillsScore
    ? stripFooterLines(explicitSectionBuckets.skills)
    : sectionBuckets.skills

  return {
    resume: {
      personal,
      aboutMe,
      workExperience,
      education,
      skills,
      languages,
      projects,
    },
    effectiveBuckets: {
      ...sectionBuckets,
      experience: effectiveExperienceRaw,
      skills: effectiveSkillsRaw,
    },
  }
}

function parsePersonalInfo(lines: string[], genericLinkLabel: string): PersonalInfo {
  const personal: PersonalInfo = {
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

  const seenLinks = new Set<string>()

  for (const line of lines) {
    const emailMatch = line.match(new RegExp(EMAIL_RE.source, 'i'))
    if (emailMatch) {
      const email = emailMatch[0]
      if (!seenLinks.has(email)) {
        personal.links.push({
          id: crypto.randomUUID(),
          label: 'Email',
          url: email,
        })
        seenLinks.add(email)
      }
    }

    const phoneMatch = line.match(PHONE_RE)
    if (phoneMatch && !personal.phone) {
      personal.phone = phoneMatch[0]
    }

    const urlRe = new RegExp(URL_RE.source, 'gi')
    let urlMatch: RegExpExecArray | null
    while ((urlMatch = urlRe.exec(line)) !== null) {
      const url = urlMatch[0]
      if (seenLinks.has(url)) continue

      const lowerUrl = url.toLowerCase()
      const label = lowerUrl.includes('github') ? 'GitHub'
        : lowerUrl.includes('linkedin') ? 'LinkedIn'
        : lowerUrl.includes('t.me') || lowerUrl.includes('telegram') ? 'Telegram'
        : genericLinkLabel

      personal.links.push({
        id: crypto.randomUUID(),
        label,
        url,
      })
      seenLinks.add(url)
    }
  }

  for (const line of lines) {
    if (
      !EMAIL_RE.test(line) &&
      !PHONE_RE.test(line) &&
      !URL_RE.test(line) &&
      line.length > 2 &&
      line.length < 60 &&
      !detectSection(line)
    ) {
      personal.fullName = line
      break
    }
  }

  applyNameParts(personal)

  const remainingLines = lines.filter((line) =>
    !EMAIL_RE.test(line) &&
    !PHONE_RE.test(line) &&
    !URL_RE.test(line) &&
    !detectSection(line) &&
    !HH_RESUME_UPDATED_RE.test(line)
  )

  const RU_DATE_IN_LINE_RE = /\d{1,2}\s+(?:января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)\s+\d{4}/i
  const birthLine = remainingLines.find((line) =>
    /\b(?:дата рождения|birth date|born)\b/i.test(line) ||
    RU_DATE_IN_LINE_RE.test(line)
  )
  if (birthLine) {
    personal.birthDate = normalizeBirthDate(
      birthLine.replace(/\b(?:дата рождения|birth date|born|родилась|родился)\b[:\s-]*/i, '').trim()
    )
  }

  const genderAgeLine = remainingLines.find((line) => looksLikeGenderAgeLine(line))
  if (genderAgeLine) {
    const genderMatch = genderAgeLine.match(/(?:^|\s)(женщина|мужчина|female|male)(?:\s|,|$)/i)
    const ageMatch = genderAgeLine.match(/(\d{1,2})\s*(лет|года|год|years?|yrs?)(?:\s|,|$)/i)
    personal.gender = genderMatch?.[1]?.trim() ?? ''
    personal.age = ageMatch ? `${ageMatch[1]} ${ageMatch[2]}`.trim() : ''
    if (!personal.birthDate) {
      const trailingBirth = genderAgeLine.match(/(?:родил[а-я]*|born)\s*([0-9]{1,2}[.\-/][0-9]{1,2}[.\-/][0-9]{2,4}|[0-9]{4}-[0-9]{2}-[0-9]{2})/i)
      if (trailingBirth?.[1]) {
        personal.birthDate = normalizeBirthDate(trailingBirth[1])
      }
      if (!personal.birthDate) {
        const ruInGenderLine = genderAgeLine.match(RU_DATE_IN_LINE_RE)
        if (ruInGenderLine) {
          personal.birthDate = normalizeBirthDate(ruInGenderLine[0])
        }
      }
    }
  }

  const livesInLine = remainingLines.find((line) => /^проживает[:\s]/i.test(line))
  if (livesInLine && !personal.location) {
    personal.location = livesInLine.replace(/^проживает[:\s]*/i, '').trim()
  }

  const citizenshipLine = remainingLines.find((line) => /\b(?:гражданство|citizenship)\b/i.test(line))
  if (citizenshipLine) {
    const citizenshipRaw = citizenshipLine.replace(/\b(?:гражданство|citizenship)\b[:\s-]*/i, '')
    const citizenshipValue = citizenshipRaw.split(/,\s*есть разрешение/i)[0].trim()
    personal.citizenship = citizenshipValue

    if (!personal.workPermit && /\bесть разрешение на работу[:\s]*/i.test(citizenshipRaw)) {
      const permitMatch = citizenshipRaw.match(/есть разрешение на работу[:\s]*([^,\n]+)/i)
      if (permitMatch?.[1]) {
        personal.workPermit = permitMatch[1].trim()
      }
    }
  }

  const workPermitLine = remainingLines.find((line) =>
    /\b(?:разрешени[ея] на работу|work permit|имеется разрешение на работу)\b/i.test(line) &&
    line !== citizenshipLine
  )
  if (workPermitLine) {
    personal.workPermit = workPermitLine.replace(/\b(?:разрешени[ея] на работу|work permit|имеется разрешение на работу|есть разрешение на работу)\b[:\s-]*/i, '').trim()
  }

  const workFormatLine = remainingLines.find((line) =>
    /\b(?:формат(?:ы)? работы|занятость|work format|work formats|employment type)\b/i.test(line) ||
    /\b(?:remote|hybrid|office|onsite|full[- ]time|part[- ]time|contract|freelance|удаленн|гибрид|офис|полный день|частичн|проектная работа)\b/i.test(line)
  )
  if (workFormatLine) {
    personal.workFormats = splitTagList(
      workFormatLine.replace(/\b(?:формат(?:ы)? работы|занятость|work format|work formats|employment type)\b[:\s-]*/i, '')
    )
  }

  const photoLine = lines.find((line) => /\b(?:photo|фото)\b/i.test(line) && URL_RE.test(line))
  if (photoLine) {
    const photoMatch = photoLine.match(new RegExp(URL_RE.source, 'i'))
    personal.photo = photoMatch?.[0] ?? ''
  }

  const consumed = new Set<string>([
    personal.fullName,
    genderAgeLine ?? '',
    birthLine ?? '',
    citizenshipLine ?? '',
    workPermitLine ?? '',
    workFormatLine ?? '',
  ])
  const candidateLines = remainingLines.filter((line) => {
    if (consumed.has(line)) return false
    if (DATE_RE.test(line) || CURRENT_MARKER_RE.test(line)) return false
    return line.length > 1
  })

  const locationLine = candidateLines.find((line) =>
    line.length <= 80 &&
    !EXPERIENCE_KEYWORD_RE.test(line) &&
    !looksLikePersonalMetaLine(line)
  )
  if (locationLine) {
    personal.location = normalizePersonalValue(locationLine)
    consumed.add(locationLine)
  }

  const positionLine = candidateLines.find((line) =>
    !consumed.has(line) &&
    line.length <= 100 &&
    !looksLikePersonalMetaLine(line)
  )
  if (positionLine) {
    personal.position = normalizePersonalValue(positionLine)
  }

  return personal
}

function applyNameParts(personal: PersonalInfo) {
  const normalized = personal.fullName.replace(/\s+/g, ' ').trim()
  const parts = normalized.split(' ').filter(Boolean)
  if (parts.length >= 2) {
    personal.lastName = parts[0] ?? ''
    personal.firstName = parts[1] ?? ''
    personal.middleName = parts.slice(2).join(' ')
  }
}

function parseAboutBlock(lines: string[]): string {
  return lines
    .map((line) => preserveStructuredLine(line))
    .filter((line) => line && !detectSection(line))
    .join('\n')
    .trim()
}

function parseExperienceBlock(lines: string[], profile: ParserProfile): WorkExperience[] {
  if (profile === 'en_cv') {
    return parseExperienceBlockEnCv(lines)
  }

  return parseExperienceBlockHh(lines)
}

function splitEntries(lines: string[]): string[][] {
  const entries: string[][] = []
  let current: string[] = []

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index]
    const nextLine = lines[index + 1]
    const hasDate = DATE_RE.test(line) || CURRENT_MARKER_RE.test(line)
    const currentHasDate = current.some((entryLine) => DATE_RE.test(entryLine) || CURRENT_MARKER_RE.test(entryLine))

    const startsCompanyFirstEntry =
      !hasDate &&
      current.length > 0 &&
      currentHasDate &&
      Boolean(nextLine) &&
      (DATE_RE.test(nextLine) || CURRENT_MARKER_RE.test(nextLine)) &&
      looksLikeEntryHeaderPrelude(line)

    if (startsCompanyFirstEntry) {
      entries.push(current)
      current = [line]
      continue
    }

    if (hasDate && current.length && currentHasDate) {
      const isSplitDateRangeContinuation =
        current.length === 1 &&
        (DATE_RE.test(current[0]) || CURRENT_MARKER_RE.test(current[0])) &&
        !looksLikeDurationSummary(line)

      if (isSplitDateRangeContinuation) {
        current.push(line)
        continue
      }

      entries.push(current)
      current = [line]
      continue
    }

    current.push(line)
  }

  if (current.length) {
    entries.push(current)
  }

  return entries.filter((entry) => entry.some((line) => DATE_RE.test(line)))
}

function parseExperienceBlockHh(lines: string[]): WorkExperience[] {
  return splitEntries(lines).map((entryLines) => {
    const dateLineIndex = entryLines.findIndex((line) => DATE_RE.test(line) || CURRENT_MARKER_RE.test(line))
    const dateLine = dateLineIndex >= 0 ? entryLines[dateLineIndex] : entryLines[0]
    const leadingDateLines = entryLines
      .slice(0, 3)
      .filter((line) => DATE_RE.test(line) || CURRENT_MARKER_RE.test(line))
    const { from, to, isCurrent } = extractDates(leadingDateLines.join(' '))
    const companyFromDateLine = extractEmployerFromDateLine(dateLine)

    const nonDateLines = entryLines.filter((_, i) => i !== dateLineIndex)

    const normalizedLines = nonDateLines
      .map((line) => ({
        raw: preserveStructuredLine(line),
        clean: cleanLine(line),
        wasBullet: /^[•\-–—]/.test(line),
        hasUrl: URL_RE.test(line),
      }))
      .filter((line) => line.clean)
      .filter((line) => !looksLikeDurationSummary(line.clean))
      .filter((line) => !looksLikeExperienceNoise(line.clean))

    let company = companyFromDateLine
    let location = ''

    for (const line of normalizedLines.slice(0, 6)) {
      const clean = stripExperienceDurationSuffix(
        cleanLine(line.clean.replace(new RegExp(MONTH_YEAR_RE.source, 'gi'), '').replace(/[-–—|]+/g, ' '))
      )
      if (!clean) continue
      if (looksLikeRoleTitle(clean)) continue
      if (/^роль\s*:/i.test(clean)) continue

      if (!company) {
        const parts = clean.split(',').map(p => p.trim()).filter(Boolean)
        if (parts.length > 1 && KNOWN_CITIES_RE.test(parts[parts.length - 1])) {
          company = normalizeCompanyName(parts.slice(0, -1).join(', '))
          location = parts[parts.length - 1]
        } else {
          company = normalizeCompanyName(clean)
        }
      } else if (!location && KNOWN_CITIES_RE.test(clean)) {
        location = clean
      }
    }

    let companyUrl = ''
    for (const line of normalizedLines) {
      if (!looksLikeCompanyUrlLine(line.raw, company)) continue
      companyUrl = line.raw.match(URL_RE)?.[0] ?? ''
      break
    }

    let position = ''
    let positionIdx = -1
    for (let i = 0; i < normalizedLines.length; i++) {
      const roleTitle = extractRoleTitle(normalizedLines[i].clean)
      if (roleTitle) {
        position = roleTitle
        positionIdx = i
        break
      }
    }

    for (let i = 0; !position && i < Math.min(normalizedLines.length, 15); i++) {
      if (!normalizedLines[i].wasBullet && looksLikeRoleTitle(normalizedLines[i].clean)) {
        position = normalizedLines[i].clean
        positionIdx = i
        break
      }
    }

    const skills = normalizedLines
      .filter((l) => /^(?:стек|stack):/i.test(l.clean))
      .flatMap((l) => splitTagList(l.clean.replace(/^(?:стек|stack):/i, '')))

    const descriptionLines = normalizedLines
      .filter((_, i) => i !== positionIdx)
      .filter((l) => !/^(?:стек|stack):/i.test(l.clean))
      .filter((l) => l.clean !== location)
      .filter((l) => normalizeCompanyName(stripExperienceDurationSuffix(l.clean)) !== company)
      .filter((l) => !(companyUrl && l.raw.includes(companyUrl) && looksLikeCompanyUrlLine(l.raw, company)))
      .map((l) => l.raw)
      .filter(Boolean)

    return {
      id: crypto.randomUUID(),
      company,
      companyUrl,
      position,
      location,
      fromMonth: from,
      toMonth: to,
      isCurrent,
      description: descriptionLines.join('\n').trim(),
      skills,
    }
  }).filter((exp) => exp.company || exp.position || exp.description || exp.skills.length)
}

function parseExperienceBlockEnCv(lines: string[]): WorkExperience[] {
  const normalizedLines = lines
    .map((line) => preserveStructuredLine(line))
    .filter(Boolean)

  const entries: string[][] = []
  let current: string[] = []

  for (let index = 0; index < normalizedLines.length; index++) {
    const line = normalizedLines[index]
    const nextLine = normalizedLines[index + 1]
    const startsEntry =
      !DATE_RE.test(line) &&
      !CURRENT_MARKER_RE.test(line) &&
      Boolean(nextLine) &&
      (DATE_RE.test(nextLine) || CURRENT_MARKER_RE.test(nextLine)) &&
      !/^(?:stack|стек)\s*:/i.test(line) &&
      !/^[•\-–—]/.test(line)

    if (startsEntry) {
      if (current.length) entries.push(current)
      current = [line]
      continue
    }

    if (current.length) {
      current.push(line)
    }
  }

  if (current.length) entries.push(current)

  return entries.map((entryLines) => {
    const companyLine = entryLines[0] ?? ''
    const dateLine = entryLines.find((line, index) => index > 0 && (DATE_RE.test(line) || CURRENT_MARKER_RE.test(line))) ?? ''
    const { from, to, isCurrent } = extractDates(dateLine)
    const company = normalizeCompanyName(stripExperienceDurationSuffix(cleanLine(companyLine)))

    const skills = entryLines
      .filter((line) => /^(?:stack|стек)\s*:/i.test(line))
      .flatMap((line) => splitTagList(line.replace(/^(?:stack|стек)\s*:/i, '')))
      .map((skill) => normalizeSkillName(skill, 'en_cv'))
      .filter(Boolean)

    const description = entryLines
      .filter((line) => line !== companyLine && line !== dateLine)
      .filter((line) => !/^(?:stack|стек)\s*:/i.test(line))
      .map((line) => preserveStructuredLine(line))
      .filter(Boolean)
      .join('\n')
      .trim()

    return {
      id: crypto.randomUUID(),
      company,
      companyUrl: '',
      position: '',
      location: '',
      fromMonth: from,
      toMonth: to,
      isCurrent,
      description,
      skills,
    }
  }).filter((entry) => entry.company || entry.description || entry.skills.length)
}

function parseEducationBlock(lines: string[]): Education[] {
  return splitEntries(lines).map((entryLines) => {
    const dateLineIndex = entryLines.findIndex((line) => DATE_RE.test(line) || CURRENT_MARKER_RE.test(line))
    const dateLine = dateLineIndex >= 0 ? entryLines[dateLineIndex] : entryLines[0]
    const [headerLine, ...restLines] = entryLines
    const { from, to, isCurrent } = extractDates(dateLine)
    const institutionParts = [cleanLine(
      (dateLineIndex > 0 ? entryLines[0] : headerLine)
        .replace(new RegExp(MONTH_YEAR_RE.source, 'gi'), '')
        .replace(/[-–—|]+/g, ' ')
    )]
    const programParts: string[] = []

    const bodyLines = dateLineIndex > 0
      ? entryLines.filter((_, index) => index !== 0 && index !== dateLineIndex)
      : restLines

    for (const line of bodyLines.map((value) => cleanLine(value)).filter(Boolean)) {
      if (!programParts.length && !looksLikeEducationProgram(line)) {
        institutionParts.push(line)
        continue
      }

      programParts.push(line)
    }

    const institution = institutionParts.join(' ').trim()
    const programText = programParts.join(' ').trim()
    const { degree, field } = splitEducationProgram(programText)

    return {
      id: crypto.randomUUID(),
      institution,
      degree,
      field,
      fromMonth: from,
      toMonth: to,
      isCurrent,
    }
  }).filter((edu) => edu.institution || edu.degree || edu.field)
}

function looksLikeEducationProgram(line: string): boolean {
  return /(bachelor|master|phd|doctorate|associate|бакалавр|магистр|аспирант|специалист)/i.test(line)
    || (line.includes(',') && line.length > 40)
}

function splitEducationProgram(programText: string): { degree: string; field: string } {
  if (!programText) {
    return { degree: '', field: '' }
  }

  const degreeMatch = programText.match(/(bachelor|master|phd|doctorate|associate|бакалавр|магистр|аспирант|специалист)/i)
  if (degreeMatch) {
    return {
      degree: degreeMatch[0],
      field: programText.replace(degreeMatch[0], '').replace(/^[-–—,\s]+/, '').trim(),
    }
  }

  const parts = programText.split(',').map((part) => part.trim()).filter(Boolean)
  if (parts.length >= 2) {
    return {
      degree: parts[0],
      field: parts.slice(1).join(', '),
    }
  }

  return { degree: programText, field: '' }
}

function normalizeSkillName(value: string, profile: ParserProfile = 'generic'): string {
  const normalized = value
    .replace(/\bPr\s+eact\b/gi, 'Preact')
    .replace(/\bPr\s+eact Signals\b/gi, 'Preact Signals')
    .replace(/\bTanstack\b/gi, 'TanStack')
    .replace(/\bReact Testing Library\b/gi, 'React Testing Library')
    .replace(/\b(\d)\s+D\b/g, '$1D')
    .replace(/\s+/g, ' ')
    .replace(/\.$/, '')
    .trim()

  if (profile === 'hh_ru') {
    return normalized
      .replace(/^@tanstack$/i, '')
      .trim()
  }

  return normalized
}

function parseSkillsBlock(lines: string[], profile: ParserProfile): Skill[] {
  const seen = new Set<string>()
  const results: Skill[] = []

  const parts = lines
    .flatMap((line) => line
      .split(/\n|[,;|•·]+/g)
      .map((part) => part.replace(/^[-–—*]\s*/, '').trim())
    )
    .flatMap((part) => {
      const colonIndex = part.indexOf(':')
      if (colonIndex > 0 && colonIndex < 30) {
        return part.slice(colonIndex + 1).split(/[,;|]+/g).map((token) => token.trim())
      }
      return [part]
    })
    .map(cleanLine)
    .map((part) => normalizeSkillName(part, profile))
    .filter(Boolean)

  for (const part of parts) {
    if (part.length > 48) continue
    if (/\s/.test(part) && part.split(/\s+/).length > 4) continue
    if (/[.!?]$/.test(part)) continue
    if (/\b(снизила|улучшил|провела|реализовала|внедрила|разработала|настроила|сократился|повысил|запустил)\b/i.test(part)) continue

    const key = part.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)

    results.push({
      id: crypto.randomUUID(),
      name: part,
    })
  }

  return results
}

function splitLooseEntries(lines: string[]): string[][] {
  const entries: string[][] = []
  let current: string[] = []

  for (const line of lines) {
    const cleaned = cleanLine(line)
    const startsNew = current.length > 0 && (
      PROJECT_KEYWORD_RE.test(cleaned) ||
      (cleaned.length <= 90 && !/[.!?]$/.test(cleaned) && !/^[•\-–—]/.test(cleaned) && /[A-ZА-ЯЁ]/.test(cleaned[0] ?? '')) ||
      ((DATE_RE.test(cleaned) || CURRENT_MARKER_RE.test(cleaned)) && current.some((value) => cleanLine(value)))
    )

    if (startsNew) {
      entries.push(current)
      current = [line]
      continue
    }

    current.push(line)
  }

  if (current.length) {
    entries.push(current)
  }

  return entries.filter((entry) => entry.some((line) => cleanLine(line)))
}

function cleanProjectTitle(value: string): string {
  return cleanLine(value)
    .replace(/\b(certification|certificate|project|projects|сертификат|сертификация|проект)\b[:\s-]*/i, '')
    .trim()
}

function parseProjectsBlock(lines: string[]): Project[] {
  const entries = splitLooseEntries(lines)

  return entries.map((entryLines) => {
    const cleaned = entryLines.map((line) => cleanLine(line)).filter(Boolean)
    const [titleLine = '', ...restLines] = cleaned
    const link = firstUrl(entryLines)
    const title = cleanProjectTitle(titleLine)
    let subtitle = ''
    let descriptionLines = restLines

    if (restLines[0] && restLines[0].length <= 80 && !/[.!?]$/.test(restLines[0])) {
      subtitle = restLines[0]
      descriptionLines = restLines.slice(1)
    }

    return {
      id: crypto.randomUUID(),
      kind: 'project' as const,
      title,
      subtitle,
      issuedAt: '',
      link,
      description: descriptionLines.join('\n').trim(),
    }
  }).filter((entry) => entry.title || entry.subtitle || entry.description || entry.link)
}

function parseLanguagesBlock(lines: string[]): Language[] {
  const fullText = lines.join(' ')
  const results: Language[] = []
  const seenNames = new Set<string>()

  const namePattern = new RegExp(`(${[...HUMAN_LANGUAGE_NAMES].join('|')})`, 'gi')
  const nameMatches = [...fullText.matchAll(namePattern)]

  for (let i = 0; i < nameMatches.length; i++) {
    const match = nameMatches[i]
    const name = match[0]
    const key = name.toLowerCase()
    if (seenNames.has(key)) continue
    seenNames.add(key)

    const contextStart = match.index! + name.length
    const nextMatchStart = nameMatches[i + 1]?.index ?? fullText.length
    const context = fullText.slice(contextStart, Math.min(contextStart + 50, nextMatchStart))

    results.push({
      id: crypto.randomUUID(),
      name,
      proficiency: matchProficiency(context),
    })
  }

  return results
}



