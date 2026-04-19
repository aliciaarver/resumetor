<template>
  <section class="section">
    <div class="section__header">
      <h2 class="section__title">{{ t('form.education') }}</h2>
      <AppButton variant="ghost" size="sm" @click="addEducation">{{ t('common.add') }}</AppButton>
    </div>

    <TransitionGroup v-if="data.education.length" name="list" tag="div" class="list">
      <div v-for="edu in data.education" :key="edu.id" class="block">
        <div class="block__header">
          <AppButton variant="danger" size="sm" @click="removeEducation(edu.id)">{{ t('common.remove') }}</AppButton>
        </div>

        <AppInput v-model="edu.institution" :label="t('form.institution')" :placeholder="t('form.institutionPlaceholder')" />

        <div class="grid-2">
          <AppInput v-model="edu.degree" :label="t('form.degree')" :placeholder="t('form.degreePlaceholder')" />
          <AppInput v-model="edu.field" :label="t('form.fieldOfStudy')" :placeholder="t('form.fieldOfStudyPlaceholder')" />
        </div>

        <div class="dates">
          <AppMonthField
            v-model="edu.fromMonth"
            class="dates__field"
            :label="t('common.from')"
            :placeholder="monthPlaceholder"
          />
          <AppMonthField
            v-model="edu.toMonth"
            class="dates__field"
            :label="t('common.to')"
            :placeholder="monthPlaceholder"
            :disabled="edu.isCurrent"
          />
          <label class="current-check">
            <input type="checkbox" v-model="edu.isCurrent" @change="edu.isCurrent && (edu.toMonth = '')" />
            <span>{{ t('common.present') }}</span>
          </label>
        </div>
      </div>
    </TransitionGroup>

  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useLocaleStore } from '@/stores/locale'
import { useResumeStore } from '@/stores/resume'
import AppInput from '@/components/ui/AppInput.vue'
import AppMonthField from '@/components/ui/AppMonthField.vue'
import AppButton from '@/components/ui/AppButton.vue'

const store = useResumeStore()
const localeStore = useLocaleStore()
const { t } = localeStore
const monthPlaceholder = computed(() => t('common.monthPlaceholder'))
const { data } = storeToRefs(store)
const { addEducation, removeEducation } = store
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

.block {
  @include card;
  display: flex;
  flex-direction: column;
  gap: $sp-4;

  &__header {
    display: flex;
    justify-content: flex-end;
  }
}

.grid-2 {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: $sp-4;

  > * {
    min-width: 0;
  }
}

.dates {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: $sp-4;
}

.current-check {
  display: flex;
  align-items: center;
  gap: $sp-2;
  grid-column: 2;
  justify-self: start;
  font-size: 13px;
  cursor: pointer;
  white-space: normal;

  input[type='checkbox'] {
    width: 16px;
    height: 16px;
    accent-color: $color-primary;
    cursor: pointer;
  }
}

.list-enter-active, .list-leave-active { transition: all 0.25s ease; }
.list-enter-from, .list-leave-to { opacity: 0; transform: translateY(-8px); }

@media (max-width: 720px) {
  .grid-2,
  .dates {
    grid-template-columns: 1fr;
  }

  .current-check {
    grid-column: 1;
  }
}
</style>
