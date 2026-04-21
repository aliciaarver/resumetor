import type { ResumeData } from '@/entities/resume/model/types'
import { createEmptyResume } from '@/entities/resume/model/factories'
import { normalizeSocialLink } from '@/utils/socialLinks'

export type LegacyResumeData = ResumeData & {
  personal?: ResumeData['personal'] & { email?: string }
}

function composeFullName(personal: Partial<ResumeData['personal']>): string {
  const parts = [
    typeof personal.lastName === 'string' ? personal.lastName.trim() : '',
    typeof personal.firstName === 'string' ? personal.firstName.trim() : '',
    typeof personal.middleName === 'string' ? personal.middleName.trim() : '',
  ].filter(Boolean)

  if (parts.length) return parts.join(' ')
  return typeof personal.fullName === 'string' ? personal.fullName.trim() : ''
}

export function normalizeResumeData(value: LegacyResumeData): ResumeData {
  const personal = value.personal ?? {
    fullName: '',
    firstName: '',
    lastName: '',
    middleName: '',
    position: '',
    location: '',
    citizenship: '',
    workPermit: '',
    workFormats: [],
    birthDate: '',
    gender: '',
    age: '',
    photo: '',
    phone: '',
    links: [],
  }
  const legacyEmail = personal.email?.trim() ?? ''
  const links = Array.isArray(personal.links)
    ? personal.links.map((link) => normalizeSocialLink(link))
    : []
  const workFormats = Array.isArray(personal.workFormats)
    ? personal.workFormats
        .filter((entry): entry is string => typeof entry === 'string')
        .map((entry) => entry.trim())
        .filter(Boolean)
    : []
  const workExperience = Array.isArray(value.workExperience)
    ? value.workExperience.map((entry) => ({
        id: entry?.id || crypto.randomUUID(),
        company: typeof entry?.company === 'string' ? entry.company : '',
        companyUrl: typeof entry?.companyUrl === 'string' ? entry.companyUrl : '',
        position: typeof entry?.position === 'string' ? entry.position : '',
        location: typeof entry?.location === 'string' ? entry.location : '',
        fromMonth: typeof entry?.fromMonth === 'string' ? entry.fromMonth : '',
        toMonth: typeof entry?.toMonth === 'string' ? entry.toMonth : '',
        isCurrent: Boolean(entry?.isCurrent),
        description: typeof entry?.description === 'string' ? entry.description : '',
        skills: Array.isArray(entry?.skills)
          ? entry.skills
              .filter((skill): skill is string => typeof skill === 'string')
              .map((skill) => skill.trim())
              .filter(Boolean)
          : [],
      }))
    : []
  const skills = Array.isArray(value.skills)
    ? value.skills.map((skill) => ({
        id: skill?.id || crypto.randomUUID(),
        name: typeof skill?.name === 'string' ? skill.name : '',
      }))
    : []
  const projects = Array.isArray(value.projects)
    ? value.projects.map((project) => ({
        id: project?.id || crypto.randomUUID(),
        kind: project?.kind === 'certification' ? ('certification' as const) : ('project' as const),
        title: typeof project?.title === 'string' ? project.title : '',
        subtitle: typeof project?.subtitle === 'string' ? project.subtitle : '',
        issuedAt: typeof project?.issuedAt === 'string' ? project.issuedAt : '',
        link: typeof project?.link === 'string' ? project.link : '',
        description: typeof project?.description === 'string' ? project.description : '',
      }))
    : []

  if (legacyEmail && !links.some((link) => link.label === 'Email' && link.url === legacyEmail)) {
    links.unshift({
      id: crypto.randomUUID(),
      label: 'Email',
      url: legacyEmail,
    })
  }

  return {
    ...value,
    personal: {
      fullName: composeFullName(personal),
      firstName: personal.firstName ?? '',
      lastName: personal.lastName ?? '',
      middleName: personal.middleName ?? '',
      position: personal.position ?? '',
      location: personal.location ?? '',
      citizenship: personal.citizenship ?? '',
      workPermit: personal.workPermit ?? '',
      workFormats,
      birthDate: personal.birthDate ?? '',
      gender: personal.gender ?? '',
      age: personal.age ?? '',
      photo: personal.photo ?? '',
      phone: personal.phone ?? '',
      links,
    },
    workExperience,
    skills,
    projects,
  }
}

export function buildHydratedResumeData(parsed: Partial<ResumeData>): ResumeData {
  const nextValue = createEmptyResume()

  if (parsed.personal) {
    nextValue.personal = {
      fullName: composeFullName(parsed.personal),
      firstName: parsed.personal.firstName ?? '',
      lastName: parsed.personal.lastName ?? '',
      middleName: parsed.personal.middleName ?? '',
      position: parsed.personal.position ?? '',
      location: parsed.personal.location ?? '',
      citizenship: parsed.personal.citizenship ?? '',
      workPermit: parsed.personal.workPermit ?? '',
      workFormats: parsed.personal.workFormats ?? [],
      birthDate: parsed.personal.birthDate ?? '',
      gender: parsed.personal.gender ?? '',
      age: parsed.personal.age ?? '',
      photo: parsed.personal.photo ?? '',
      phone: parsed.personal.phone ?? '',
      links: parsed.personal.links?.map((link) => normalizeSocialLink(link)) ?? [],
    }
  }

  nextValue.aboutMe = parsed.aboutMe ?? ''
  nextValue.workExperience = parsed.workExperience ?? []
  nextValue.education = parsed.education ?? []
  nextValue.skills = parsed.skills ?? []
  nextValue.languages = parsed.languages ?? []
  nextValue.projects = parsed.projects ?? []

  return normalizeResumeData(nextValue)
}
