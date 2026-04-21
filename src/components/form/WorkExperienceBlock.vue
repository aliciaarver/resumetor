<template>
  <div class="block">
    <div class="block__header">
      <AppButton variant="danger" size="sm" @click="$emit('remove')">{{
        t('common.remove')
      }}</AppButton>
    </div>

    <div class="grid-2">
      <AppInput
        v-model="exp.company"
        :label="t('form.company')"
        :placeholder="t('form.companyPlaceholder')"
      />
      <AppInput v-model="exp.companyUrl" :label="t('form.companyUrl')" placeholder="https://..." />
    </div>

    <div class="grid-2">
      <AppInput
        v-model="exp.position"
        :label="t('form.position')"
        :placeholder="t('form.positionPlaceholder')"
      />
      <AppInput
        v-model="exp.location"
        :label="t('form.experienceLocation')"
        :placeholder="t('form.experienceLocationPlaceholder')"
      />
    </div>

    <div class="dates">
      <AppMonthField
        v-model="exp.fromMonth"
        class="dates__field"
        :label="t('common.from')"
        :placeholder="monthPlaceholder"
      />

      <AppMonthField
        v-model="exp.toMonth"
        class="dates__field"
        :label="t('common.to')"
        :placeholder="monthPlaceholder"
        :disabled="exp.isCurrent"
      />

      <label class="current-check">
        <input type="checkbox" v-model="exp.isCurrent" @change="onCurrentChange" />
        <span>{{ t('common.present') }}</span>
      </label>
    </div>

    <div class="tags-field">
      <label class="tags-field__label">{{ t('form.stack') }}</label>
      <div v-if="exp.skills.length" class="tags-field__list">
        <button
          v-for="(skill, skillIndex) in exp.skills"
          :key="`${exp.id}-${skill}-${skillIndex}`"
          type="button"
          class="tags-field__tag"
          @click="removeSkill(skillIndex)"
        >
          <span>{{ skill }}</span>
          <span aria-hidden="true">×</span>
        </button>
      </div>
      <AppInput
        v-model="skillDraft"
        :placeholder="t('form.stackPlaceholder')"
        @keydown.enter.prevent="commitSkills"
        @blur="commitSkills"
      />
    </div>

    <AppTextarea
      v-model="exp.description"
      :label="t('form.description')"
      :placeholder="t('form.workDescriptionPlaceholder')"
      :rows="4"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useLocaleStore } from '@/stores/locale'
import type { WorkExperience } from '@/types/resume'
import AppInput from '@/components/ui/AppInput.vue'
import AppMonthField from '@/components/ui/AppMonthField.vue'
import AppTextarea from '@/components/ui/AppTextarea.vue'
import AppButton from '@/components/ui/AppButton.vue'

const props = defineProps<{ exp: WorkExperience }>()
defineEmits<{ remove: [] }>()
const localeStore = useLocaleStore()
const { t } = localeStore
const monthPlaceholder = computed(() => t('common.monthPlaceholder'))
const skillDraft = ref('')

function onCurrentChange() {
  if (props.exp.isCurrent) props.exp.toMonth = ''
}

function commitSkills() {
  const nextSkills = skillDraft.value
    .split(/[,;|]+/g)
    .map((entry) => entry.trim())
    .filter(Boolean)

  if (!nextSkills.length) return

  const seen = new Set(props.exp.skills.map((skill) => skill.toLowerCase()))
  for (const skill of nextSkills) {
    const key = skill.toLowerCase()
    if (seen.has(key)) continue
    props.exp.skills.push(skill)
    seen.add(key)
  }

  skillDraft.value = ''
}

function removeSkill(index: number) {
  props.exp.skills.splice(index, 1)
}
</script>

<style scoped lang="scss">
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

.tags-field {
  display: flex;
  flex-direction: column;
  gap: $sp-2;

  &__label {
    font-size: 12px;
    font-weight: 500;
    color: $color-text-muted;
  }

  &__list {
    display: flex;
    flex-wrap: wrap;
    gap: $sp-2;
  }

  &__tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border-radius: 999px;
    background: rgba($color-primary, 0.1);
    color: $color-primary;
    font-size: 12px;
  }
}

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
