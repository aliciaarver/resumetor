import { describe, it, expect } from 'vitest'
import {
  EXPORT_PERFORMANCE_BUDGET,
  evaluateExportPerformance,
  resolveExportScale,
} from './performanceBudget'

describe('resolveExportScale', () => {
  it('returns preferred scale for small documents', () => {
    expect(resolveExportScale(800, 1200)).toBe(2)
  })

  it('reduces scale when canvas would exceed pixel budget', () => {
    const width = 794
    const height = 12_000
    const scale = resolveExportScale(width, height)

    expect(scale).toBeLessThan(2)
    expect(scale).toBeGreaterThanOrEqual(EXPORT_PERFORMANCE_BUDGET.minScale)
    expect(width * height * scale * scale).toBeLessThanOrEqual(
      EXPORT_PERFORMANCE_BUDGET.maxCanvasPixels,
    )
  })

  it('never goes below minScale', () => {
    expect(resolveExportScale(2000, 20000)).toBe(EXPORT_PERFORMANCE_BUDGET.minScale)
  })
})

describe('evaluateExportPerformance with adaptive scale', () => {
  it('does not flag exportPixels when scale fits budget', () => {
    const width = 794
    const height = 12_000
    const scale = resolveExportScale(width, height)

    const issues = evaluateExportPerformance({
      layout: { height, pageStarts: [0, 1122, 2244], tallBlocks: 0 },
      width,
      height,
      scale,
    })

    expect(issues).not.toContain('exportPixels')
  })
})