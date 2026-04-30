<template>
  <div v-if="visible" class="hint">
    <button type="button" class="hint__toggle" @click="expanded = !expanded">
      <span class="hint__icon">💡</span>
      <span class="hint__label">{{ title }}</span>
      <span class="hint__chevron" :class="{ 'hint__chevron--open': expanded }">▾</span>
    </button>

    <div v-if="expanded" class="hint__body">
      <p class="hint__example">{{ example }}</p>
      <ul class="hint__list">
        <li v-for="item in checklist" :key="item">{{ item }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  fieldValue: string
  title: string
  example: string
  checklist: string[]
}>()

const userExpanded = ref<boolean | null>(null)

const visible = computed(() => !props.fieldValue || userExpanded.value !== false)

const expanded = computed({
  get: () => {
    if (userExpanded.value !== null) return userExpanded.value
    return !props.fieldValue
  },
  set: (val: boolean) => {
    userExpanded.value = val
  },
})
</script>

<style scoped lang="scss">
.hint {
  border: 1px solid rgba($color-primary, 0.25);
  border-radius: 8px;
  background: rgba($color-primary, 0.04);
  overflow: hidden;

  &__toggle {
    display: flex;
    align-items: center;
    gap: $sp-2;
    width: 100%;
    padding: $sp-2 $sp-3;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 12px;
    color: $color-primary;
    text-align: left;

    &:hover {
      background: rgba($color-primary, 0.06);
    }
  }

  &__label {
    flex: 1;
    font-weight: 500;
  }

  &__icon {
    font-size: 13px;
  }

  &__chevron {
    font-size: 14px;
    transition: transform 0.2s;
    transform: rotate(-90deg);

    &--open {
      transform: rotate(0deg);
    }
  }

  &__body {
    padding: $sp-2 $sp-3 $sp-3;
    border-top: 1px solid rgba($color-primary, 0.15);
  }

  &__example {
    font-size: 12px;
    color: $color-text-muted;
    font-style: italic;
    margin: 0 0 $sp-2;
    line-height: 1.5;
  }

  &__list {
    margin: 0;
    padding-left: $sp-4;
    font-size: 12px;
    color: $color-text-muted;
    line-height: 1.7;

    li::marker {
      color: $color-primary;
    }
  }
}
</style>
