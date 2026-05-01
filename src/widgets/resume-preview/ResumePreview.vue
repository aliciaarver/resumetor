<template>
  <div class="preview-wrap">
    <ExportPdfControls
      v-model:selectedTemplateId="selectedTemplateId"
      :exporting="exporting"
      :performanceNotice="previewPerformanceNotice"
      :tallBlocks="previewTallBlocks"
      @export="handleExport"
      @toggle-settings="showPdfSettings = !showPdfSettings"
    />

    <div class="preview-container" ref="previewContainerEl" :aria-label="t('builder.previewRegionLabel')">
      <div class="preview-pages" :style="pageStyle">
        <div
          v-for="page in pageOffsets"
          :key="page.index"
          class="preview-page__sheet"
          aria-hidden="true"
          :style="{
            top: `${page.naturalTop * previewScale}px`,
            height: `${A4_PX_HEIGHT * previewScale}px`,
          }"
        />

        <div class="preview-page__content-layer">
          <div
            class="preview-page__scaler"
            :style="{
              transform: `scale(${previewScale})`,
              transformOrigin: 'top left',
              width: `${A4_PX_WIDTH}px`,
              height: `${previewNaturalHeight}px`,
            }"
          >
            <component :is="activeTemplate.component" ref="previewComponentRef" class="preview-page__content" />
          </div>
        </div>
      </div>
    </div>
  </div>

  <PdfMetadataPanel :open="showPdfSettings" @close="showPdfSettings = false" />
</template>

<script setup lang="ts">
import { ref, computed, watch, type CSSProperties } from 'vue'
import { useResizeObserver } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { usePdfMetaStore } from '@/stores/pdfMeta'
import { usePdfExport } from '@/composables/usePdfExport'
import { useLocaleStore } from '@/stores/locale'
import { evaluatePreviewPerformance } from '@/utils/performanceBudget'
import { A4_PX_HEIGHT, A4_PX_WIDTH, measurePagedLayout } from '@/utils/pagination'
import { RESUME_TEMPLATES, type ResumeTemplateId } from '@/utils/resumeTemplates'
import PdfMetadataPanel from '@/components/pdf/PdfMetadataPanel.vue'
import ExportPdfControls from '@/features/export-pdf/ExportPdfControls.vue'

const showPdfSettings = ref(false)
const selectedTemplateId = ref<ResumeTemplateId>('classic')
const activeTemplate = computed(() => RESUME_TEMPLATES.find((t) => t.id === selectedTemplateId.value) ?? RESUME_TEMPLATES[0])

const previewContainerEl = ref<HTMLElement | null>(null)
const previewComponentRef = ref<{ el: HTMLElement | null } | null>(null)
const previewScale = ref(1)
const previewNaturalHeight = ref(A4_PX_HEIGHT)
const previewPageStarts = ref([0])
const previewTallBlocks = ref(0)

useResizeObserver(previewContainerEl, ([entry]) => {
  previewScale.value = entry.contentRect.width / A4_PX_WIDTH
})

const previewEl = computed(() => previewComponentRef.value?.el ?? null)

useResizeObserver(previewEl, ([entry]) => {
  const layout = measurePagedLayout(entry.target as HTMLElement)
  previewNaturalHeight.value = layout.height
  previewPageStarts.value = layout.pageStarts
  previewTallBlocks.value = layout.tallBlocks
})

watch(
  previewEl,
  (element) => {
    const layout = measurePagedLayout(element)
    previewNaturalHeight.value = layout.height
    previewPageStarts.value = layout.pageStarts
    previewTallBlocks.value = layout.tallBlocks
  },
  { immediate: true }
)

const pageOffsets = computed(() =>
  previewPageStarts.value.map((naturalTop, index) => ({ index, naturalTop }))
)

const previewStageHeight = computed(() => {
  const lastPageStart = previewPageStarts.value[previewPageStarts.value.length - 1] ?? 0
  return Math.max(previewNaturalHeight.value, lastPageStart + A4_PX_HEIGHT)
})

const pageStyle = computed<CSSProperties>(() => ({
  width: `${A4_PX_WIDTH * previewScale.value}px`,
  height: `${previewStageHeight.value * previewScale.value}px`,
  margin: '0 auto',
  flexShrink: 0,
  position: 'relative',
}))

const { t } = useLocaleStore()

const previewPerformanceNotice = computed(() => {
  const issues = evaluatePreviewPerformance({
    height: previewNaturalHeight.value,
    pageStarts: previewPageStarts.value,
  })
  if (!issues.length) return ''
  const labels = issues.map((issue) => t(`builder.performanceIssue.${issue}`)).join(', ')
  return t('builder.performanceNotice', { issues: labels })
})

const pdfMetaStore = usePdfMetaStore()
const { meta } = storeToRefs(pdfMetaStore)
const { exportPdf, exporting } = usePdfExport(previewEl)

async function handleExport() {
  await exportPdf(meta.value)
}
</script>

<style scoped lang="scss">
.preview-wrap {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  min-height: 0;
}

.preview-container {
  position: relative;
  flex: 1;
  overflow-y: auto;
  padding: $sp-6 $sp-4 $sp-8;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 0;
  overscroll-behavior: contain;

  &::-webkit-scrollbar { width: 8px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: #9ca3af; border-radius: 4px; }
}

.preview-pages {
  position: relative;
}

.preview-page {
  &__sheet {
    position: absolute;
    left: 0;
    width: 100%;
    background: #fff;
    border-radius: 2px;
    box-shadow: 0 10px 30px rgba(15, 23, 42, 0.18);
    pointer-events: none;
  }

  &__content-layer {
    position: absolute;
    top: 0;
    left: 0;
  }

  &__scaler {
    position: relative;
    pointer-events: auto;
  }

  &__content {
    width: 210mm;
  }
}
</style>
