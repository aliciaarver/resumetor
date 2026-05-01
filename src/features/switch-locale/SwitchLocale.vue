<template>
  <div class="locale-switch" :aria-label="t('locale.switchLabel')" :title="t('locale.switchLabel')">
    <button
      v-for="option in locales"
      :key="option"
      type="button"
      class="locale-switch__btn"
      :class="{ 'locale-switch__btn--active': locale === option }"
      @click="setLocale(option)"
    >
      {{ option.toUpperCase() }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useLocaleStore } from '@/stores/locale'

const localeStore = useLocaleStore()
const { locale } = storeToRefs(localeStore)
const { locales, t, setLocale } = localeStore
</script>

<style scoped lang="scss">
.locale-switch {
  display: inline-flex;
  align-items: center;
  padding: 2px;
  background: rgba($color-primary, 0.08);
  border-radius: $radius-sm;

  &__btn {
    min-width: 38px;
    height: 28px;
    border-radius: calc(#{$radius-sm} - 2px);
    font-size: 12px;
    font-weight: 700;
    color: $color-text-muted;
    transition: background 0.15s, color 0.15s;

    &--active {
      background: $color-surface;
      color: $color-primary;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08);
    }
  }
}
</style>
