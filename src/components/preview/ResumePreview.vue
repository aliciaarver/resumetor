<template>
  <div class="resume" ref="el" role="document" :aria-label="t('preview.documentLabel')">
    <header class="resume__header" data-page-block data-page-block-kind="header">
      <h1 class="resume__name">{{ fullName || t('preview.yourName') }}</h1>
      <p v-if="data.personal.position" class="resume__role">{{ data.personal.position }}</p>
      <div v-if="topMeta.length" class="resume__personal-meta">
        <span v-for="(item, index) in topMeta" :key="item" class="resume__personal-item">
          <span v-if="index > 0" class="resume__dot">·</span>{{ item }}
        </span>
      </div>
      <div class="resume__contacts">
        <span v-if="data.personal.phone" class="resume__contact">{{ data.personal.phone }}</span>
        <template v-for="(link, index) in contactLinks" :key="link.id">
          <span v-if="data.personal.phone || index > 0" class="resume__dot">·</span>
          <a
            v-if="link.href"
            :href="link.href"
            class="resume__contact resume__link"
            target="_blank"
            rel="noreferrer"
          >
            {{ link.text }}
          </a>
          <span v-else class="resume__contact">{{ link.text }}</span>
        </template>
      </div>
    </header>

    <section v-if="data.aboutMe" class="resume__section">
      <div class="resume__section-header" data-page-block data-page-block-kind="heading">
        <h2 class="resume__section-title">{{ t('preview.aboutMe') }}</h2>
        <div class="resume__divider" />
      </div>
      <div class="resume__about" data-page-block data-page-block-kind="item">{{ data.aboutMe }}</div>
    </section>

    <section v-if="data.workExperience.length" class="resume__section">
      <div class="resume__section-header" data-page-block data-page-block-kind="heading">
        <h2 class="resume__section-title">{{ t('preview.workExperience') }}</h2>
        <div class="resume__divider" />
      </div>
      <div
        v-for="exp in data.workExperience"
        :key="exp.id"
        class="resume__exp"
        data-page-block
        data-page-block-kind="item"
      >
        <div class="resume__exp-dates">
          {{ formatDateRange(exp.fromMonth, exp.toMonth, exp.isCurrent) }}
        </div>
        <div class="resume__exp-body">
          <div class="resume__exp-header">
            <div class="resume__exp-left">
              <span class="resume__exp-company">
                <a
                  v-if="exp.companyUrl"
                  :href="buildLinkHref({ label: 'Link', url: exp.companyUrl })"
                  class="resume__exp-company-link"
                  target="_blank"
                  rel="noreferrer"
                >{{ exp.company }}</a>
                <span v-else>{{ exp.company }}</span>
              </span>
              <span v-if="exp.position" class="resume__exp-position">{{ exp.position }}</span>
              <span v-if="exp.location" class="resume__exp-location">{{ exp.location }}</span>
            </div>
          </div>
          <div v-if="exp.skills.length" class="resume__exp-skills">
            <span v-for="skill in exp.skills" :key="`${exp.id}-${skill}`" class="resume__skill">{{ skill }}</span>
          </div>
          <div v-if="exp.description" class="resume__exp-desc">{{ exp.description }}</div>
        </div>
      </div>
    </section>

    <section v-if="data.education.length" class="resume__section">
      <div class="resume__section-header" data-page-block data-page-block-kind="heading">
        <h2 class="resume__section-title">{{ t('preview.education') }}</h2>
        <div class="resume__divider" />
      </div>
      <div v-for="edu in data.education" :key="edu.id" class="resume__edu" data-page-block data-page-block-kind="item">
        <div class="resume__edu-dates">
          {{ formatDateRange(edu.fromMonth, edu.toMonth, edu.isCurrent) }}
        </div>
        <div class="resume__edu-body">
          <div class="resume__edu-header">
            <div class="resume__edu-left">
              <span class="resume__edu-institution">{{ edu.institution }}</span>
              <span class="resume__edu-degree">{{ [edu.degree, edu.field].filter(Boolean).join(', ') }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section v-if="data.skills.length" class="resume__section">
      <div class="resume__section-header" data-page-block data-page-block-kind="heading">
        <h2 class="resume__section-title">{{ t('preview.skills') }}</h2>
        <div class="resume__divider" />
      </div>
      <div class="resume__skills" data-page-block data-page-block-kind="item">
        <span v-for="skill in data.skills" :key="skill.id" class="resume__skill">
          {{ skill.name }}
        </span>
      </div>
    </section>

    <section v-if="data.languages.length" class="resume__section">
      <div class="resume__section-header" data-page-block data-page-block-kind="heading">
        <h2 class="resume__section-title">{{ t('preview.languages') }}</h2>
        <div class="resume__divider" />
      </div>
      <div class="resume__langs" data-page-block data-page-block-kind="item">
        <span v-for="lang in data.languages" :key="lang.id" class="resume__lang">
          {{ lang.name }}<span v-if="lang.proficiency" class="resume__lang-level"> — {{ proficiencyLabel(lang.proficiency) }}</span>
        </span>
      </div>
    </section>

    <section v-if="projectEntries.length" class="resume__section">
      <div class="resume__section-header" data-page-block data-page-block-kind="heading">
        <h2 class="resume__section-title">{{ t('preview.projectsOnly') }}</h2>
        <div class="resume__divider" />
      </div>
      <div
        v-for="project in projectEntries"
        :key="project.id"
        class="resume__project"
        data-page-block
        data-page-block-kind="item"
      >
        <div class="resume__project-header">
          <div class="resume__project-left">
            <a
              v-if="project.link"
              :href="buildLinkHref({ label: 'Link', url: project.link })"
              class="resume__project-title resume__project-link"
              target="_blank"
              rel="noreferrer"
            >{{ project.title }}</a>
            <span v-else class="resume__project-title">{{ project.title }}</span>
            <span v-if="project.subtitle" class="resume__project-subtitle">{{ project.subtitle }}</span>
          </div>
        </div>
        <p v-if="project.description" class="resume__project-desc">{{ project.description }}</p>
      </div>
    </section>

    <section v-if="certificationEntries.length" class="resume__section">
      <div class="resume__section-header" data-page-block data-page-block-kind="heading">
        <h2 class="resume__section-title">{{ t('preview.certifications') }}</h2>
        <div class="resume__divider" />
      </div>
      <div
        v-for="cert in certificationEntries"
        :key="cert.id"
        class="resume__project"
        data-page-block
        data-page-block-kind="item"
      >
        <div class="resume__project-header">
          <div class="resume__project-left">
            <a
              v-if="cert.link"
              :href="buildLinkHref({ label: 'Link', url: cert.link })"
              class="resume__project-title resume__project-link"
              target="_blank"
              rel="noreferrer"
            >{{ cert.title }}</a>
            <span v-else class="resume__project-title">{{ cert.title }}</span>
            <span v-if="cert.subtitle" class="resume__project-subtitle">{{ cert.subtitle }}</span>
          </div>
          <div v-if="cert.issuedAt" class="resume__edu-dates">
            {{ formatDateRange(cert.issuedAt, '', false) }}
          </div>
        </div>
        <p v-if="cert.description" class="resume__project-desc">{{ cert.description }}</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useResumePreviewModel } from '@/composables/useResumePreviewModel'

const {
  data,
  fullName,
  t,
  proficiencyLabel,
  el,
  contactLinks,
  formatDateRange,
  buildLinkHref,
} = useResumePreviewModel()

const topMeta = computed(() => [
  data.value.personal.gender,
  data.value.personal.age,
  data.value.personal.birthDate,
  data.value.personal.location,
  data.value.personal.citizenship,
  data.value.personal.workPermit ? `${t('form.workPermit')}: ${data.value.personal.workPermit}` : '',
].map((item) => item?.trim() ?? '').filter(Boolean))

const projectEntries = computed(() => data.value.projects.filter((entry) => entry.kind === 'project'))
const certificationEntries = computed(() => data.value.projects.filter((entry) => entry.kind === 'certification'))

defineExpose({ el })
</script>

<style scoped lang="scss">
$accent:       #4f46e5;
$accent-light: #ede9fe;
$text:         #0f172a;
$text-sub:     #475569;
$text-muted:   #94a3b8;
$border:       #e2e8f0;
$font-h:       'Montserrat', sans-serif;
$font-b:       'Inter', system-ui, sans-serif;

.resume {
  width: 210mm;
  min-height: 297mm;
  background: #fff;
  padding: 12mm 14mm;
  font-family: $font-b;
  color: $text;
  font-size: 9.5pt;
  line-height: 1.55;
  box-sizing: border-box;

  // ── HEADER ────────────────────────────────────────────────
  &__header {
    margin-bottom: 7mm;
    padding-bottom: 6mm;
    border-bottom: 2.5px solid $accent;
  }

  &__name {
    font-family: $font-h;
    font-size: 26pt;
    font-weight: 800;
    letter-spacing: -0.02em;
    line-height: 1;
    margin-bottom: 2mm;
    color: $text;
  }

  &__role {
    font-family: $font-h;
    font-size: 10.5pt;
    font-weight: 600;
    color: $accent;
    margin: 0 0 3mm;
    letter-spacing: 0.01em;
  }

  &__personal-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0 6px;
    font-size: 8.5pt;
    color: $text-sub;
    margin-bottom: 2mm;
  }

  &__contacts {
    display: flex;
    flex-wrap: wrap;
    gap: 0 6px;
    font-size: 8.5pt;
    color: $text-sub;
  }

  &__dot {
    color: $text-muted;
  }

  &__contact {
    white-space: nowrap;
  }

  &__link {
    color: $accent;
    text-decoration: none;
  }

  // ── SECTIONS ─────────────────────────────────────────────
  &__section {
    margin-bottom: 6mm;

    &:last-child { margin-bottom: 0; }
  }

  &__section-header {
    display: flex;
    align-items: center;
    gap: 3mm;
    margin-bottom: 4mm;
    overflow: hidden;
  }

  &__section-title {
    font-family: $font-h;
    font-size: 8.5pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: $text;
    white-space: nowrap;
    margin: 0;
  }

  &__divider {
    flex: 1;
    height: 1px;
    background: $border;
  }

  // ── ABOUT ─────────────────────────────────────────────────
  &__about {
    font-size: 9pt;
    color: $text-sub;
    white-space: break-spaces;
    line-height: 1.6;
  }

  // ── EXPERIENCE ────────────────────────────────────────────
  &__exp {
    display: grid;
    grid-template-columns: 28mm 1fr;
    gap: 4mm;
    margin-bottom: 4.5mm;

    &:last-child { margin-bottom: 0; }

    // Даты слева
    &-dates {
      font-size: 8pt;
      color: $text-muted;
      padding-top: 0.5mm;
      text-align: right;
      line-height: 1.4;
    }

    // Основной блок справа
    &-body {
      border-left: 0.5mm solid $border;
      padding-left: 4mm;
      min-width: 0;
    }

    &-header {
      display: flex;
      flex-direction: column;
      gap: 0.5mm;
      margin-bottom: 1mm;
    }

    &-left {
      display: flex;
      flex-direction: column;
      gap: 0.5mm;
    }

    &-company {
      font-family: $font-h;
      font-size: 10pt;
      font-weight: 700;
      color: $text;
      line-height: 1.2;
    }

    &-company-link {
      color: $accent;
      text-decoration: none;

      &:hover { text-decoration: underline; }
    }

    &-position {
      font-size: 9pt;
      color: $text-sub;
      font-style: italic;
    }

    &-location {
      font-size: 8.5pt;
      color: $text-muted;
    }

    &-skills {
      display: flex;
      flex-wrap: wrap;
      gap: 1.5mm;
      margin-bottom: 2mm;
    }

    &-desc {
      font-size: 9pt;
      color: $text-sub;
      white-space: break-spaces;
      line-height: 1.55;
    }
  }

  // ── EDUCATION ─────────────────────────────────────────────
  &__edu {
    display: grid;
    grid-template-columns: 28mm 1fr;
    gap: 4mm;
    margin-bottom: 3mm;

    &:last-child { margin-bottom: 0; }

    &-dates {
      font-size: 8pt;
      color: $text-muted;
      text-align: right;
      padding-top: 0.5mm;
    }

    &-body {
      border-left: 0.5mm solid $border;
      padding-left: 4mm;
    }

    &-header {
      display: flex;
      flex-direction: column;
    }

    &-left {
      display: flex;
      flex-direction: column;
      gap: 0.5mm;
    }

    &-institution {
      font-family: $font-h;
      font-size: 10pt;
      font-weight: 700;
      color: $text;
    }

    &-degree {
      font-size: 9pt;
      color: $text-sub;
      font-style: italic;
    }
  }

  // ── SKILLS ────────────────────────────────────────────────
  &__skills {
    display: flex;
    flex-wrap: wrap;
    gap: 2mm;
  }

  &__skill {
    display: inline-flex;
    align-items: center;
    padding: 0.6mm 2.2mm;
    border-radius: 2mm;
    border: 0.4mm solid rgba($accent, 0.3);
    background: $accent-light;
    color: $accent;
    font-family: $font-b;
    font-size: 7.5pt;
    font-weight: 500;
    white-space: nowrap;
  }

  // ── LANGUAGES ────────────────────────────────────────────
  &__langs {
    display: flex;
    flex-wrap: wrap;
    gap: 3mm 8mm;
  }

  &__lang {
    font-size: 9.5pt;
    color: $text;
  }

  &__lang-level {
    color: $text-sub;
    font-style: italic;
  }

  // ── PROJECTS / CERTS ─────────────────────────────────────
  &__project {
    margin-bottom: 4mm;

    &:last-child { margin-bottom: 0; }

    &-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 8px;
    }

    &-left {
      display: flex;
      flex-direction: column;
      gap: 0.5mm;
    }

    &-title {
      font-family: $font-h;
      font-size: 10pt;
      font-weight: 700;
      color: $text;
    }

    &-link {
      color: $accent;
      text-decoration: none;

      &:hover { text-decoration: underline; }
    }

    &-subtitle {
      font-size: 9pt;
      color: $text-sub;
      font-style: italic;
    }

    &-desc {
      margin-top: 2mm;
      font-size: 9pt;
      color: $text-sub;
      white-space: pre-line;
    }
  }
}
</style>
