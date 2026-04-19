<template>
  <div class="field">
    <label v-if="label" class="field__label" :for="textareaId">{{ label }}</label>
    <textarea
      :id="textareaId"
      class="field__textarea"
      v-bind="$attrs"
      :value="modelValue"
      :placeholder="placeholder"
      :rows="rows"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />
  </div>
</template>

<script setup lang="ts">
import { useId } from 'vue'

defineOptions({ inheritAttrs: false })
const textareaId = useId()

withDefaults(defineProps<{
  modelValue: string
  label?: string
  placeholder?: string
  rows?: number
}>(), { rows: 4 })
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

  &__textarea {
    @include input-base;
    resize: vertical;
    min-height: 80px;
  }
}
</style>
