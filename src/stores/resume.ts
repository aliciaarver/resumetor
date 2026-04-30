import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import type { Locale } from '@/types/i18n'
import {
  buildHydratedResumeData,
  createDemoResume,
  detectDemoResumeLocale,
  normalizeResumeData,
  type ResumeData,
  type WorkExperience,
  type Education,
  type Language,
  type SocialLink,
  type Skill,
  type Project,
} from '@/entities/resume'

const STORAGE_KEY = 'resumetor:resume:v1'

function loadFromStorage(): ResumeData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return normalizeResumeData(JSON.parse(raw) as Partial<ResumeData>)
  } catch {
    return null
  }
}

const buildEmptyWorkExperience = (): WorkExperience => ({
  id: crypto.randomUUID(),
  company: '',
  companyUrl: '',
  position: '',
  location: '',
  fromMonth: '',
  toMonth: '',
  isCurrent: false,
  description: '',
  skills: [],
})

const buildEmptySocialLink = (): SocialLink => ({
  id: crypto.randomUUID(),
  label: 'Link',
  url: '',
})

const buildEmptyEducation = (): Education => ({
  id: crypto.randomUUID(),
  institution: '',
  degree: '',
  field: '',
  fromMonth: '',
  toMonth: '',
  isCurrent: false,
})

const buildEmptyLanguage = (): Language => ({
  id: crypto.randomUUID(),
  name: '',
  proficiency: 'Intermediate',
})

const buildEmptySkill = (): Skill => ({
  id: crypto.randomUUID(),
  name: '',
})

const buildEmptyProject = (): Project => ({
  id: crypto.randomUUID(),
  kind: 'project',
  title: '',
  subtitle: '',
  issuedAt: '',
  link: '',
  description: '',
})

export const useResumeStore = defineStore('resume', () => {
  const data = ref<ResumeData>(loadFromStorage() ?? normalizeResumeData(createDemoResume()))

  const persistData = useDebounceFn(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data.value))
  }, 500)

  // Persist on every change; first call happens only after user edits (watch is not immediate)
  watch(data, persistData, { deep: true })

  function addWorkExperience() {
    data.value.workExperience.push(buildEmptyWorkExperience())
  }

  function removeWorkExperience(id: string) {
    data.value.workExperience = data.value.workExperience.filter((e) => e.id !== id)
  }

  function addSocialLink() {
    data.value.personal.links.push(buildEmptySocialLink())
  }

  function removeSocialLink(id: string) {
    data.value.personal.links = data.value.personal.links.filter((l) => l.id !== id)
  }

  function addEducation() {
    data.value.education.push(buildEmptyEducation())
  }

  function removeEducation(id: string) {
    data.value.education = data.value.education.filter((e) => e.id !== id)
  }

  function addLanguage() {
    data.value.languages.push(buildEmptyLanguage())
  }

  function removeLanguage(id: string) {
    data.value.languages = data.value.languages.filter((l) => l.id !== id)
  }

  function addSkill() {
    data.value.skills.push(buildEmptySkill())
  }

  function removeSkill(id: string) {
    data.value.skills = data.value.skills.filter((skill) => skill.id !== id)
  }

  function addProject() {
    data.value.projects.push(buildEmptyProject())
  }

  function addCertification() {
    data.value.projects.push({
      ...buildEmptyProject(),
      kind: 'certification',
    })
  }

  function removeProject(id: string) {
    data.value.projects = data.value.projects.filter((project) => project.id !== id)
  }

  function resetResume(locale?: Locale) {
    localStorage.removeItem(STORAGE_KEY)
    data.value = createDemoResume(locale)
  }

  function localizeDemoResume(locale: Locale) {
    if (!detectDemoResumeLocale(data.value)) {
      return false
    }

    data.value = createDemoResume(locale)
    return true
  }

  function hydrateFromParsed(parsed: Partial<ResumeData>) {
    data.value = buildHydratedResumeData(parsed)
  }

  return {
    data,
    addWorkExperience,
    removeWorkExperience,
    addSocialLink,
    removeSocialLink,
    addEducation,
    removeEducation,
    addLanguage,
    removeLanguage,
    addSkill,
    removeSkill,
    addProject,
    addCertification,
    removeProject,
    resetResume,
    localizeDemoResume,
    hydrateFromParsed,
  }
})
