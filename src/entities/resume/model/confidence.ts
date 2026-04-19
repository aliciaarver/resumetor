import type { ResumeData } from '@/entities/resume/model/types'
import type { ParseBlockMetrics, ResumeBlockKey } from '@/utils/parseTextToResume'

export type ParseConfidenceLevel = 'high' | 'medium' | 'low' | 'missing'

export function buildPersonalMetrics(
  personal: ResumeData['personal'] | undefined,
  rawText: string,
): ParseBlockMetrics {
  const value = personal ?? {
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
  const filledCount = [
    value.fullName.trim(),
    value.firstName.trim(),
    value.lastName.trim(),
    value.middleName.trim(),
    value.position.trim(),
    value.location.trim(),
    value.citizenship.trim(),
    value.workPermit.trim(),
    value.gender.trim(),
    value.age.trim(),
    value.birthDate.trim(),
    value.photo.trim(),
    value.phone.trim(),
    ...(value.workFormats ?? []).map((entry) => entry.trim()),
    ...(value.links ?? []).map((link) => link.url.trim()),
  ].filter(Boolean).length

  const score = Math.min(
    1,
    (value.fullName.trim() ? 0.45 : 0) +
    (value.position.trim() ? 0.15 : 0) +
    (value.location.trim() ? 0.1 : 0) +
    (value.phone.trim() ? 0.2 : 0) +
    Math.min(0.25, (value.links?.filter((link) => link.url.trim()).length ?? 0) * 0.12)
  )

  return {
    score: Math.round(score * 100) / 100,
    rawText,
    extractedCount: filledCount,
  }
}

export function toConfidenceLevel(metrics: ParseBlockMetrics): ParseConfidenceLevel {
  if (!metrics.rawText.trim() && metrics.extractedCount === 0) return 'missing'
  if (metrics.score >= 0.75) return 'high'
  if (metrics.score >= 0.5) return 'medium'
  return 'low'
}

export function buildConfidenceNote(
  key: ResumeBlockKey,
  metrics: ParseBlockMetrics,
  confidence: ParseConfidenceLevel,
  t: (key: string, params?: Record<string, string | number>) => string,
): string {
  if (confidence === 'missing') {
    return t('review.noteMissing')
  }

  if (confidence === 'low') {
    if (!metrics.extractedCount) {
      return t('review.noteLowNoEntities')
    }

    return t('review.noteLow', { count: metrics.extractedCount })
  }

  if (confidence === 'medium') {
    if (key === 'skills' || key === 'projects') {
      return t('review.noteMediumManualCheck')
    }

    return t('review.noteMedium', { count: metrics.extractedCount })
  }

  return t('review.noteHigh', { count: metrics.extractedCount })
}
