import { ref } from 'vue'
import { useLocaleStore } from '@/stores/locale'
import type { PdfMetadata, ResumeData } from '@/entities/resume/model/types'
import type { ParseConfidenceLevel } from '@/entities/resume/model/confidence'
import {
  parseResumeFromPdf,
  type ParseResumeFromPdfResult,
} from '@/features/upload-resume/model/parse-resume-from-pdf.use-case'
import type { ParseReview, ParseBlockReview } from '@/features/upload-resume/lib/confidence-scoring'

export type { ParseConfidenceLevel, ParseReview, ParseBlockReview }

export interface ParsedResumePayload {
  resume: Partial<ResumeData>
  pdfMeta: Partial<PdfMetadata>
  review: ParseReview
}

export function useResumeParser() {
  const localeStore = useLocaleStore()
  const { t } = localeStore
  const parsing = ref(false)
  const error = ref<string | null>(null)

  async function parseFile(file: File): Promise<ParsedResumePayload | null> {
    parsing.value = true
    error.value = null

    try {
      const result: ParseResumeFromPdfResult = await parseResumeFromPdf({ file, t })
      return {
        resume: result.resume,
        pdfMeta: result.pdfMeta,
        review: result.review,
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : t('parser.failedToParse')
      return null
    } finally {
      parsing.value = false
    }
  }

  return { parseFile, parsing, error }
}
