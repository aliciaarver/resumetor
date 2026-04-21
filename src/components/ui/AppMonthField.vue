<template>
  <div class="month-field">
    <label v-if="label" class="month-field__label" :for="inputId">{{ label }}</label>
    <div class="month-field__control">
      <input
        :id="inputId"
        :class="['month-field__input', { 'month-field__input--empty': !modelValue }]"
        type="month"
        :value="modelValue"
        :disabled="disabled"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
      <span v-if="!modelValue && !disabled" class="month-field__placeholder">{{
        placeholder
      }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useId } from 'vue'

const inputId = useId()

withDefaults(
  defineProps<{
    modelValue: string
    label?: string
    placeholder: string
    disabled?: boolean
  }>(),
  {
    label: '',
    disabled: false,
  },
)

defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<style scoped lang="scss">
.month-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;

  &__label {
    font-size: 12px;
    font-weight: 500;
    color: $color-text-muted;
  }

  &__control {
    position: relative;
  }

  &__input {
    @include input-base;
    height: 36px;
    width: 100%;

    &--empty::-webkit-datetime-edit {
      color: transparent;
    }

    &--empty::-webkit-datetime-edit-fields-wrapper {
      color: transparent;
    }

    &--empty::-webkit-date-and-time-value {
      color: transparent;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  &__placeholder {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: $color-text-muted;
    pointer-events: none;
    font-size: 13px;
  }

  &__control:focus-within &__placeholder {
    opacity: 0;
  }
}
</style>
