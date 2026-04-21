import type { Locale } from '@/types/i18n'
import type { ResumeData } from '@/entities/resume/model/types'
import { createDemoResume } from '@/entities/resume/model/factories'

export function detectDemoResumeLocale(resume: ResumeData): Locale | null {
  const comparableResume = toComparableResume(resume)

  for (const locale of ['ru', 'en'] as const) {
    if (
      JSON.stringify(comparableResume) ===
      JSON.stringify(toComparableResume(createDemoResume(locale)))
    ) {
      return locale
    }
  }

  return null
}

export function isResumeEffectivelyEmpty(resume: ResumeData): boolean {
  const hasPersonalText = [
    resume.personal.fullName,
    resume.personal.firstName,
    resume.personal.lastName,
    resume.personal.middleName,
    resume.personal.position,
    resume.personal.location,
    resume.personal.citizenship,
    resume.personal.workPermit,
    resume.personal.gender,
    resume.personal.age,
    resume.personal.birthDate,
    resume.personal.photo,
    resume.personal.phone,
    resume.aboutMe,
    ...resume.personal.workFormats,
  ].some((value) => value.trim())

  const hasLinks = resume.personal.links.some((link) => link.label.trim() || link.url.trim())
  const hasExperience = resume.workExperience.some(
    (entry) =>
      [
        entry.company,
        entry.companyUrl,
        entry.position,
        entry.location,
        entry.fromMonth,
        entry.toMonth,
        entry.description,
        ...entry.skills,
      ].some((value) => value.trim()) || entry.isCurrent,
  )
  const hasEducation = resume.education.some(
    (entry) =>
      [entry.institution, entry.degree, entry.field, entry.fromMonth, entry.toMonth].some((value) =>
        value.trim(),
      ) || entry.isCurrent,
  )
  const hasSkills = resume.skills.some((entry) => entry.name.trim())
  const hasLanguages = resume.languages.some(
    (entry) => entry.name.trim() || entry.proficiency.trim(),
  )
  const hasProjects = resume.projects.some((entry) =>
    [entry.title, entry.subtitle, entry.link, entry.description].some((value) => value.trim()),
  )

  return !(
    hasPersonalText ||
    hasLinks ||
    hasExperience ||
    hasEducation ||
    hasSkills ||
    hasLanguages ||
    hasProjects
  )
}

function toComparableResume(resume: ResumeData) {
  return {
    personal: {
      fullName: resume.personal.fullName,
      firstName: resume.personal.firstName,
      lastName: resume.personal.lastName,
      middleName: resume.personal.middleName,
      position: resume.personal.position,
      location: resume.personal.location,
      citizenship: resume.personal.citizenship,
      workPermit: resume.personal.workPermit,
      workFormats: resume.personal.workFormats,
      birthDate: resume.personal.birthDate,
      gender: resume.personal.gender,
      age: resume.personal.age,
      photo: resume.personal.photo,
      phone: resume.personal.phone,
      links: resume.personal.links.map(({ label, url }) => ({ label, url })),
    },
    aboutMe: resume.aboutMe,
    workExperience: resume.workExperience.map(
      ({
        company,
        companyUrl,
        position,
        location,
        fromMonth,
        toMonth,
        isCurrent,
        description,
        skills,
      }) => ({
        company,
        companyUrl,
        position,
        location,
        fromMonth,
        toMonth,
        isCurrent,
        description,
        skills,
      }),
    ),
    education: resume.education.map(
      ({ institution, degree, field, fromMonth, toMonth, isCurrent }) => ({
        institution,
        degree,
        field,
        fromMonth,
        toMonth,
        isCurrent,
      }),
    ),
    skills: resume.skills.map(({ name }) => ({ name })),
    languages: resume.languages.map(({ name, proficiency }) => ({ name, proficiency })),
    projects: resume.projects.map(({ kind, title, subtitle, issuedAt, link, description }) => ({
      kind,
      title,
      subtitle,
      issuedAt,
      link,
      description,
    })),
  }
}
