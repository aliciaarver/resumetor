<template>
  <section class="section">
    <h2 class="section__title">{{ t('form.aboutMe') }}</h2>
    <AppTextarea
      v-model="data.aboutMe"
      :placeholder="t('form.aboutPlaceholder')"
      :rows="5"
    />
  </section>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useLocaleStore } from '@/stores/locale'
import { useResumeStore } from '@/stores/resume'
import AppTextarea from '@/components/ui/AppTextarea.vue'

const store = useResumeStore()
const localeStore = useLocaleStore()
const { t } = localeStore
const { data } = storeToRefs(store)
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
