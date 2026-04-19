<template>
  <section class="section">
    <div class="section__header">
      <h2 class="section__title">{{ t('form.workExperience') }}</h2>
      <AppButton variant="ghost" size="sm" @click="addWorkExperience">{{ t('common.add') }}</AppButton>
    </div>

    <TransitionGroup v-if="data.workExperience.length" name="list" tag="div" class="list">
      <WorkExperienceBlock
        v-for="exp in data.workExperience"
        :key="exp.id"
        :exp="exp"
        @remove="removeWorkExperience(exp.id)"
      />
    </TransitionGroup>

    <div v-else class="empty">
      {{ t('form.workExperienceEmpty') }}
    </div>
  </section>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useLocaleStore } from '@/stores/locale'
import { useResumeStore } from '@/stores/resume'
import WorkExperienceBlock from './WorkExperienceBlock.vue'
import AppButton from '@/components/ui/AppButton.vue'

const store = useResumeStore()
const localeStore = useLocaleStore()
const { t } = localeStore
const { data } = storeToRefs(store)
const { addWorkExperience, removeWorkExperience } = store
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

.list {
  display: flex;
  flex-direction: column;
  gap: $sp-3;
}

.empty {
  font-size: 13px;
  color: $color-text-muted;
  text-align: center;
  padding: $sp-6;
  border: 1px dashed $color-border;
  border-radius: $radius-md;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.25s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
