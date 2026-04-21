<template>
  <button
    class="btn"
    :class="[`btn--${variant}`, { 'btn--sm': size === 'sm', 'btn--loading': loading }]"
    :type="type"
    :disabled="disabled || loading"
    v-bind="$attrs"
  >
    <span v-if="loading" class="btn__spinner" />
    <slot />
  </button>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    size?: 'sm' | 'md'
    loading?: boolean
    disabled?: boolean
    type?: 'button' | 'submit' | 'reset'
  }>(),
  { variant: 'primary', size: 'md', type: 'button' },
)
</script>

<style scoped lang="scss">
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: $sp-2;
  font-size: 14px;
  font-weight: 500;
  border-radius: $radius-sm;
  padding: 8px 16px;
  transition:
    background 0.15s,
    color 0.15s,
    opacity 0.15s;
  white-space: nowrap;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &--sm {
    font-size: 12px;
    padding: 5px 10px;
  }

  &--primary {
    background: $color-primary;
    color: #fff;
    &:hover:not(:disabled) {
      background: $color-primary-hover;
    }
  }

  &--secondary {
    background: $color-border;
    color: $color-text;
    &:hover:not(:disabled) {
      background: #d0d6e0;
    }
  }

  &--ghost {
    background: transparent;
    color: $color-primary;
    &:hover:not(:disabled) {
      background: rgba($color-primary, 0.08);
    }
  }

  &--danger {
    background: transparent;
    color: $color-danger;
    &:hover:not(:disabled) {
      background: rgba($color-danger, 0.08);
    }
  }

  &__spinner {
    width: 14px;
    height: 14px;
    border: 2px solid currentColor;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
