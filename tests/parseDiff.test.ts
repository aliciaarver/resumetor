import { describe, it, expect } from 'vitest'
import { buildParseDiff } from '@/utils/parseDiff'
import { createEmptyResume } from '@/entities/resume/model/factories'
import type { ResumeData } from '@/types/resume'

function makeResume(overrides: Partial<ResumeData> = {}): ResumeData {
  return { ...createEmptyResume(), ...overrides }
}

describe('buildParseDiff', () => {
  it('returns zero totalChanges for identical resumes', () => {
    const resume = makeResume()
    const diff = buildParseDiff(resume, resume)
    expect(diff.totalChanges).toBe(0)
    expect(diff.blocks.every((b) => !b.changed)).toBe(true)
  })

  it('detects personal fullName change', () => {
    const before = makeResume({ personal: { ...createEmptyResume().personal, fullName: '' } })
    const after = makeResume({ personal: { ...createEmptyResume().personal, fullName: 'John Smith' } })
    const diff = buildParseDiff(before, after)
    const personal = diff.blocks.find((b) => b.key === 'personal')!
    expect(personal.changed).toBe(true)
    expect(personal.addedCount).toBeGreaterThan(0)
  })

  it('detects aboutMe change', () => {
    const before = makeResume({ aboutMe: '' })
    const after = makeResume({ aboutMe: 'Experienced dev' })
    const diff = buildParseDiff(before, after)
    const block = diff.blocks.find((b) => b.key === 'aboutMe')!
    expect(block.changed).toBe(true)
    expect(block.addedCount).toBe(1)
  })

  it('detects added workExperience entry', () => {
    const entry = { id: '1', company: 'Acme', position: 'Dev', location: '', fromMonth: '', toMonth: '', isCurrent: false, description: '', skills: [] }
    const before = makeResume({ workExperience: [] })
    const after = makeResume({ workExperience: [entry] })
    const diff = buildParseDiff(before, after)
    const block = diff.blocks.find((b) => b.key === 'workExperience')!
    expect(block.addedCount).toBe(1)
    expect(block.removedCount).toBe(0)
  })

  it('detects removed skill', () => {
    const skill = { id: '1', name: 'TypeScript' }
    const before = makeResume({ skills: [skill] })
    const after = makeResume({ skills: [] })
    const diff = buildParseDiff(before, after)
    const block = diff.blocks.find((b) => b.key === 'skills')!
    expect(block.removedCount).toBe(1)
  })

  it('ignores id differences when comparing entries', () => {
    const entry1 = { id: 'old-id', company: 'Acme', position: 'Dev', location: '', fromMonth: '', toMonth: '', isCurrent: false, description: '', skills: [] }
    const entry2 = { id: 'new-id', company: 'Acme', position: 'Dev', location: '', fromMonth: '', toMonth: '', isCurrent: false, description: '', skills: [] }
    const before = makeResume({ workExperience: [entry1] })
    const after = makeResume({ workExperience: [entry2] })
    const diff = buildParseDiff(before, after)
    const block = diff.blocks.find((b) => b.key === 'workExperience')!
    expect(block.changed).toBe(false)
  })

  it('totalChanges sums all block changes', () => {
    const before = makeResume()
    const after = makeResume({
      aboutMe: 'Hello',
      skills: [{ id: '1', name: 'Go' }],
    })
    const diff = buildParseDiff(before, after)
    expect(diff.totalChanges).toBe(2)
  })
})
