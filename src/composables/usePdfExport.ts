import { ref, type Ref } from 'vue'
import type { PdfMetadata } from '@/types/resume'
import { useLocaleStore } from '@/stores/locale'
import { evaluateExportPerformance } from '@/utils/performanceBudget'
import {
  A4_MM_HEIGHT,
  A4_MM_WIDTH,
  measurePagedLayout,
} from '@/utils/pagination'

const CYRILLIC_TO_LATIN: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z',
  и: 'i', й: 'i', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
  с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch',
  ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
}

export function usePdfExport(elementRef: Ref<HTMLElement | null>) {
  const localeStore = useLocaleStore()
  const { t } = localeStore

  const exporting = ref(false)
  const error = ref<string | null>(null)

  async function exportPdf(meta: PdfMetadata) {
    const el = elementRef.value
    if (!el) return

    exporting.value = true
    error.value = null

    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ])

      const naturalWidth = el.scrollWidth
      const naturalHeight = el.scrollHeight

      const wrapper = document.createElement('div')
      Object.assign(wrapper.style, {
        position: 'fixed',
        top: '0',
        left: '-99999px',
        width: `${naturalWidth}px`,
        height: `${naturalHeight}px`,
        overflow: 'visible',
        zIndex: '-1',
        pointerEvents: 'none',
      })
      const clone = el.cloneNode(true) as HTMLElement
      clone.style.transform = 'none'
      wrapper.appendChild(clone)
      document.body.appendChild(wrapper)

      let canvas: HTMLCanvasElement
      try {
        canvas = await html2canvas(clone, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
          width: naturalWidth,
          height: naturalHeight,
        })

        const layout = measurePagedLayout(clone)
        const performanceIssues = evaluateExportPerformance({
          layout,
          width: naturalWidth,
          height: naturalHeight,
          scale: 2,
        })
        if (performanceIssues.length) {
          console.warn('Resume export is over budget:', performanceIssues)
        }
        const ratio = canvas.height / layout.height
        const pageStarts = layout.pageStarts.map((value) => Math.round(value * ratio))
        const pageBreaks = [...pageStarts, canvas.height]

        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

        pdf.setProperties({
          title: meta.title || t('pdf.defaultDocumentTitle'),
          subject: meta.subject || '',
          keywords: meta.keywords || '',
          author: meta.author || '',
          creator: 'Resumetor',
        })

        pageBreaks.slice(0, -1).forEach((pageTop, pageIndex) => {
          if (pageIndex > 0) {
            pdf.addPage()
          }

          const nextPageTop = pageBreaks[pageIndex + 1] ?? canvas.height
          const sliceHeight = Math.max(1, nextPageTop - pageTop)

          const sliceCanvas = document.createElement('canvas')
          sliceCanvas.width = canvas.width
          sliceCanvas.height = Math.round(canvas.width * (A4_MM_HEIGHT / A4_MM_WIDTH))

          const sliceCtx = sliceCanvas.getContext('2d')!
          sliceCtx.fillStyle = '#ffffff'
          sliceCtx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height)
          sliceCtx.drawImage(canvas, 0, pageTop, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight)

          pdf.addImage(sliceCanvas, 'PNG', 0, 0, A4_MM_WIDTH, A4_MM_HEIGHT)
        })

        const blob = pdf.output('blob')
        const filename = buildPdfFilename(meta.title || t('pdf.defaultFilename'))
        downloadBlob(blob, filename)
      } finally {
        document.body.removeChild(wrapper)
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : t('export.failed')
      console.error(e)
    } finally {
      exporting.value = false
    }
  }

  return { exportPdf, exporting, error }
}

function buildPdfFilename(value: string): string {
  const transliterated = Array.from(value)
    .map((char) => {
      const lower = char.toLowerCase()
      const mapped = CYRILLIC_TO_LATIN[lower]
      if (!mapped) return char
      return char === lower ? mapped : capitalize(mapped)
    })
    .join('')

  const safeBase = transliterated
    .replace(/\.pdf$/i, '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9._ -]+/g, ' ')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^\.+|\.+$/g, '')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()

  const base = safeBase || 'resume'
  return `${base}.pdf`
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
