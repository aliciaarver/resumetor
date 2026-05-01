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
      <ResumeForm />
    </aside>

    <main
      id="builder-panel-preview"
      class="builder__preview"
      role="tabpanel"
      aria-labelledby="builder-tab-preview"
      :aria-hidden="activeTab !== 'preview' ? 'true' : 'false'"
      :class="{ 'builder__preview--visible': activeTab === 'preview' }"
    >
      <ResumePreview />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useLocaleStore } from '@/stores/locale'
import { useResumeStore } from '@/stores/resume'
import { usePdfMetaStore } from '@/stores/pdfMeta'
import ResumeForm from '@/widgets/resume-form/ResumeForm.vue'
import ResumePreview from '@/widgets/resume-preview/ResumePreview.vue'

const activeTab = ref<'edit' | 'preview'>('edit')

const localeStore = useLocaleStore()
const { locale } = storeToRefs(localeStore)
const { t } = localeStore

const resumeStore = useResumeStore()
const pdfMetaStore = usePdfMetaStore()

watch(locale, (nextLocale, previousLocale) => {
  if (!previousLocale) return
  if (resumeStore.localizeDemoResume(nextLocale)) {
    pdfMetaStore.resetMeta()
  }
})

onMounted(() => {
  pdfMetaStore.syncFromResume()
})
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
</style>
