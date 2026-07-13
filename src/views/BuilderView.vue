<template>
  <div class="builder">
    <div class="tab-bar" role="tablist" :aria-label="t('builder.tabListLabel')">
      <button
        class="tab-bar__btn"
        type="button"
        role="tab"
        id="builder-tab-edit"
        :class="{ 'tab-bar__btn--active': activeTab === 'edit' }"
        :aria-selected="activeTab === 'edit' ? 'true' : 'false'"
        aria-controls="builder-panel-edit"
        @click="activeTab = 'edit'"
      >{{ t('builder.editTab') }}</button>
      <button
        class="tab-bar__btn"
        type="button"
        role="tab"
        id="builder-tab-preview"
        :class="{ 'tab-bar__btn--active': activeTab === 'preview' }"
        :aria-selected="activeTab === 'preview' ? 'true' : 'false'"
        aria-controls="builder-panel-preview"
        @click="activeTab = 'preview'"
      >{{ t('builder.previewTab') }}</button>
    </div>

    <aside
      id="builder-panel-edit"
      class="builder__form"
      role="tabpanel"
      aria-labelledby="builder-tab-edit"
      :aria-hidden="activeTab !== 'edit' ? 'true' : 'false'"
      :class="{ 'builder__form--visible': activeTab === 'edit' }"
    >
      <div class="form-scroll">
        <div class="form-header">
          <h1 class="form-header__logo">Resumetor</h1>
          <div class="form-header__actions">
            <div class="locale-switch" :aria-label="t('locale.switchLabel')" :title="t('locale.switchLabel')">
              <button
                v-for="option in locales"
                :key="option"
                type="button"
                class="locale-switch__btn"
                :class="{ 'locale-switch__btn--active': locale === option }"
                @click="setLocale(option)"
              >
                {{ option.toUpperCase() }}
              </button>
            </div>
            <AppButton variant="ghost" size="sm" @click="confirmReset">{{ t('builder.reset') }}</AppButton>
          </div>
        </div>

        <ResumeUploader class="uploader-section" />

        <div class="form-sections">
          <PersonalInfoForm />
          <div class="divider" />
          <AboutMeForm />
          <div class="divider" />
          <WorkExperienceForm />
          <div class="divider" />
          <EducationForm />
          <div class="divider" />
          <SkillsForm />
          <div class="divider" />
          <LanguagesForm />
          <div class="divider" />
          <ProjectsForm />
        </div>
      </div>
    </aside>

    <main
      id="builder-panel-preview"
      class="builder__preview"
      role="tabpanel"
      aria-labelledby="builder-tab-preview"
      :aria-hidden="activeTab !== 'preview' ? 'true' : 'false'"
      :class="{ 'builder__preview--visible': activeTab === 'preview' }"
    >
        <div class="preview-wrap">
          <div class="preview-actions">
          <div class="template-picker">
            <span class="template-picker__label">{{ t('builder.templateLabel') }}</span>
            <select
              class="template-picker__select"
              :value="selectedTemplateId"
              @change="selectedTemplateId = ($event.target as HTMLSelectElement).value as ResumeTemplateId"
            >
              <option v-for="tmpl in RESUME_TEMPLATES" :key="tmpl.id" :value="tmpl.id">
                {{ t(tmpl.labelKey) }}
              </option>
            </select>
          </div>
          <AppButton variant="primary" :loading="exporting" @click="handleExport">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 3v12M7 11l5 5 5-5M4 21h16" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            {{ t('builder.downloadPdf') }}
          </AppButton>
          <AppButton variant="secondary" @click="showPdfSettings = !showPdfSettings">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14" stroke-linecap="round"/>
            </svg>
            {{ t('builder.pdfSettings') }}
          </AppButton>
          <p v-if="previewPerformanceNotice" class="preview-actions__note" role="status" aria-live="polite">
            {{ previewPerformanceNotice }}
          </p>
          <p v-if="previewTallBlocks > 0" class="preview-actions__note preview-actions__note--warn" role="status" aria-live="polite">
            {{ t('builder.tallBlockWarning', { count: previewTallBlocks }) }}
          </p>
        </div>

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
    </main>
  </div>

  <PdfMetadataPanel :open="showPdfSettings" @close="showPdfSettings = false" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, type CSSProperties } from 'vue'
import { useResizeObserver } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { usePdfMetaStore } from '@/stores/pdfMeta'
import { usePdfExport } from '@/composables/usePdfExport'
import { useLocaleStore } from '@/stores/locale'
import { useResumeStore } from '@/stores/resume'
import { evaluatePreviewPerformance } from '@/utils/performanceBudget'
import {
  A4_PX_HEIGHT,
  A4_PX_WIDTH,
  measurePagedLayout,
} from '@/utils/pagination'
import PdfMetadataPanel from '@/components/pdf/PdfMetadataPanel.vue'
import { RESUME_TEMPLATES, type ResumeTemplateId } from '@/utils/resumeTemplates'
import ResumeUploader from '@/components/upload/ResumeUploader.vue'
import PersonalInfoForm from '@/components/form/PersonalInfoForm.vue'
import AboutMeForm from '@/components/form/AboutMeForm.vue'
import WorkExperienceForm from '@/components/form/WorkExperienceForm.vue'
import EducationForm from '@/components/form/EducationForm.vue'
import SkillsForm from '@/components/form/SkillsForm.vue'
import LanguagesForm from '@/components/form/LanguagesForm.vue'
import ProjectsForm from '@/components/form/ProjectsForm.vue'
import AppButton from '@/components/ui/AppButton.vue'

const activeTab = ref<'edit' | 'preview'>('edit')
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
  const containerWidth = entry.contentRect.width
  previewScale.value = containerWidth / A4_PX_WIDTH
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
  previewPageStarts.value.map((naturalTop, index) => ({
    index,
    naturalTop,
  }))
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

const previewPerformanceNotice = computed(() => {
  const issues = evaluatePreviewPerformance({
    height: previewNaturalHeight.value,
    pageStarts: previewPageStarts.value,
    tallBlocks: previewTallBlocks.value,
  })

  if (!issues.length) return ''

  const labels = issues.map((issue) => t(`builder.performanceIssue.${issue}`)).join(', ')
  return t('builder.performanceNotice', { issues: labels })
})

const pdfMetaStore = usePdfMetaStore()
const { meta } = storeToRefs(pdfMetaStore)
const { exportPdf, exporting } = usePdfExport(previewEl)

const localeStore = useLocaleStore()
const { locale } = storeToRefs(localeStore)
const { locales, t, setLocale } = localeStore

const resumeStore = useResumeStore()

watch(locale, (nextLocale, previousLocale) => {
  if (!previousLocale) return

  if (resumeStore.localizeDemoResume(nextLocale)) {
    pdfMetaStore.resetMeta()
  }
})

onMounted(() => {
  pdfMetaStore.syncFromResume()
})

async function handleExport() {
  await exportPdf(meta.value)
}

function confirmReset() {
  if (confirm(t('builder.confirmReset'))) {
    resumeStore.resetResume(locale.value)
    pdfMetaStore.resetMeta()
  }
}
</script>

<style scoped lang="scss">
.builder {
  display: flex;
  height: 100dvh;
  min-height: 100svh;
  overflow: hidden;

  @media (max-width: 899px) {
    flex-direction: column;
  }
}

.tab-bar {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  background: $color-surface;
  border-bottom: 1px solid $color-border;
  height: 48px;

  @media (max-width: 899px) {
    display: flex;
  }

  &__btn {
    flex: 1;
    font-size: 14px;
    font-weight: 500;
    color: $color-text-muted;
    transition: color 0.15s;

    &--active {
      color: $color-primary;
      border-bottom: 2px solid $color-primary;
    }
  }
}

.builder__form {
  width: $sidebar-width;
  flex-shrink: 0;
  height: 100%;
  overflow: hidden;
  background: $color-bg;
  border-right: 1px solid $color-border;

  @media (max-width: 899px) {
    width: 100%;
    height: auto;
    position: fixed;
    top: 48px;
    left: 0;
    bottom: 0;
    display: none;
    overscroll-behavior: contain;

    &--visible {
      display: block;
    }
  }
}

.form-scroll {
  height: 100%;
  overflow-y: auto;
  padding: $sp-5 $sp-5 $sp-8;
  display: flex;
  flex-direction: column;
  gap: $sp-5;
  overscroll-behavior: contain;

  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: $color-border; border-radius: 3px; }
}

.form-header {
  @include flex-between;

  &__logo {
    font-size: 18px;
    font-weight: 700;
    color: $color-primary;
    letter-spacing: -0.03em;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: $sp-2;
  }
}

.locale-switch {
  display: inline-flex;
  align-items: center;
  padding: 2px;
  background: rgba($color-primary, 0.08);
  border-radius: $radius-sm;

  &__btn {
    min-width: 38px;
    height: 28px;
    border-radius: calc(#{$radius-sm} - 2px);
    font-size: 12px;
    font-weight: 700;
    color: $color-text-muted;
    transition: background 0.15s, color 0.15s;

    &--active {
      background: $color-surface;
      color: $color-primary;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08);
    }
  }
}

.uploader-section {
  flex-shrink: 0;
}

.form-sections {
  display: flex;
  flex-direction: column;
  gap: $sp-5;
}

.divider {
  height: 1px;
  background: $color-border;
}

.builder__preview {
  flex: 1;
  overflow: hidden;
  background: #d1d5db;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;

  @media (max-width: 899px) {
    position: fixed;
    top: 48px;
    left: 0;
    right: 0;
    bottom: 0;
    display: none;
    min-height: auto;
    overscroll-behavior: contain;

    &--visible {
      display: flex;
    }
  }
}

.preview-wrap {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  min-height: 0;
}

.preview-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: $sp-3;
  padding: $sp-3 $sp-4;
  background: $color-surface;
  border-bottom: 1px solid $color-border;
  flex-shrink: 0;

  &__note {
    margin: 0 0 0 auto;
    font-size: 12px;
    color: $color-text-muted;

    &--warn {
      color: #b45309;
    }
  }
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

.template-picker {
  display: inline-flex;
  align-items: center;
  gap: $sp-2;
  min-height: 36px;

  &__label {
    font-size: 12px;
    color: $color-text-muted;
    font-weight: 600;
    white-space: nowrap;
  }

  &__select {
    min-width: 148px;
    height: 36px;
    border: 1px solid $color-border;
    border-radius: $radius-sm;
    background: $color-surface;
    color: $color-text;
    padding: 0 12px;
  }
}
</style>
