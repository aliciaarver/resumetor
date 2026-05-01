import { describe, it, expect } from 'vitest'
import { buildPersonalMetrics, toConfidenceLevel, buildConfidenceNote } from '@/entities/resume/model/confidence'
import { createEmptyResume } from '@/entities/resume/model/factories'

const t = (key: string, params?: Record<string, string | number>) =>
  params ? `${key}:${JSON.stringify(params)}` : key

describe('buildPersonalMetrics', () => {
  it('returns score 0 and extractedCount 0 for empty personal', () => {
    const metrics = buildPersonalMetrics(undefined, '')
    expect(metrics.score).toBe(0)
    expect(metrics.extractedCount).toBe(0)
  })

  it('returns high score when key fields are filled', () => {
    const personal = {
      ...createEmptyResume().personal,
      fullName: 'John Smith',
      position: 'Engineer',
      location: 'NYC',
      phone: '+1-555-0100',
      links: [{ id: '1', label: 'Email' as const, url: 'j@example.com' }],
    }
    const metrics = buildPersonalMetrics(personal, 'some text')
    expect(metrics.score).toBeGreaterThanOrEqual(0.75)
  })

  it('caps score at 1', () => {
    const personal = {
      ...createEmptyResume().personal,
      fullName: 'John Smith',
      position: 'Eng',
      location: 'NYC',
      phone: '+1-555-0100',
      links: [
        { id: '1', label: 'Email' as const, url: 'j@example.com' },
        { id: '2', label: 'LinkedIn' as const, url: 'linkedin.com/in/j' },
        { id: '3', label: 'GitHub' as const, url: 'github.com/j' },
      ],
    }
    const metrics = buildPersonalMetrics(personal, 'text')
    expect(metrics.score).toBeLessThanOrEqual(1)
  })

  it('counts extractedCount from all non-empty fields', () => {
    const personal = {
      ...createEmptyResume().personal,
      fullName: 'John',
      phone: '+1-555-0100',
    }
    const metrics = buildPersonalMetrics(personal, 'text')
    expect(metrics.extractedCount).toBeGreaterThanOrEqual(2)
  })
})

describe('toConfidenceLevel', () => {
  it('returns missing when no text and no extracted count', () => {
    expect(toConfidenceLevel({ score: 0, rawText: '', extractedCount: 0 })).toBe('missing')
  })

  it('returns high when score >= 0.75', () => {
    expect(toConfidenceLevel({ score: 0.75, rawText: 'text', extractedCount: 5 })).toBe('high')
    expect(toConfidenceLevel({ score: 1, rawText: 'text', extractedCount: 10 })).toBe('high')
  })

  it('returns medium when 0.5 <= score < 0.75', () => {
    expect(toConfidenceLevel({ score: 0.5, rawText: 'text', extractedCount: 3 })).toBe('medium')
    expect(toConfidenceLevel({ score: 0.74, rawText: 'text', extractedCount: 3 })).toBe('medium')
  })

  it('returns low when score < 0.5 but has content', () => {
    expect(toConfidenceLevel({ score: 0.3, rawText: 'text', extractedCount: 1 })).toBe('low')
    expect(toConfidenceLevel({ score: 0, rawText: 'text', extractedCount: 0 })).toBe('low')
  })
})

describe('buildConfidenceNote', () => {
  it('returns noteMissing for missing confidence', () => {
    const note = buildConfidenceNote('personal', { score: 0, rawText: '', extractedCount: 0 }, 'missing', t)
    expect(note).toBe('review.noteMissing')
  })

  it('returns noteLowNoEntities when low and no entities', () => {
    const note = buildConfidenceNote('personal', { score: 0.1, rawText: 'text', extractedCount: 0 }, 'low', t)
    expect(note).toBe('review.noteLowNoEntities')
  })

  it('returns noteLow with count when low and has entities', () => {
    const note = buildConfidenceNote('personal', { score: 0.3, rawText: 'text', extractedCount: 2 }, 'low', t)
    expect(note).toContain('review.noteLow')
    expect(note).toContain('2')
  })

  it('returns noteMediumManualCheck for skills/projects', () => {
    const note = buildConfidenceNote('skills', { score: 0.6, rawText: 'text', extractedCount: 3 }, 'medium', t)
    expect(note).toBe('review.noteMediumManualCheck')
  })

  it('returns noteHigh for high confidence', () => {
    const note = buildConfidenceNote('personal', { score: 0.9, rawText: 'text', extractedCount: 8 }, 'high', t)
    expect(note).toContain('review.noteHigh')
  })
})
