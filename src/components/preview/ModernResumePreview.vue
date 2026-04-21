<template>
  <div
    class="resume modern-resume"
    ref="el"
    role="document"
    :aria-label="t('preview.documentLabel')"
  >
    <header class="modern-resume__header" data-page-block data-page-block-kind="header">
      <div class="modern-resume__header-main">
        <h1 class="modern-resume__name">{{ fullName || t('preview.yourName') }}</h1>
        <p v-if="data.personal.position" class="modern-resume__role">
          {{ data.personal.position }}
        </p>
        <p
          v-if="data.aboutMe"
          class="modern-resume__summary"
          v-html="renderTextWithLinks(data.aboutMe)"
        ></p>
      </div>
      <aside class="modern-resume__sidebar">
        <div v-if="data.personal.photo" class="modern-resume__photo-wrap">
          <img :src="data.personal.photo" alt="" class="modern-resume__photo" />
        </div>

        <div
          v-if="
            data.personal.location ||
            data.personal.citizenship ||
            data.personal.birthDate ||
            data.personal.workFormats.length
          "
          class="modern-resume__meta-block"
        >
          <h2 class="modern-resume__meta-title">{{ t('preview.profile') }}</h2>
          <p v-if="data.personal.location" class="modern-resume__meta-line">
            {{ data.personal.location }}
          </p>
          <p v-if="data.personal.citizenship" class="modern-resume__meta-line">
            {{ data.personal.citizenship }}
          </p>
          <p v-if="data.personal.birthDate" class="modern-resume__meta-line">
            {{ data.personal.birthDate }}
          </p>
          <div v-if="data.personal.workFormats.length" class="modern-resume__chips">
            <span
              v-for="format in data.personal.workFormats"
              :key="format"
              class="modern-resume__chip"
              >{{ format }}</span
            >
          </div>
        </div>

        <div v-if="data.personal.phone || contactLinks.length" class="modern-resume__meta-block">
          <h2 class="modern-resume__meta-title">{{ t('preview.contacts') }}</h2>
          <p v-if="data.personal.phone" class="modern-resume__meta-line">
            {{ data.personal.phone }}
          </p>
          <template v-for="link in contactLinks" :key="link.id">
            <a
              v-if="link.href"
              :href="link.href"
              class="modern-resume__meta-line modern-resume__meta-link"
              target="_blank"
              rel="noreferrer"
              >{{ link.text }}</a
            >
            <p v-else class="modern-resume__meta-line">{{ link.text }}</p>
          </template>
        </div>

        <div
          v-if="data.skills.length"
          class="modern-resume__meta-block"
          data-page-block
          data-page-block-kind="item"
        >
          <h2 class="modern-resume__meta-title">{{ t('preview.skills') }}</h2>
          <div class="modern-resume__chips">
            <span v-for="skill in data.skills" :key="skill.id" class="modern-resume__chip">{{
              skill.name
            }}</span>
          </div>
        </div>

        <div
          v-if="data.languages.length"
          class="modern-resume__meta-block"
          data-page-block
          data-page-block-kind="item"
        >
          <h2 class="modern-resume__meta-title">{{ t('preview.languages') }}</h2>
          <div class="modern-resume__meta-stack">
            <p v-for="lang in data.languages" :key="lang.id" class="modern-resume__meta-line">
              {{ lang.name
              }}<span v-if="lang.proficiency"> · {{ proficiencyLabel(lang.proficiency) }}</span>
            </p>
          </div>
        </div>
      </aside>
    </header>

    <section v-if="data.workExperience.length" class="modern-resume__section">
      <div class="modern-resume__section-header" data-page-block data-page-block-kind="heading">
        <p class="modern-resume__section-kicker">01</p>
        <h2 class="modern-resume__section-title">{{ t('preview.workExperience') }}</h2>
      </div>
      <article
        v-for="exp in data.workExperience"
        :key="exp.id"
        class="modern-resume__entry"
        data-page-block
        data-page-block-kind="item"
      >
        <div class="modern-resume__entry-side">
          <p class="modern-resume__dates">
            {{ formatDateRange(exp.fromMonth, exp.toMonth, exp.isCurrent) }}
          </p>
        </div>
        <div class="modern-resume__entry-main">
          <div class="modern-resume__entry-heading">
            <a
              v-if="exp.companyUrl"
              :href="buildLinkHref({ label: 'Link', url: exp.companyUrl })"
              class="modern-resume__entry-title modern-resume__entry-link"
              target="_blank"
              rel="noreferrer"
              >{{ exp.company }}</a
            >
            <span v-else class="modern-resume__entry-title">{{ exp.company }}</span>
            <p v-if="exp.position" class="modern-resume__entry-subtitle">{{ exp.position }}</p>
          </div>
          <div v-if="exp.skills.length" class="modern-resume__chips modern-resume__entry-chips">
            <span
              v-for="skill in exp.skills"
              :key="`${exp.id}-${skill}`"
              class="modern-resume__chip"
              >{{ skill }}</span
            >
          </div>
          <p
            v-if="exp.description"
            class="modern-resume__entry-description"
            v-html="renderTextWithLinks(exp.description)"
          ></p>
        </div>
      </article>
    </section>

    <section v-if="data.education.length" class="modern-resume__section">
      <div class="modern-resume__section-header" data-page-block data-page-block-kind="heading">
        <p class="modern-resume__section-kicker">02</p>
        <h2 class="modern-resume__section-title">{{ t('preview.education') }}</h2>
      </div>
      <article
        v-for="edu in data.education"
        :key="edu.id"
        class="modern-resume__entry"
        data-page-block
        data-page-block-kind="item"
      >
        <div class="modern-resume__entry-side">
          <p class="modern-resume__dates">
            {{ formatDateRange(edu.fromMonth, edu.toMonth, edu.isCurrent) }}
          </p>
        </div>
        <div class="modern-resume__entry-main">
          <p class="modern-resume__entry-title">{{ edu.institution }}</p>
          <p class="modern-resume__entry-subtitle">
            {{ [edu.degree, edu.field].filter(Boolean).join(', ') }}
          </p>
        </div>
      </article>
    </section>

    <section v-if="projectEntries.length" class="modern-resume__section">
      <div class="modern-resume__section-header" data-page-block data-page-block-kind="heading">
        <p class="modern-resume__section-kicker">03</p>
        <h2 class="modern-resume__section-title">{{ t('preview.projectsOnly') }}</h2>
      </div>
      <article
        v-for="project in projectEntries"
        :key="project.id"
        class="modern-resume__entry"
        data-page-block
        data-page-block-kind="item"
      >
        <div class="modern-resume__entry-side" />
        <div class="modern-resume__entry-main">
          <a
            v-if="project.link"
            :href="buildLinkHref({ label: 'Link', url: project.link })"
            class="modern-resume__entry-title modern-resume__entry-link"
            target="_blank"
            rel="noreferrer"
            >{{ project.title }}</a
          >
          <p v-else class="modern-resume__entry-title">{{ project.title }}</p>
          <p v-if="project.subtitle" class="modern-resume__entry-subtitle">
            {{ project.subtitle }}
          </p>
          <p v-if="project.description" class="modern-resume__entry-description">
            {{ project.description }}
          </p>
        </div>
      </article>
    </section>

    <section v-if="certificationEntries.length" class="modern-resume__section">
      <div class="modern-resume__section-header" data-page-block data-page-block-kind="heading">
        <p class="modern-resume__section-kicker">04</p>
        <h2 class="modern-resume__section-title">{{ t('preview.certifications') }}</h2>
      </div>
      <article
        v-for="cert in certificationEntries"
        :key="cert.id"
        class="modern-resume__entry"
        data-page-block
        data-page-block-kind="item"
      >
        <div class="modern-resume__entry-side">
          <p v-if="cert.issuedAt" class="modern-resume__dates">
            {{ formatDateRange(cert.issuedAt, '', false) }}
          </p>
        </div>
        <div class="modern-resume__entry-main">
          <a
            v-if="cert.link"
            :href="buildLinkHref({ label: 'Link', url: cert.link })"
            class="modern-resume__entry-title modern-resume__entry-link"
            target="_blank"
            rel="noreferrer"
            >{{ cert.title }}</a
          >
          <p v-else class="modern-resume__entry-title">{{ cert.title }}</p>
          <p v-if="cert.subtitle" class="modern-resume__entry-subtitle">{{ cert.subtitle }}</p>
          <p v-if="cert.description" class="modern-resume__entry-description">
            {{ cert.description }}
          </p>
        </div>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useResumePreviewModel } from '@/composables/useResumePreviewModel'

const { data, fullName, t, proficiencyLabel, el, contactLinks, formatDateRange, buildLinkHref } =
  useResumePreviewModel()

const URL_RE = /https?:\/\/[^\s<]+/g

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function renderTextWithLinks(value: string): string {
  const escaped = escapeHtml(value)
  return escaped
    .replace(
      URL_RE,
      (url) =>
        `<a href="${url}" class="modern-resume__text-link" target="_blank" rel="noreferrer">${url}</a>`,
    )
    .replace(/\n/g, '<br>')
}

const projectEntries = computed(() =>
  data.value.projects.filter((entry) => entry.kind === 'project'),
)
const certificationEntries = computed(() =>
  data.value.projects.filter((entry) => entry.kind === 'certification'),
)

defineExpose({ el })
</script>

<style scoped lang="scss">
// Design tokens
$accent: #4f46e5;
$accent-light: #ede9fe;
$text-primary: #0f172a;
$text-secondary: #475569;
$text-muted: #94a3b8;
$border: #e2e8f0;
$font-heading: 'Montserrat', sans-serif;
$font-body: 'Inter', system-ui, sans-serif;

.modern-resume {
  width: 210mm;
  min-height: 297mm;
  padding: 12mm 14mm;
  background: #ffffff;
  color: $text-primary;
  font-family: $font-body;
  font-size: 9.5pt;
  line-height: 1.55;
  box-sizing: border-box;

  // ── HEADER ───────────────────────────────────────────────
  &__header {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 52mm;
    gap: 10mm;
    margin-bottom: 8mm;
    padding-bottom: 7mm;
    border-bottom: 2px solid $accent;
  }

  &__header-main {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }

  &__eyebrow {
    display: none; // убираем лейбл шаблона из документа
  }

  &__name {
    margin: 0 0 1.5mm;
    font-family: $font-heading;
    font-size: 26pt;
    font-weight: 800;
    line-height: 1;
    letter-spacing: -0.02em;
    color: $text-primary;
  }

  &__role {
    margin: 0 0 3mm;
    font-family: $font-heading;
    font-size: 10.5pt;
    font-weight: 600;
    color: $accent;
    letter-spacing: 0.01em;
  }

  &__summary {
    margin: 0;
    color: $text-secondary;
    font-size: 9pt;
    white-space: break-spaces;
    line-height: 1.6;
  }

  // ── SIDEBAR ───────────────────────────────────────────────
  &__sidebar {
    display: flex;
    flex-direction: column;
    gap: 4.5mm;
  }

  &__photo-wrap {
    display: flex;
    justify-content: flex-end;
  }

  &__photo {
    width: 30mm;
    height: 30mm;
    object-fit: cover;
    border-radius: 3mm;
    border: 0.5mm solid $border;
  }

  &__meta-block {
    display: flex;
    flex-direction: column;
    gap: 1mm;
  }

  &__meta-title {
    margin: 0 0 1.5mm;
    font-family: $font-heading;
    font-size: 7pt;
    font-weight: 700;
    color: $accent;
    text-transform: uppercase;
    letter-spacing: 0.14em;
  }

  &__meta-stack {
    display: flex;
    flex-direction: column;
    gap: 0.8mm;
  }

  &__meta-line {
    margin: 0;
    font-size: 8.5pt;
    color: $text-primary;
    word-break: break-word;
    line-height: 1.45;
  }

  &__meta-link {
    color: $accent;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  // ── CHIPS (skills) ────────────────────────────────────────
  &__chips {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5mm;
  }

  &__entry-chips {
    margin-top: 2mm;
  }

  &__chip {
    display: inline-flex;
    align-items: center;
    padding: 0.6mm 2.2mm;
    border-radius: 2mm;
    border: 0.4mm solid rgba($accent, 0.35);
    background: $accent-light;
    color: $accent;
    font-family: $font-body;
    font-size: 7.5pt;
    font-weight: 500;
    white-space: nowrap;
  }

  // ── SECTIONS ─────────────────────────────────────────────
  &__section {
    margin-bottom: 6mm;

    &:last-child {
      margin-bottom: 0;
    }
  }

  &__section-header {
    display: flex;
    align-items: center;
    gap: 3mm;
    margin-bottom: 4mm;
  }

  &__section-kicker {
    display: none; // убираем 01/02/03
  }

  &__section-title {
    margin: 0;
    font-family: $font-heading;
    font-size: 9.5pt;
    font-weight: 700;
    color: $text-primary;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    white-space: nowrap;

    // линия справа от заголовка
    &::after {
      content: '';
      display: inline-block;
      vertical-align: middle;
      margin-left: 3mm;
      width: 999mm; // обрезается overflow
      height: 0.4mm;
      background: $border;
    }
  }

  // ── ENTRIES ───────────────────────────────────────────────
  &__entry {
    display: grid;
    grid-template-columns: 30mm 1fr;
    gap: 4mm;
    margin-bottom: 4mm;

    &:last-child {
      margin-bottom: 0;
    }
  }

  &__entry-side {
    padding-top: 0.5mm;
    text-align: right;
  }

  &__dates {
    margin: 0;
    font-size: 8pt;
    color: $text-muted;
    line-height: 1.4;
  }

  &__entry-main {
    min-width: 0;
    border-left: 0.5mm solid $border;
    padding-left: 4mm;
  }

  &__entry-heading {
    margin-bottom: 1mm;
  }

  &__entry-title {
    display: block;
    margin: 0;
    font-family: $font-heading;
    font-size: 10pt;
    font-weight: 700;
    color: $text-primary;
    line-height: 1.2;
  }

  &__entry-link {
    color: $accent;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  &__entry-subtitle {
    margin: 0.8mm 0 0;
    font-size: 9pt;
    color: $text-secondary;
    font-style: italic;
  }

  &__entry-description {
    margin: 2mm 0 0;
    font-size: 9pt;
    color: $text-secondary;
    white-space: break-spaces;
    line-height: 1.55;
  }

  :deep(.modern-resume__text-link) {
    color: $accent;
    text-decoration: underline;
    word-break: break-word;
  }
}
</style>
