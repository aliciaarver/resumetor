<template>
  <section v-if="review" class="review">
    <div class="review__header">
      <h3 class="review__title">{{ t('review.title') }}</h3>
    </div>

    <div class="review__list">
      <article
        v-for="block in review.blocks"
        :key="block.key"
        class="review__item"
        :class="`review__item--${block.confidence}`"
      >
        <div class="review__row">
          <div class="review__meta">
            <strong class="review__label">{{ block.label }}</strong>
            <span
              class="review__status"
              :class="block.imported ? 'review__status--ok' : 'review__status--hold'"
            >
              {{ block.imported ? t('review.imported') : t('review.heldBack') }}
            </span>
          </div>
          <div class="review__badges">
            <span class="review__badge"
              >{{ t('review.confidence') }}: {{ confidenceLabel(block.confidence) }}</span
            >
            <span class="review__badge">{{ Math.round(block.score * 100) }}%</span>
          </div>
        </div>

        <p class="review__note">{{ block.note }}</p>

        <details v-if="block.rawText && !block.imported" class="review__details">
          <summary>{{ t('review.rawText') }}</summary>
          <pre class="review__raw">{{ block.rawText }}</pre>
        </details>
      </article>
    </div>

    <section v-if="review.diff && review.diff.totalChanges > 0" class="review__diff">
      <div class="review__header">
        <h4 class="review__subtitle">{{ t('review.diffTitle') }}</h4>
        <span class="review__badge">{{
          t('review.diffChanged', { count: review.diff.totalChanges })
        }}</span>
      </div>

      <div class="review__list">
        <article
          v-for="block in changedDiffBlocks"
          :key="`diff-${block.key}`"
          class="review__item review__item--diff"
        >
          <div class="review__row">
            <div class="review__meta">
              <strong class="review__label">{{ t(`review.${block.key}`) }}</strong>
            </div>
            <div class="review__badges">
              <span v-if="block.addedCount" class="review__badge">{{
                t('review.diffAdded', { count: block.addedCount })
              }}</span>
              <span v-if="block.removedCount" class="review__badge">{{
                t('review.diffRemoved', { count: block.removedCount })
              }}</span>
              <span class="review__badge">{{
                t('review.diffChanged', { count: block.changeCount })
              }}</span>
            </div>
          </div>
        </article>
      </div>
    </section>

    <details
      v-if="review.hasWarnings && review.rawText.trim()"
      class="review__details review__details--full"
    >
      <summary>{{ t('review.fullRawText') }}</summary>
      <pre class="review__raw review__raw--full">{{ review.rawText }}</pre>
    </details>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ParseConfidenceLevel, ParseReview } from '@/composables/useResumeParser'
import { useLocaleStore } from '@/stores/locale'

const props = defineProps<{
  review: ParseReview | null
}>()

const localeStore = useLocaleStore()
const { t } = localeStore

const changedDiffBlocks = computed(
  () => props.review?.diff?.blocks.filter((block) => block.changed) ?? [],
)

function confidenceLabel(value: ParseConfidenceLevel) {
  return t(`review.confidence${value.charAt(0).toUpperCase()}${value.slice(1)}`)
}
</script>

<style scoped lang="scss">
.review {
  display: flex;
  flex-direction: column;
  gap: $sp-3;
  padding: $sp-4;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  background: rgba(#fff, 0.78);

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $sp-3;
  }

  &__title {
    font-size: 14px;
    font-weight: 600;
  }

  &__subtitle {
    font-size: 13px;
    font-weight: 600;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: $sp-2;
  }

  &__item {
    padding: $sp-3;
    border-radius: $radius-md;
    border: 1px solid $color-border;
    background: rgba($color-surface, 0.9);

    &--high {
      border-color: rgba($color-success, 0.4);
    }

    &--medium {
      border-color: rgba($color-primary, 0.35);
    }

    &--low {
      border-color: rgba(#d97706, 0.45);
      background: rgba(#d97706, 0.06);
    }

    &--missing {
      border-color: rgba($color-border, 0.9);
      opacity: 0.8;
    }
  }

  &__row {
    display: flex;
    justify-content: space-between;
    gap: $sp-3;
    align-items: flex-start;

    @media (max-width: 720px) {
      flex-direction: column;
    }
  }

  &__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  &__label {
    font-size: 13px;
    color: $color-text;
  }

  &__status {
    font-size: 11px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 999px;

    &--ok {
      color: $color-success;
      background: rgba($color-success, 0.12);
    }

    &--hold {
      color: #b45309;
      background: rgba(#d97706, 0.14);
    }
  }

  &__badges {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  &__badge {
    font-size: 11px;
    color: $color-text-muted;
    background: rgba($color-border, 0.35);
    border-radius: 999px;
    padding: 2px 8px;
  }

  &__note {
    margin-top: $sp-2;
    font-size: 12px;
    color: $color-text-muted;
    line-height: 1.5;
  }

  &__details {
    margin-top: $sp-2;

    summary {
      cursor: pointer;
      font-size: 12px;
      color: $color-primary;
      user-select: none;
    }
  }

  &__raw {
    margin-top: $sp-2;
    padding: $sp-3;
    border-radius: $radius-md;
    background: #0f172a;
    color: #e2e8f0;
    font-size: 11px;
    line-height: 1.45;
    white-space: pre-wrap;
    word-break: break-word;
    max-height: 220px;
    overflow: auto;
  }

  &__raw--full {
    max-height: 320px;
  }

  &__diff {
    display: flex;
    flex-direction: column;
    gap: $sp-2;
    padding-top: $sp-1;
    border-top: 1px solid rgba($color-border, 0.8);
  }

  &__item--diff {
    background: rgba($color-primary, 0.04);
    border-color: rgba($color-primary, 0.2);
  }
}
</style>
