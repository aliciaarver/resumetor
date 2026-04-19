<template>
  <div class="field" :class="{ 'field--error': error }">
    <label v-if="label" class="field__label" :for="inputId">{{ label }}</label>
    <input
      :id="inputId"
      class="field__input"
      v-bind="$attrs"
      :value="modelValue"
      :placeholder="placeholder"
      :type="type"
      :aria-invalid="error ? 'true' : undefined"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <span v-if="error" class="field__error">{{ error }}</span>
  </div>
</template>

<script setup lang="ts">
import { useId } from 'vue'

defineOptions({ inheritAttrs: false })
const inputId = useId()

withDefaults(defineProps<{
  modelValue: string
  label?: string
  placeholder?: string
  type?: string
  error?: string
}>(), { type: 'text' })
defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<style scoped lang="scss">
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

  &__error {
    font-size: 12px;
    color: $color-danger;
  }

  &--error &__input {
    border-color: $color-danger;
  }
}
</style>
