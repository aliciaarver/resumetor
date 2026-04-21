import type { PdfMetadata, ResumeData, SocialLink } from '@/entities/resume/model/types'
import { normalizeSocialLinkLabel } from '@/utils/socialLinks'
import { resolveParserFeatureFlags, type ParserFeatureFlags } from '@/utils/parserFeatureFlags'
import { extractPdfDocument } from '@/features/upload-resume/lib/pdf-extraction'
import { normalizeDocument } from '@/features/upload-resume/lib/normalization'
import { detectParserProfile } from '@/features/upload-resume/lib/profile-detection'
import { classifyDocument } from '@/features/upload-resume/lib/section-classification'
import { extractEntities } from '@/features/upload-resume/lib/entity-extraction'
import { buildParseReview, type ParseReview } from '@/features/upload-resume/lib/confidence-scoring'
import { applyConfidenceFallback } from '@/features/upload-resume/model/apply-confidence-fallback.use-case'

export interface ParseResumeFromPdfInput {
  file: File
  t: (key: string, params?: Record<string, string | number>) => string
  featureFlagsOverrides?: Partial<ParserFeatureFlags>
}

export interface ParseResumeFromPdfResult {
  resume: Partial<ResumeData>
  pdfMeta: Partial<PdfMetadata>
  review: ParseReview
}

export async function parseResumeFromPdf(input: ParseResumeFromPdfInput): Promise<ParseResumeFromPdfResult> {
  const { file, t } = input
  const featureFlags = resolveParserFeatureFlags(input.featureFlagsOverrides)

  if (!isPdfFile(file)) {
    throw new Error(t('parser.unsupportedFileType'))
  }

  // Stage 1: PDF extraction
  const extractedPdf = await extractPdfDocument(file, {
    includeHeaderAnnotationLinks: featureFlags.enableHeaderAnnotationLinks,
  })

  // Stage 2: Normalization
  const normalized = normalizeDocument(extractedPdf)
  if (!normalized.rawText) {
    throw new Error(t('parser.noExtractableText'))
  }

  // Stage 3: Profile detection
  const profileDetection = detectParserProfile(normalized)

  // Stage 4: Section classification
  const classified = classifyDocument(normalized, profileDetection, featureFlags)

  // Stage 5: Entity extraction
  const draft = extractEntities(classified, profileDetection, {
    genericLinkLabel: t('common.link'),
    lines: normalized.lines,
  })

  const mergedPersonal = mergePersonalInfo(draft.resume.personal, {
    links: extractedPdf.annotationLinks,
  })
  const mergedResume: Partial<ResumeData> = {
    ...draft.resume,
    personal: mergedPersonal,
  }

  // Stage 6: Confidence scoring
  const review = buildParseReview({
    resume: mergedResume,
    effectiveBuckets: draft.effectiveBuckets,
    lines: normalized.lines,
    rawText: normalized.rawText,
    t,
  })

  // Stage 7: Fallback decision
  const safeResume = applyConfidenceFallback(mergedResume, review.blocks)

  return {
    resume: safeResume,
    pdfMeta: buildParsedPdfMeta(extractedPdf.metadata, safeResume, t('pdf.defaultTitleSuffix')),
    review,
  }
}

function isPdfFile(file: File): boolean {
  return file.type === 'application/pdf' || /\.pdf$/i.test(file.name)
}

function mergePersonalInfo(
  parsedPersonal: ResumeData['personal'] | undefined,
  extractedPersonal: Partial<ResumeData['personal']>,
): ResumeData['personal'] {
  const parsed = parsedPersonal ?? {
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
  const links = dedupeLinks([...(extractedPersonal.links ?? []), ...(parsed.links ?? [])])

  return {
    fullName: parsed.fullName || extractedPersonal.fullName || '',
    firstName: parsed.firstName || extractedPersonal.firstName || '',
    lastName: parsed.lastName || extractedPersonal.lastName || '',
    middleName: parsed.middleName || extractedPersonal.middleName || '',
    position: parsed.position || extractedPersonal.position || '',
    location: parsed.location || extractedPersonal.location || '',
    citizenship: parsed.citizenship || extractedPersonal.citizenship || '',
    workPermit: parsed.workPermit || extractedPersonal.workPermit || '',
    workFormats: parsed.workFormats?.length ? parsed.workFormats : (extractedPersonal.workFormats ?? []),
    birthDate: parsed.birthDate || extractedPersonal.birthDate || '',
    gender: parsed.gender || extractedPersonal.gender || '',
    age: parsed.age || extractedPersonal.age || '',
    photo: parsed.photo || extractedPersonal.photo || '',
    phone: parsed.phone || extractedPersonal.phone || '',
    links,
  }
}

function dedupeLinks(links: SocialLink[]): SocialLink[] {
  const seen = new Set<string>()

  return links.filter((link) => {
    if (!link.url) return false
    if (seen.has(link.url)) return false

    seen.add(link.url)
    link.label = normalizeSocialLinkLabel(link.label)
    return true
  })
}

function buildParsedPdfMeta(
  extractedPdfMeta: Partial<PdfMetadata>,
  resume: Partial<ResumeData>,
  defaultTitleSuffix: string,
): Partial<PdfMetadata> {
  const fullName = [
    resume.personal?.lastName ?? '',
    resume.personal?.firstName ?? '',
    resume.personal?.middleName ?? '',
  ].map((part) => part.trim()).filter(Boolean).join(' ') || (resume.personal?.fullName?.trim() ?? '')
  const aboutMe = resume.aboutMe?.trim() ?? ''

  return {
    title: fullName ? `${fullName} — ${defaultTitleSuffix}` : extractedPdfMeta.title || '',
    author: fullName || extractedPdfMeta.author || '',
    subject: aboutMe || extractedPdfMeta.subject || '',
    keywords: extractedPdfMeta.keywords || '',
  }
}
