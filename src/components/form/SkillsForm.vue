<template>
  <section class="section">
    <div class="section__header">
      <h2 class="section__title">{{ t('form.skills') }}</h2>
      <AppButton variant="ghost" size="sm" @click="addSkill">{{ t('common.add') }}</AppButton>
    </div>

    <div v-if="data.skills.length" class="skills">
      <TransitionGroup name="list" tag="div" class="skills__list">
        <div v-for="skill in data.skills" :key="skill.id" class="skill-row">
          <AppInput v-model="skill.name" :placeholder="t('form.skillPlaceholder')" />
          <button
            class="skill-row__remove"
            @click="removeSkill(skill.id)"
            :title="t('common.remove')"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M1 1l12 12M13 1L1 13"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>

    <div v-else class="empty">{{ t('form.skillsEmpty') }}</div>
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
const { addSkill, removeSkill } = store
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

.skills {
  &__list {
    display: flex;
    flex-direction: column;
    gap: $sp-2;
  }
}

.skill-row {
  display: grid;
  grid-template-columns: 1fr 28px;
  gap: $sp-2;
  align-items: center;

  &__remove {
    @include flex-center;
    width: 28px;
    height: 28px;
    border-radius: $radius-sm;
    color: $color-text-muted;
    transition:
      color 0.15s,
      background 0.15s;

    &:hover {
      color: $color-danger;
      background: rgba($color-danger, 0.08);
    }
  }
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
  transition: all 0.2s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
