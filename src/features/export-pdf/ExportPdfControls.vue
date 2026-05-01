<template>
  <div class="preview-actions">
    <div class="template-picker">
      <span class="template-picker__label">{{ t('builder.templateLabel') }}</span>
      <select
        class="template-picker__select"
        :value="selectedTemplateId"
        @change="emit('update:selectedTemplateId', ($event.target as HTMLSelectElement).value as ResumeTemplateId)"
      >
        <option v-for="tmpl in RESUME_TEMPLATES" :key="tmpl.id" :value="tmpl.id">
          {{ t(tmpl.labelKey) }}
        </option>
      </select>
    </div>

    <AppButton variant="primary" :loading="exporting" @click="emit('export')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 3v12M7 11l5 5 5-5M4 21h16" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      {{ t('builder.downloadPdf') }}
    </AppButton>

    <AppButton variant="secondary" @click="emit('toggle-settings')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14" stroke-linecap="round"/>
      </svg>
      {{ t('builder.pdfSettings') }}
    </AppButton>

    <p v-if="performanceNotice" class="preview-actions__note" role="status" aria-live="polite">
      {{ performanceNotice }}
    </p>
    <p v-if="tallBlocks > 0" class="preview-actions__note preview-actions__note--warn" role="status" aria-live="polite">
      {{ t('builder.tallBlockWarning', { count: tallBlocks }) }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { useLocaleStore } from '@/stores/locale'
import { RESUME_TEMPLATES, type ResumeTemplateId } from '@/utils/resumeTemplates'
import AppButton from '@/components/ui/AppButton.vue'

defineProps<{
  selectedTemplateId: ResumeTemplateId
  exporting: boolean
  performanceNotice: string
  tallBlocks: number
}>()

const emit = defineEmits<{
  'update:selectedTemplateId': [value: ResumeTemplateId]
  'export': []
  'toggle-settings': []
}>()

const { t } = useLocaleStore()
</script>

<style scoped lang="scss">
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
