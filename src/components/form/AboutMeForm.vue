<template>
  <section class="section">
    <h2 class="section__title">{{ t('form.aboutMe') }}</h2>
    <WritingHint
      :field-value="data.aboutMe"
      :title="t('form.aboutHintTitle')"
      :example="t('form.aboutHintExample')"
      :checklist="aboutChecklist"
    />
    <AppTextarea
      v-model="data.aboutMe"
      :placeholder="t('form.aboutPlaceholder')"
      :rows="5"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useLocaleStore } from '@/stores/locale'
import { useResumeStore } from '@/stores/resume'
import AppTextarea from '@/components/ui/AppTextarea.vue'
import WritingHint from '@/components/ui/WritingHint.vue'

const store = useResumeStore()
const localeStore = useLocaleStore()
const { t } = localeStore
const { locale } = storeToRefs(localeStore)
const { data } = storeToRefs(store)

const CHECKLIST: Record<string, string[]> = {
  ru: [
    'Укажите специализацию и лет опыта',
    'Добавьте 1–2 конкретных достижения с цифрами',
    'Упомяните ключевые домены или технологии',
    'Оптимальная длина: 3–5 предложений',
  ],
  en: [
    'State your specialization and years of experience',
    'Add 1–2 specific achievements with numbers',
    'Mention key domains or technologies',
    'Ideal length: 3–5 sentences',
  ],
}

const aboutChecklist = computed(() => CHECKLIST[locale.value] ?? CHECKLIST.en)
</script>

<style scoped lang="scss">
.section {
  display: flex;
  flex-direction: column;
  gap: $sp-4;

  &__title {
    font-size: 16px;
    font-weight: 600;
  }
}
</style>
