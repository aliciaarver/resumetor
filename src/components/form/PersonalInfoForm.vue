<template>
  <section class="section">
    <h2 class="section__title">{{ t('form.personalInfo') }}</h2>

    <div class="grid-3">
      <AppInput v-model="data.personal.lastName" :label="t('form.lastName')" :placeholder="t('form.lastNamePlaceholder')" />
      <AppInput v-model="data.personal.firstName" :label="t('form.firstName')" :placeholder="t('form.firstNamePlaceholder')" />
      <AppInput v-model="data.personal.middleName" :label="t('form.middleName')" :placeholder="t('form.middleNamePlaceholder')" />
    </div>

    <div class="grid-2">
      <AppInput v-model="data.personal.phone" :label="t('form.phone')" placeholder="+7 999 123-45-67" type="tel" />
      <AppInput
        v-model="data.personal.position"
        :label="t('form.desiredPosition')"
        :placeholder="t('form.desiredPositionPlaceholder')"
      />
    </div>

    <div class="grid-2">
      <AppInput v-model="data.personal.location" :label="t('form.location')" :placeholder="t('form.locationPlaceholder')" />
      <AppInput v-model="data.personal.citizenship" :label="t('form.citizenship')" :placeholder="t('form.citizenshipPlaceholder')" />
    </div>

    <div class="grid-3">
      <AppInput v-model="data.personal.workPermit" :label="t('form.workPermit')" :placeholder="t('form.workPermitPlaceholder')" />
      <AppInput v-model="data.personal.gender" :label="t('form.gender')" :placeholder="t('form.genderPlaceholder')" />
      <AppInput v-model="data.personal.age" :label="t('form.age')" :placeholder="t('form.agePlaceholder')" />
    </div>

    <div class="grid-2">
      <div class="field">
        <label class="field__label" for="birth-date">{{ t('form.birthDate') }}</label>
        <input id="birth-date" v-model="data.personal.birthDate" class="field__input" type="date" />
      </div>

      <div class="photo-field">
        <label class="field__label">{{ t('form.photo') }}</label>
        <div class="photo-field__controls">
          <input ref="photoInputEl" class="photo-field__input" type="file" accept="image/*" @change="onPhotoChange" />
          <AppButton variant="secondary" size="sm" @click="openPhotoPicker">{{ t('form.photoUpload') }}</AppButton>
          <AppButton v-if="data.personal.photo" variant="ghost" size="sm" @click="removePhoto">{{ t('form.photoRemove') }}</AppButton>
        </div>
        <img v-if="data.personal.photo" :src="data.personal.photo" alt="" class="photo-field__preview" />
      </div>
    </div>

    <div class="field">
      <label class="field__label">{{ t('form.workFormats') }}</label>
      <div class="format-picker">
        <select v-model="selectedWorkFormat" class="format-picker__select" @change="addWorkFormat">
          <option value="">{{ t('form.workFormatPlaceholder') }}</option>
          <option v-for="option in workFormatOptions" :key="option" :value="option">{{ option }}</option>
        </select>
        <div v-if="data.personal.workFormats.length" class="tags">
          <button
            v-for="(format, index) in data.personal.workFormats"
            :key="`${format}-${index}`"
            type="button"
            class="tags__item"
            @click="removeWorkFormat(index)"
          >
            <span>{{ format }}</span>
            <span aria-hidden="true">×</span>
          </button>
        </div>
      </div>
    </div>

    <div class="links">
      <div class="links__header">
        <AppButton variant="ghost" size="sm" @click="addSocialLink">{{ t('form.addLink') }}</AppButton>
      </div>

      <TransitionGroup name="list" tag="div" class="links__list">
        <div v-for="link in data.personal.links" :key="link.id" class="link-row">
          <select
            class="link-row__type"
            :value="normalizeSocialLinkLabel(link.label)"
            @change="link.label = ($event.target as HTMLSelectElement).value"
          >
            <option v-for="option in socialLinkOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
          <AppInput
            v-model="link.url"
            :placeholder="linkUrlPlaceholder(link.label)"
            :type="normalizeSocialLinkLabel(link.label) === 'Email' ? 'email' : 'url'"
          />
          <button class="link-row__remove" @click="removeSocialLink(link.id)" :title="t('common.remove')">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useLocaleStore } from '@/stores/locale'
import { useResumeStore } from '@/stores/resume'
import { normalizeSocialLinkLabel } from '@/utils/socialLinks'
import AppInput from '@/components/ui/AppInput.vue'
import AppButton from '@/components/ui/AppButton.vue'

const store = useResumeStore()
const localeStore = useLocaleStore()
const { t } = localeStore
const { data } = storeToRefs(store)
const { socialLinkOptions, locale } = storeToRefs(localeStore)
const { addSocialLink, removeSocialLink } = store

const photoInputEl = ref<HTMLInputElement | null>(null)
const selectedWorkFormat = ref('')

const RU_WORK_FORMATS = ['Удалённо', 'Гибрид', 'Офис', 'Проектная работа', 'Частичная занятость', 'Полная занятость']
const EN_WORK_FORMATS = ['Remote', 'Hybrid', 'On-site', 'Contract', 'Part-time', 'Full-time']

const workFormatOptions = ref<string[]>([])

watch(
  () => locale.value,
  (nextLocale) => {
    workFormatOptions.value = nextLocale === 'ru' ? RU_WORK_FORMATS : EN_WORK_FORMATS
  },
  { immediate: true },
)

watch(
  () => [data.value.personal.lastName, data.value.personal.firstName, data.value.personal.middleName],
  () => {
    data.value.personal.fullName = [
      data.value.personal.lastName,
      data.value.personal.firstName,
      data.value.personal.middleName,
    ].map((value) => value.trim()).filter(Boolean).join(' ')
  },
  { immediate: true },
)

function linkUrlPlaceholder(label: string) {
  switch (normalizeSocialLinkLabel(label)) {
    case 'Email':
      return 'name@example.com'
    case 'LinkedIn':
      return 'https://linkedin.com/in/...'
    case 'Telegram':
      return 'https://t.me/...'
    case 'GitHub':
      return 'https://github.com/...'
    default:
      return 'https://...'
  }
}

function addWorkFormat() {
  const value = selectedWorkFormat.value.trim()
  if (!value) return
  if (!data.value.personal.workFormats.includes(value)) {
    data.value.personal.workFormats.push(value)
  }
  selectedWorkFormat.value = ''
}

function removeWorkFormat(index: number) {
  data.value.personal.workFormats.splice(index, 1)
}

function openPhotoPicker() {
  photoInputEl.value?.click()
}

function removePhoto() {
  data.value.personal.photo = ''
  if (photoInputEl.value) {
    photoInputEl.value.value = ''
  }
}

function onPhotoChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    data.value.personal.photo = typeof reader.result === 'string' ? reader.result : ''
  }
  reader.readAsDataURL(file)
}
</script>

<style scoped lang="scss">
.section {
  display: flex;
  flex-direction: column;
  gap: $sp-4;

  &__title {
    font-size: 16px;
    font-weight: 600;
    color: $color-text;
  }
}

.grid-2,
.grid-3 {
  display: grid;
  gap: $sp-4;
}

.grid-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.grid-3 {
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
}

.field {
  display: flex;
  flex-direction: column;
  gap: 5px;

  &__label {
    font-size: 12px;
    font-weight: 500;
    color: $color-text-muted;
  }

  &__input {
    @include input-base;
  }
}

.photo-field {
  display: flex;
  flex-direction: column;
  gap: $sp-2;

  &__controls {
    display: flex;
    gap: $sp-2;
    flex-wrap: wrap;
  }

  &__input {
    display: none;
  }

  &__preview {
    width: 88px;
    height: 88px;
    object-fit: cover;
    border-radius: $radius-md;
    border: 1px solid $color-border;
  }
}

.format-picker {
  display: flex;
  flex-direction: column;
  gap: $sp-2;

  &__select {
    @include input-base;
    cursor: pointer;
  }
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: $sp-2;

  &__item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 9px;
    border-radius: 999px;
    background: rgba($color-primary, 0.08);
    color: $color-primary;
    font-size: 12px;
  }
}

.links {
  &__header {
    display: flex;
    justify-content: flex-end;
    margin-bottom: $sp-3;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: $sp-2;
  }
}

.link-row {
  display: grid;
  grid-template-columns: 160px 1fr 28px;
  gap: $sp-2;
  align-items: center;

  &__type {
    @include input-base;
    height: 36px;
    cursor: pointer;
  }

  &__remove {
    @include flex-center;
    width: 28px;
    height: 28px;
    border-radius: $radius-sm;
    color: $color-text-muted;

    &:hover {
      color: $color-danger;
      background: rgba($color-danger, 0.08);
    }
  }
}

@media (max-width: 720px) {
  .grid-2,
  .grid-3,
  .link-row {
    grid-template-columns: 1fr;
  }

  .link-row__remove {
    justify-self: end;
  }
}

.list-enter-active,
.list-leave-active {
  transition: all 0.2s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
