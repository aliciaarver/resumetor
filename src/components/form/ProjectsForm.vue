<template>
  <section class="section">
    <div class="section__header">
      <h2 class="section__title">{{ t('form.projects') }}</h2>
      <div class="section__actions">
        <AppButton variant="ghost" size="sm" @click="addProject">{{
          t('form.addProject')
        }}</AppButton>
        <AppButton variant="secondary" size="sm" @click="addCertification">{{
          t('form.addCertification')
        }}</AppButton>
      </div>
    </div>

    <div v-if="projectEntries.length" class="group">
      <h3 class="group__title">{{ t('form.projectsOnly') }}</h3>
      <TransitionGroup name="list" tag="div" class="list">
        <article v-for="project in projectEntries" :key="project.id" class="block">
          <div class="block__header">
            <strong class="block__title">{{ project.title || t('form.projectEntry') }}</strong>
            <AppButton variant="ghost" size="sm" @click="removeProject(project.id)">{{
              t('common.remove')
            }}</AppButton>
          </div>

          <AppInput
            v-model="project.title"
            :label="t('form.projectTitle')"
            :placeholder="t('form.projectTitlePlaceholder')"
          />
          <AppInput
            v-model="project.subtitle"
            :label="t('form.projectRole')"
            :placeholder="t('form.projectRolePlaceholder')"
          />
          <AppInput
            v-model="project.link"
            :label="t('form.projectLink')"
            :placeholder="t('form.projectLinkPlaceholder')"
          />
          <AppTextarea
            v-model="project.description"
            :label="t('form.description')"
            :placeholder="t('form.projectDescriptionPlaceholder')"
            :rows="4"
          />
        </article>
      </TransitionGroup>
    </div>

    <div v-if="certificationEntries.length" class="group">
      <h3 class="group__title">{{ t('form.certifications') }}</h3>
      <TransitionGroup name="list" tag="div" class="list">
        <article v-for="cert in certificationEntries" :key="cert.id" class="block block--compact">
          <div class="block__header">
            <strong class="block__title">{{ cert.title || t('form.certificationEntry') }}</strong>
            <AppButton variant="ghost" size="sm" @click="removeProject(cert.id)">{{
              t('common.remove')
            }}</AppButton>
          </div>

          <AppInput
            v-model="cert.title"
            :label="t('form.projectTitle')"
            :placeholder="t('form.projectTitlePlaceholder')"
          />

          <div class="grid-2">
            <AppInput
              v-model="cert.subtitle"
              :label="t('form.certificationOrg')"
              :placeholder="t('form.certificationOrgPlaceholder')"
            />
            <AppMonthField
              v-model="cert.issuedAt"
              :label="t('form.certificationDate')"
              :placeholder="monthPlaceholder"
            />
          </div>

          <AppInput
            v-model="cert.link"
            :label="t('form.projectLink')"
            :placeholder="t('form.projectLinkPlaceholder')"
          />
          <AppTextarea
            v-model="cert.description"
            :label="t('form.description')"
            :placeholder="t('form.projectDescriptionPlaceholder')"
            :rows="3"
          />
        </article>
      </TransitionGroup>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useLocaleStore } from '@/stores/locale'
import { useResumeStore } from '@/stores/resume'
import AppInput from '@/components/ui/AppInput.vue'
import AppTextarea from '@/components/ui/AppTextarea.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppMonthField from '@/components/ui/AppMonthField.vue'

const store = useResumeStore()
const localeStore = useLocaleStore()
const { t } = localeStore
const { data } = storeToRefs(store)
const { addProject, addCertification, removeProject } = store
const monthPlaceholder = computed(() => t('common.monthPlaceholder'))

const projectEntries = computed(() =>
  data.value.projects.filter((entry) => entry.kind === 'project'),
)
const certificationEntries = computed(() =>
  data.value.projects.filter((entry) => entry.kind === 'certification'),
)
</script>

<style scoped lang="scss">
.section {
  display: flex;
  flex-direction: column;
  gap: $sp-4;

  &__header {
    @include flex-between;
    align-items: flex-start;
    gap: $sp-3;
  }

  &__title {
    font-size: 16px;
    font-weight: 600;
  }

  &__actions {
    display: flex;
    gap: $sp-2;
    flex-wrap: wrap;
    justify-content: flex-end;
  }
}

.group {
  display: flex;
  flex-direction: column;
  gap: $sp-3;

  &__title {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: $color-text-muted;
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
  gap: $sp-3;

  &--compact {
    background: rgba(#fff, 0.82);
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $sp-3;
  }

  &__title {
    font-size: 14px;
    font-weight: 600;
    color: $color-text;
  }
}

.grid-2 {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: $sp-3;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.25s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 720px) {
  .grid-2 {
    grid-template-columns: 1fr;
  }
}
</style>
