import { A4_PX_HEIGHT } from '@/utils/pagination';
export const PREVIEW_PERFORMANCE_BUDGET = {
    maxPages: 4,
    maxDocumentHeight: A4_PX_HEIGHT * 5,
};
export const EXPORT_PERFORMANCE_BUDGET = {
    maxPages: 4,
    maxCanvasPixels: 36_000_000,
};
export function evaluatePreviewPerformance(layout) {
    const issues = [];
    const pageCount = layout.pageStarts.length;
    if (pageCount > PREVIEW_PERFORMANCE_BUDGET.maxPages) {
        issues.push('pageCount');
    }
    if (layout.height > PREVIEW_PERFORMANCE_BUDGET.maxDocumentHeight) {
        issues.push('documentHeight');
    }
    return issues;
}
export function evaluateExportPerformance(options) {
    const issues = evaluatePreviewPerformance(options.layout);
    const estimatedPixels = options.width * options.height * options.scale * options.scale;
    if (estimatedPixels > EXPORT_PERFORMANCE_BUDGET.maxCanvasPixels) {
        issues.push('exportPixels');
    }
    return Array.from(new Set(issues));
}
