<template>
  <div class="form-scroll">
    <div class="form-header">
      <h1 class="form-header__logo">Resumetor</h1>
      <div class="form-header__actions">
        <SwitchLocale />
        <AppButton variant="ghost" size="sm" @click="confirmReset">{{ t('builder.reset') }}</AppButton>
      </div>
    </div>

    <ResumeUploader class="uploader-section" />

    <div class="form-sections">
      <PersonalInfoForm />
      <div class="divider" />
      <AboutMeForm />
      <div class="divider" />
      <WorkExperienceForm />
      <div class="divider" />
      <EducationForm />
      <div class="divider" />
      <SkillsForm />
      <div class="divider" />
      <LanguagesForm />
      <div class="divider" />
      <ProjectsForm />
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useLocaleStore } from '@/stores/locale'
import { useResumeStore } from '@/stores/resume'
import { usePdfMetaStore } from '@/stores/pdfMeta'
import SwitchLocale from '@/features/switch-locale/SwitchLocale.vue'
import ResumeUploader from '@/components/upload/ResumeUploader.vue'
import PersonalInfoForm from '@/components/form/PersonalInfoForm.vue'
import AboutMeForm from '@/components/form/AboutMeForm.vue'
import WorkExperienceForm from '@/components/form/WorkExperienceForm.vue'
import EducationForm from '@/components/form/EducationForm.vue'
import SkillsForm from '@/components/form/SkillsForm.vue'
import LanguagesForm from '@/components/form/LanguagesForm.vue'
import ProjectsForm from '@/components/form/ProjectsForm.vue'
import AppButton from '@/components/ui/AppButton.vue'

const localeStore = useLocaleStore()
const { locale } = storeToRefs(localeStore)
const { t } = localeStore

const resumeStore = useResumeStore()
const pdfMetaStore = usePdfMetaStore()

function confirmReset() {
  if (confirm(t('builder.confirmReset'))) {
    resumeStore.resetResume(locale.value)
    pdfMetaStore.resetMeta()
  }
}
</script>

<style scoped lang="scss">
.form-scroll {
  height: 100%;
  overflow-y: auto;
  padding: $sp-5 $sp-5 $sp-8;
  display: flex;
  flex-direction: column;
  gap: $sp-5;
  overscroll-behavior: contain;

  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: $color-border; border-radius: 3px; }
}

.form-header {
  @include flex-between;

  &__logo {
    font-size: 18px;
    font-weight: 700;
    color: $color-primary;
    letter-spacing: -0.03em;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: $sp-2;
  }
}

.uploader-section {
  flex-shrink: 0;
}

.form-sections {
  display: flex;
  flex-direction: column;
  gap: $sp-5;
}

.divider {
  height: 1px;
  background: $color-border;
}
</style>
