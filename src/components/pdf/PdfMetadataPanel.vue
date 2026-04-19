<template>
  <div v-if="open" class="panel-layer">
    <button type="button" class="panel-layer__backdrop" aria-label="Close PDF settings" @click="$emit('close')" />

    <div class="panel" role="dialog" aria-modal="true" :aria-labelledby="titleId">
      <div class="panel__header">
        <span :id="titleId" class="panel__title">{{ t('pdf.settings') }}</span>
        <button type="button" class="panel__close" @click="$emit('close')">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <p class="panel__hint">
        {{ t('pdf.hint') }}
      </p>

      <div class="panel__fields">
        <AppInput v-model="meta.title" :label="t('pdf.title')" :placeholder="t('pdf.titlePlaceholder')" />
        <AppInput v-model="meta.author" :label="t('pdf.author')" :placeholder="t('pdf.authorPlaceholder')" />
        <AppTextarea
          v-model="meta.subject"
          :label="t('pdf.subject')"
          :placeholder="t('pdf.subjectPlaceholder')"
          :rows="3"
        />
        <div class="keywords-field">
          <label class="kw-label">{{ t('pdf.keywords') }}</label>
          <p class="kw-hint">{{ t('pdf.keywordsHint') }}</p>
          <input
            class="kw-input"
            v-model="meta.keywords"
            :placeholder="t('pdf.keywordsPlaceholder')"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useId } from 'vue'
import { storeToRefs } from 'pinia'
import { usePdfMetaStore } from '@/stores/pdfMeta'
import { useLocaleStore } from '@/stores/locale'
import AppInput from '@/components/ui/AppInput.vue'
import AppTextarea from '@/components/ui/AppTextarea.vue'

defineProps<{ open: boolean }>()
defineEmits<{ close: [] }>()

const pdfMetaStore = usePdfMetaStore()
const localeStore = useLocaleStore()
const { t } = localeStore
const { meta } = storeToRefs(pdfMetaStore)
const titleId = useId()
</script>

<style scoped lang="scss">
.panel-layer {
  position: fixed;
  inset: 0;
  z-index: 100;
  pointer-events: none;

  &__backdrop {
    position: absolute;
    inset: 0;
    background: rgba(15, 23, 42, 0.24);
    pointer-events: auto;
  }
}

.panel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: $color-surface;
  border-top: 1px solid $color-border;
  border-radius: $radius-lg $radius-lg 0 0;
  padding: $sp-5;
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.1);
  pointer-events: auto;
  max-height: 70vh;
  overflow-y: auto;

  @media (min-width: 900px) {
    left: auto;
    right: 24px;
    bottom: 24px;
    width: 440px;
    border-radius: $radius-lg;
    border: 1px solid $color-border;
  }

  &__header {
    @include flex-between;
    margin-bottom: $sp-3;
  }

  &__title {
    font-size: 15px;
    font-weight: 600;
  }

  &__close {
    @include flex-center;
    width: 32px;
    height: 32px;
    border-radius: $radius-sm;
    color: $color-text-muted;

    &:hover {
      color: $color-danger;
      background: rgba($color-danger, 0.08);
    }
  }

  &__hint {
    font-size: 12px;
    color: $color-text-muted;
    margin-bottom: $sp-4;
    line-height: 1.5;
  }

  &__fields {
    display: flex;
    flex-direction: column;
    gap: $sp-4;
  }
}

.kw-label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: $color-text-muted;
  margin-bottom: 4px;
}

.kw-hint {
  font-size: 11px;
  color: $color-text-muted;
  margin-bottom: 5px;
}

.kw-input {
  @include input-base;
}
</style>
