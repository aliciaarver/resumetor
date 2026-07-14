import { A4_PX_HEIGHT, type PagedLayout } from '@/utils/pagination'

export type PerformanceBudgetIssue = 'pageCount' | 'documentHeight' | 'exportPixels'

export const PREVIEW_PERFORMANCE_BUDGET = {
  maxPages: 4,
  maxDocumentHeight: A4_PX_HEIGHT * 5,
} as const

export const EXPORT_PERFORMANCE_BUDGET = {
  maxPages: 4,
  maxCanvasPixels: 36_000_000,
  preferredScale: 2,
  minScale: 1,
} as const

export function evaluatePreviewPerformance(layout: PagedLayout): PerformanceBudgetIssue[] {
  const issues: PerformanceBudgetIssue[] = []
  const pageCount = layout.pageStarts.length

  if (pageCount > PREVIEW_PERFORMANCE_BUDGET.maxPages) {
    issues.push('pageCount')
  }

  if (layout.height > PREVIEW_PERFORMANCE_BUDGET.maxDocumentHeight) {
    issues.push('documentHeight')
  }

  return issues
}

export function evaluateExportPerformance(options: {
  layout: PagedLayout
  width: number
  height: number
  scale: number
}): PerformanceBudgetIssue[] {
  const issues = evaluatePreviewPerformance(options.layout)
  const estimatedPixels = options.width * options.height * options.scale * options.scale

  if (estimatedPixels > EXPORT_PERFORMANCE_BUDGET.maxCanvasPixels) {
    issues.push('exportPixels')
  }

  return Array.from(new Set(issues))
}

export function resolveExportScale(
  width: number,
  height: number,
  preferredScale = EXPORT_PERFORMANCE_BUDGET.preferredScale,
): number {
  if (width <= 0 || height <= 0) {
    return preferredScale
  }

  const pixelBudget = EXPORT_PERFORMANCE_BUDGET.maxCanvasPixels
  const maxScale = Math.sqrt(pixelBudget / (width * height))
  const scale = Math.min(preferredScale, maxScale)
  const stepped = Math.floor(scale * 4) / 4

  return Math.max(EXPORT_PERFORMANCE_BUDGET.minScale, stepped)
}
