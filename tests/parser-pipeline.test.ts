import { describe, it, expect } from 'vitest'
import { normalizeDocument, stripFooterLines } from '@/features/upload-resume/lib/normalization'
import { detectParserProfile } from '@/features/upload-resume/lib/profile-detection'
import {
  buildPersonalMetrics,
  toConfidenceLevel,
  type ParseBlockMetrics,
} from '@/entities/resume/model/confidence'
import { applyConfidenceFallback } from '@/features/upload-resume/model/apply-confidence-fallback.use-case'
import { parseResumeFromPdf } from '@/features/upload-resume/model/parse-resume-from-pdf.use-case'

const t = (k: string) => k

describe('Stage 2: normalization', () => {
  it('splits joined page text into trimmed non-empty lines', () => {
    const pdf = {
      pageTexts: ['  Line A  \n\n  Line B  \n'],
      annotationLinks: [],
      metadata: {},
    } as any
    const out = normalizeDocument(pdf)
    expect(out.lines).toEqual(['Line A', 'Line B'])
    expect(out.rawText.length).toBeGreaterThan(0)
  })

  it('stripFooterLines removes hh-style "Резюме обновлено" footer', () => {
    const lines = [
      'Иванов Иван Иванович',
      'Senior Engineer',
      'Иванов Иван Иванович • Резюме обновлено 15 марта 2024 в 12:00',
      'Опыт работы',
    ]
    const out = stripFooterLines(lines)
    expect(out.some((l) => /Резюме обновлено/.test(l))).toBe(false)
  })
})

describe('Stage 3: profile detection', () => {
  it('detects hh_ru by Russian markers', () => {
    const res = detectParserProfile({
      rawText: '',
      lines: ['Желаемая должность', 'Опыт работы', 'Гражданство: Россия'],
    })
    expect(res.profile).toBe('hh_ru')
  })

  it('detects en_cv when About+Skills+Experience+Education present', () => {
    const res = detectParserProfile({
      rawText: '',
      lines: ['About', 'Skills', 'Experience', 'Education'],
    })
    expect(res.profile).toBe('en_cv')
  })

  it('falls back to generic', () => {
    const res = detectParserProfile({ rawText: '', lines: ['Hello world'] })
    expect(res.profile).toBe('generic')
  })
})

describe('Stage 6: confidence scoring contracts', () => {
  it('toConfidenceLevel: missing when no rawText and no entities', () => {
    expect(toConfidenceLevel({ score: 0, rawText: '', extractedCount: 0 })).toBe('missing')
  })

  it('toConfidenceLevel: thresholds high>=0.75, medium>=0.5, else low', () => {
    const base = { rawText: 'x', extractedCount: 1 }
    expect(toConfidenceLevel({ ...base, score: 0.8 })).toBe('high')
    expect(toConfidenceLevel({ ...base, score: 0.6 })).toBe('medium')
    expect(toConfidenceLevel({ ...base, score: 0.3 })).toBe('low')
  })

  it('buildPersonalMetrics: full personal yields high score', () => {
    const m = buildPersonalMetrics(
      {
        fullName: 'Иван Иванов',
        firstName: 'Иван',
        lastName: 'Иванов',
        middleName: '',
        position: 'Engineer',
        location: 'Moscow',
        citizenship: '',
        workPermit: '',
        workFormats: [],
        birthDate: '',
        gender: '',
        age: '',
        photo: '',
        phone: '+7 999 000 00 00',
        links: [{ url: 'https://example.com', label: 'site' }],
      },
      'raw',
    )
    expect(m.score).toBeGreaterThanOrEqual(0.75)
    expect(toConfidenceLevel(m)).toBe('high')
  })

  it('buildPersonalMetrics: empty personal yields missing', () => {
    const m = buildPersonalMetrics(undefined, '')
    expect(m.extractedCount).toBe(0)
    expect(toConfidenceLevel(m)).toBe('missing')
  })
})

describe('Stage 7: confidence fallback', () => {
  it('keeps only blocks marked imported=true', () => {
    const resume = { aboutMe: 'Hello', skills: [{ name: 'TS' }] } as any
    const blocks = [
      { key: 'aboutMe', imported: true },
      { key: 'skills', imported: false },
    ] as any
    const out = applyConfidenceFallback(resume, blocks)
    expect(out.aboutMe).toBe('Hello')
    expect(out.skills).toBeUndefined()
  })
})

describe('Use-case: parseResumeFromPdf input validation', () => {
  it('throws localized error for non-PDF file', async () => {
    const file = new File(['hi'], 'note.txt', { type: 'text/plain' })
    await expect(parseResumeFromPdf({ file, t })).rejects.toThrow('parser.unsupportedFileType')
  })
})

describe('Type contracts moved to entities/resume', () => {
  it('confidence types are importable from @/entities/resume/model/confidence', async () => {
    const mod = await import('@/entities/resume/model/confidence')
    expect(typeof mod.toConfidenceLevel).toBe('function')
    expect(typeof mod.buildPersonalMetrics).toBe('function')
    expect(typeof mod.buildConfidenceNote).toBe('function')
  })

  it('useResumeParser does not import from removed src/utils/parseTextToResume', async () => {
    const fs = await import('node:fs')
    const src = fs.readFileSync('src/composables/useResumeParser.ts', 'utf8')
    expect(src).not.toMatch(/utils\/parseTextToResume/)
    expect(src).toMatch(/parse-resume-from-pdf\.use-case/)
  })

  it('all 7 pipeline stage modules are present and exporting', async () => {
    const stages = [
      ['pdf-extraction', 'extractPdfDocument'],
      ['normalization', 'normalizeDocument'],
      ['profile-detection', 'detectParserProfile'],
      ['section-classification', 'classifyDocument'],
      ['entity-extraction', 'extractEntities'],
      ['confidence-scoring', 'buildParseReview'],
    ] as const
    for (const [dir, fn] of stages) {
      const mod: Record<string, unknown> = await import(
        `@/features/upload-resume/lib/${dir}/index.ts`
      )
      expect(typeof mod[fn]).toBe('function')
    }
  })

  it('legacy monolith src/utils/parseTextToResume.ts is removed', async () => {
    const fs = await import('node:fs')
    expect(fs.existsSync('src/utils/parseTextToResume.ts')).toBe(false)
  })
})

const _typeAssert: ParseBlockMetrics = { score: 0, rawText: '', extractedCount: 0 }
void _typeAssert
