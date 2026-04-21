import type { PdfMetadata, SocialLink } from '@/entities/resume/model/types'
import { normalizePdfPageText } from '@/utils/pdfTextNormalizer'

export interface ExtractedPdfDocument {
  pageTexts: string[]
  annotationLinks: SocialLink[]
  metadata: Partial<PdfMetadata>
}

export interface PdfExtractionOptions {
  includeHeaderAnnotationLinks: boolean
}

export async function extractPdfDocument(
  file: File,
  options: PdfExtractionOptions,
): Promise<ExtractedPdfDocument> {
  const arrayBuffer = await file.arrayBuffer()
  const pdfjsLib = await import('pdfjs-dist')

  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
  ).href

  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const pageTexts: string[] = []

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const pageWidth = Array.isArray(page.view) ? page.view[2] - page.view[0] : 0
    pageTexts.push(normalizePdfPageText(content.items, pageWidth))
  }

  const annotationLinks: SocialLink[] = options.includeHeaderAnnotationLinks
    ? await extractHeaderAnnotationLinks(pdf)
    : []

  return {
    pageTexts,
    annotationLinks,
    metadata: await extractPdfMetadata(pdf),
  }
}

export function joinPageTexts(document: ExtractedPdfDocument): string {
  return document.pageTexts.filter(Boolean).join('\n\n').trim()
}

async function extractHeaderAnnotationLinks(pdf: any): Promise<SocialLink[]> {
  if (pdf.numPages < 1) {
    return []
  }

  const firstPage = await pdf.getPage(1)
  const annotations = await firstPage.getAnnotations()
  const pageHeight = Array.isArray(firstPage.view) ? firstPage.view[3] : 0
  const headerLinks = annotations.filter((annotation: any) => {
    const url = annotation.url || annotation.unsafeUrl
    const rect = annotation.rect

    return Boolean(
      url &&
      Array.isArray(rect) &&
      pageHeight &&
      rect[1] >= pageHeight * 0.75,
    )
  })

  return headerLinks
    .map((annotation: any) => annotation.url || annotation.unsafeUrl)
    .map((url: string) => ({
      id: crypto.randomUUID(),
      label: detectLinkLabel(url),
      url: url.replace(/^mailto:/i, ''),
    }))
}

function detectLinkLabel(url: string): string {
  const normalized = url.toLowerCase()
  if (normalized.startsWith('mailto:') || normalized.includes('@')) return 'Email'
  if (normalized.includes('github')) return 'GitHub'
  if (normalized.includes('linkedin')) return 'LinkedIn'
  if (normalized.includes('t.me') || normalized.includes('telegram')) return 'Telegram'
  return 'Link'
}

async function extractPdfMetadata(pdf: any): Promise<Partial<PdfMetadata>> {
  try {
    const metadata = await pdf.getMetadata()
    const info = metadata?.info ?? {}

    return {
      title: sanitizePdfMetaField(info.Title),
      author: sanitizePdfMetaField(info.Author),
      subject: sanitizePdfMetaField(info.Subject),
      keywords: sanitizePdfKeywords(info.Keywords),
    }
  } catch {
    return {}
  }
}

function sanitizePdfMetaField(value: unknown): string {
  return typeof value === 'string' ? value.replace(/\0/g, '').trim() : ''
}

function sanitizePdfKeywords(value: unknown): string {
  const raw = sanitizePdfMetaField(value)
  if (!raw) return ''

  const parts = raw
    .split(/[;,]/g)
    .map((part) => part.trim())
    .filter(Boolean)

  if (!parts.length) return ''
  if (parts.every((part) => /^[A-Za-z0-9-]{6,}$/.test(part) || /^\d+$/.test(part))) {
    return ''
  }

  return parts.join(', ')
}
