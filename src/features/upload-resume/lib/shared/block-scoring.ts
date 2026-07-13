import type { Education, Language, Project, Skill, WorkExperience } from '@/entities/resume/model/types'
import { average, clamp01 } from '@/features/upload-resume/lib/shared/text-utils'

export function scoreAboutBlock(aboutText: string, rawLines: string[]): number {
  if (!rawLines.length && !aboutText) return 0
  if (!aboutText) return 0.2
  if (aboutText.length >= 180) return 0.9
  if (aboutText.length >= 80) return 0.7
  return 0.45
}

export function scoreWorkEntries(entries: WorkExperience[], rawLines: string[]): number {
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

export function scoreEducationEntries(entries: Education[], rawLines: string[]): number {
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

export function scoreSkills(entries: Skill[], rawLines: string[]): number {
  if (!rawLines.length && !entries.length) return 0
  if (!entries.length) return 0.2

  const validSkills = entries.filter((entry) => entry.name.trim().length >= 2)
  if (!validSkills.length) return 0.2

  return clamp01(0.25 + Math.min(0.45, validSkills.length * 0.08) + (rawLines.length ? 0.2 : 0))
}

export function scoreLanguages(entries: Language[], rawLines: string[]): number {
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

export function scoreProjects(entries: Project[], rawLines: string[]): number {
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