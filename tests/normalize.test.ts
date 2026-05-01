import { describe, it, expect } from 'vitest'
import { normalizeResumeData, buildHydratedResumeData } from '@/entities/resume/model/normalize'
import type { LegacyResumeData } from '@/entities/resume/model/normalize'
import { createEmptyResume } from '@/entities/resume/model/factories'

function makeBase(overrides: Partial<LegacyResumeData> = {}): LegacyResumeData {
  return { ...createEmptyResume(), ...overrides }
}

describe('normalizeResumeData', () => {
  it('composes fullName from parts when parts present', () => {
    const result = normalizeResumeData(makeBase({
      personal: {
        ...createEmptyResume().personal,
        lastName: 'Иванов',
        firstName: 'Иван',
        middleName: 'Иванович',
        fullName: '',
      },
    }))
    expect(result.personal.fullName).toBe('Иванов Иван Иванович')
  })

  it('falls back to fullName when parts are empty', () => {
    const result = normalizeResumeData(makeBase({
      personal: {
        ...createEmptyResume().personal,
        fullName: 'John Smith',
        firstName: '',
        lastName: '',
        middleName: '',
      },
    }))
    expect(result.personal.fullName).toBe('John Smith')
  })

  it('migrates legacy email to links', () => {
    const result = normalizeResumeData(makeBase({
      personal: {
        ...createEmptyResume().personal,
        email: 'user@example.com',
        links: [],
      } as any,
    }))
    const emailLink = result.personal.links.find((l) => l.label === 'Email')
    expect(emailLink?.url).toBe('user@example.com')
  })

  it('does not duplicate email link if already present', () => {
    const result = normalizeResumeData(makeBase({
      personal: {
        ...createEmptyResume().personal,
        email: 'user@example.com',
        links: [{ id: '1', label: 'Email', url: 'user@example.com' }],
      } as any,
    }))
    const emailLinks = result.personal.links.filter((l) => l.label === 'Email')
    expect(emailLinks.length).toBe(1)
  })

  it('normalizes workExperience entries', () => {
    const result = normalizeResumeData(makeBase({
      workExperience: [{ id: '1', company: '  Acme  ', position: 'Dev', location: '', fromMonth: '', toMonth: '', isCurrent: false, description: '', skills: [] }],
    }))
    expect(result.workExperience[0].company).toBe('  Acme  ')
  })

  it('filters non-string workFormats', () => {
    const result = normalizeResumeData(makeBase({
      personal: {
        ...createEmptyResume().personal,
        workFormats: ['remote', null as any, '  ', 'office'],
      },
    }))
    expect(result.personal.workFormats).toEqual(['remote', 'office'])
  })

  it('handles missing personal gracefully', () => {
    const base = makeBase()
    ;(base as any).personal = undefined
    const result = normalizeResumeData(base)
    expect(result.personal.fullName).toBe('')
  })
})

describe('buildHydratedResumeData', () => {
  it('merges parsed data onto empty resume', () => {
    const result = buildHydratedResumeData({
      personal: { ...createEmptyResume().personal, fullName: 'Jane Doe', position: 'Manager' },
      aboutMe: 'Hello',
    })
    expect(result.personal.fullName).toBe('Jane Doe')
    expect(result.aboutMe).toBe('Hello')
  })

  it('returns empty resume when nothing is passed', () => {
    const result = buildHydratedResumeData({})
    expect(result.personal.fullName).toBe('')
    expect(result.workExperience).toEqual([])
  })
})
