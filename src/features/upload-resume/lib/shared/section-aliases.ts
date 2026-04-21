export const SECTION_ALIASES = {
  about: [
    'about me', 'about', 'summary', 'profile', 'objective',
    'professional summary', 'career summary', 'executive summary', 'professional profile',
    'обо мне', 'о себе', 'профиль', 'кратко о себе', 'профессиональный профиль',
    'дополнительная информация', 'additional information',
  ],
  experience: [
    'experience', 'work experience', 'employment', 'career',
    'professional experience', 'work history', 'relevant experience',
    'опыт работы', 'опыт', 'работа', 'профессиональный опыт', 'трудовой опыт',
  ],
  education: [
    'education', 'academic', 'qualifications', 'studies', 'academic background',
    'образование', 'обучение',
  ],
  skills: [
    'skills', 'technical skills', 'core skills', 'key skills', 'competencies',
    'навыки', 'ключевые навыки', 'технические навыки', 'компетенции', 'стек',
  ],
  languages: [
    'languages', 'language', 'language skills', 'foreign languages', 'language proficiency',
    'языки', 'знание языков', 'владение языками', 'иностранные языки',
  ],
  projects: [
    'projects', 'project experience', 'selected projects', 'certifications', 'certificates',
    'проекты', 'проектный опыт', 'избранные проекты', 'сертификаты', 'сертификации',
  ],
} as const

export type SectionKey = keyof typeof SECTION_ALIASES
