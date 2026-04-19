export type LanguageProficiency = 'Native' | 'Fluent' | 'Advanced' | 'Intermediate' | 'Basic'

export interface SocialLink {
  id: string
  label: string
  url: string
}

export interface WorkExperience {
  id: string
  company: string
  companyUrl: string
  position: string
  location: string
  fromMonth: string
  toMonth: string
  isCurrent: boolean
  description: string
  skills: string[]
}

export interface Education {
  id: string
  institution: string
  degree: string
  field: string
  fromMonth: string
  toMonth: string
  isCurrent: boolean
}

export interface Language {
  id: string
  name: string
  proficiency: LanguageProficiency
}

export interface Skill {
  id: string
  name: string
}

export interface Project {
  id: string
  kind: 'project' | 'certification'
  title: string
  subtitle: string
  issuedAt: string
  link: string
  description: string
}

export interface PersonalInfo {
  fullName: string
  firstName: string
  lastName: string
  middleName: string
  position: string
  location: string
  citizenship: string
  workPermit: string
  workFormats: string[]
  birthDate: string
  gender: string
  age: string
  photo: string
  phone: string
  links: SocialLink[]
}

export interface ResumeData {
  personal: PersonalInfo
  aboutMe: string
  workExperience: WorkExperience[]
  education: Education[]
  skills: Skill[]
  languages: Language[]
  projects: Project[]
}

export interface PdfMetadata {
  title: string
  subject: string
  keywords: string
  author: string
}
