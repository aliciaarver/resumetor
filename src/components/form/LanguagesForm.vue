<template>
  <section class="section">
    <div class="section__header">
      <h2 class="section__title">{{ t('form.languages') }}</h2>
      <AppButton variant="ghost" size="sm" @click="addLanguage">{{ t('common.add') }}</AppButton>
    </div>

    <div v-if="data.languages.length" class="langs">
      <TransitionGroup name="list" tag="div" class="langs__list">
        <div v-for="lang in data.languages" :key="lang.id" class="lang-row">
          <AppInput v-model="lang.name" :placeholder="t('form.languagePlaceholder')" />
          <select v-model="lang.proficiency" class="select">
            <option
              v-for="option in proficiencyOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
          <button class="lang-row__remove" @click="removeLanguage(lang.id)" :title="t('common.remove')">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>

    <div v-else class="empty">{{ t('form.languagesEmpty') }}</div>
  </section>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useLocaleStore } from '@/stores/locale'
import { useResumeStore } from '@/stores/resume'
import AppInput from '@/components/ui/AppInput.vue'
import AppButton from '@/components/ui/AppButton.vue'

const store = useResumeStore()
const localeStore = useLocaleStore()
const { t } = localeStore
const { data } = storeToRefs(store)
const { proficiencyOptions } = storeToRefs(localeStore)
const { addLanguage, removeLanguage } = store
</script>

<style scoped lang="scss">
.section {
  display: flex;
  flex-direction: column;
  gap: $sp-4;

  &__header {
    @include flex-between;
  }

  &__title {
    font-size: 16px;
    font-weight: 600;
  }
}

.langs {
  &__list {
    display: flex;
    flex-direction: column;
    gap: $sp-2;
  }
}

.lang-row {
  display: grid;
  grid-template-columns: 1fr 160px 28px;
  gap: $sp-2;
  align-items: center;

  &__remove {
    @include flex-center;
    width: 28px;
    height: 28px;
    border-radius: $radius-sm;
    color: $color-text-muted;
    transition: color 0.15s, background 0.15s;

    &:hover {
      color: $color-danger;
      background: rgba($color-danger, 0.08);
    }
  }
}

.select {
  @include input-base;
  height: 36px;
  cursor: pointer;
}

.empty {
  font-size: 13px;
  color: $color-text-muted;
  text-align: center;
  padding: $sp-6;
  border: 1px dashed $color-border;
  border-radius: $radius-md;
}

.list-enter-active, .list-leave-active { transition: all 0.2s ease; }
.list-enter-from, .list-leave-to { opacity: 0; transform: translateY(-6px); }

@media (max-width: 720px) {
  .lang-row {
    grid-template-columns: 1fr;
  }

  .lang-row__remove {
    justify-self: end;
  }
}
</style>
