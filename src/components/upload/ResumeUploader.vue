<template>
  <div class="uploader-stack" v-bind="$attrs">
    <div
      class="uploader"
      :class="{ 'uploader--over': isOver, 'uploader--parsing': parsing }"
      role="button"
      :tabindex="parsing ? -1 : 0"
      :aria-busy="parsing ? 'true' : 'false'"
      @dragover.prevent="isOver = true"
      @dragleave.prevent="isOver = false"
      @drop.prevent="onDrop"
      @click="open"
      @keydown.enter.prevent="open"
      @keydown.space.prevent="open"
    >
      <input
        ref="inputEl"
        type="file"
        accept=".pdf,application/pdf"
        class="uploader__input"
        @change="onFileChange"
      />

      <template v-if="!parsing">
        <svg
          class="uploader__icon"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 12V4M8 8l4-4 4 4"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <p class="uploader__text">
          {{ t('upload.dropPrefix') }}<span class="uploader__link">{{ t('upload.browse') }}</span>
        </p>
        <p class="uploader__hint">{{ t('upload.hint') }}</p>
      </template>

      <template v-else>
        <div class="uploader__spinner" />
        <p class="uploader__text">{{ t('upload.parsing') }}</p>
      </template>

      <p v-if="uploadError || parseError" class="uploader__error" @click.stop>
        {{ uploadError || parseError }}
      </p>
      <p v-if="success" class="uploader__success" @click.stop>
        {{ t('upload.success') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useResumeParser } from '@/composables/useResumeParser'
import { useLocaleStore } from '@/stores/locale'
import { usePdfMetaStore } from '@/stores/pdfMeta'
import { useResumeStore } from '@/stores/resume'

defineOptions({ inheritAttrs: false })

const { parseFile, parsing, error: parseError } = useResumeParser()
const localeStore = useLocaleStore()
const { t } = localeStore
const pdfMetaStore = usePdfMetaStore()
const store = useResumeStore()

const isOver = ref(false)
const success = ref(false)
const inputEl = ref<HTMLInputElement | null>(null)
const uploadError = ref<string | null>(null)

function open() {
  inputEl.value?.click()
}

async function handleFile(file: File) {
  success.value = false
  uploadError.value = null
  try {
    const result = await parseFile(file)
    if (result) {
      store.hydrateFromParsed(result.resume)
      pdfMetaStore.hydrateFromParsed(result.pdfMeta)
      success.value = true
      setTimeout(() => (success.value = false), 5000)
    }
  } catch (error) {
    uploadError.value = error instanceof Error ? error.message : t('parser.failedToParse')
  } finally {
    if (inputEl.value) {
      inputEl.value.value = ''
    }
  }
}

function onDrop(e: DragEvent) {
  isOver.value = false
  const file = e.dataTransfer?.files[0]
  if (file) handleFile(file)
}

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) handleFile(file)
}
</script>

<style scoped lang="scss">
.uploader-stack {
  display: flex;
  flex-direction: column;
  gap: $sp-3;
}

.uploader {
  position: relative;
  border: 2px dashed $color-border;
  border-radius: $radius-md;
  padding: $sp-5;
  text-align: center;
  cursor: pointer;
  transition:
    border-color 0.2s,
    background 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $sp-2;

  &:hover,
  &--over {
    border-color: $color-primary;
    background: rgba($color-primary, 0.03);
  }

  &--parsing {
    cursor: default;
    pointer-events: none;
  }

  &__input {
    display: none;
  }

  &__icon {
    color: $color-text-muted;
    margin-bottom: $sp-1;
  }

  &__text {
    font-size: 14px;
    font-weight: 500;
    color: $color-text;
  }

  &__link {
    color: $color-primary;
    text-decoration: underline;
  }

  &__hint {
    font-size: 12px;
    color: $color-text-muted;
  }

  &__spinner {
    width: 28px;
    height: 28px;
    border: 3px solid $color-border;
    border-top-color: $color-primary;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  &__error {
    font-size: 12px;
    color: $color-danger;
    cursor: text;
  }

  &__success {
    font-size: 12px;
    color: $color-success;
    cursor: text;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
