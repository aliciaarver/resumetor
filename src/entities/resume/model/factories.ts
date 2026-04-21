import type { Locale } from '@/types/i18n'
import type { ResumeData } from '@/entities/resume/model/types'

const DEMO_RESUMES: Record<
  Locale,
  Omit<
    ResumeData,
    'personal' | 'workExperience' | 'education' | 'skills' | 'languages' | 'projects'
  > & {
    personal: Omit<ResumeData['personal'], 'links'> & {
      links: Array<Omit<ResumeData['personal']['links'][number], 'id'>>
    }
    workExperience: Array<Omit<ResumeData['workExperience'][number], 'id'>>
    education: Array<Omit<ResumeData['education'][number], 'id'>>
    skills: Array<Omit<ResumeData['skills'][number], 'id'>>
    languages: Array<Omit<ResumeData['languages'][number], 'id'>>
    projects: Array<Omit<ResumeData['projects'][number], 'id'>>
  }
> = {
  ru: {
    personal: {
      fullName: 'Стелла, принцесса Солярии',
      firstName: 'Стелла',
      lastName: 'Солярия',
      middleName: '',
      position: 'Креативный лидер и публичный представитель',
      location: 'Солярия',
      citizenship: 'Солярия',
      workPermit: 'Солярия',
      workFormats: ['Гибрид', 'Проектная работа', 'Публичные мероприятия'],
      birthDate: '',
      gender: 'Женщина',
      age: '',
      photo: '',
      phone: '+39 555 013-88-21',
      links: [
        { label: 'Email', url: 'stella@solaria.example' },
        { label: 'LinkedIn', url: 'https://linkedin.com/in/stella-solaria' },
        { label: 'Telegram', url: 'https://t.me/stella_solaria' },
        { label: 'GitHub', url: 'https://github.com/stella-solaria' },
        { label: 'Link', url: 'https://stella-solaria.example' },
      ],
    },
    aboutMe:
      'Наследная принцесса Солярии, фея Сияющего Солнца и Луны и соосновательница Winx Club. Соединяю королевскую дипломатию, световую магию и сильное чувство стиля: веду публичные инициативы Солярии, проектирую модные коллекции и организую заметные межпланетные события. Сильнее всего работаю там, где нужно вдохновлять людей, защищать команду и превращать яркую идею в узнаваемый образ или событие.',
    workExperience: [
      {
        company: 'Королевство Солярия',
        companyUrl: 'https://stella-solaria.example',
        position: 'Наследная принцесса и защитница Солярии',
        location: 'Солярия',
        fromMonth: '2019-01',
        toMonth: '',
        isCurrent: true,
        description:
          'Представляю Соларию в межпланетных делегациях, защищаю королевство и координирую кризисные инициативы вместе с союзниками из Магикса. Использую магию солнца, луны и звезд для защиты команды, навигации в сложных миссиях и поддержки жителей королевства. Веду публичные выступления, благотворительные балы и культурные проекты, укрепляющие репутацию Солярии.',
        skills: ['Публичные выступления', 'Кризисные коммуникации', 'Event strategy'],
      },
      {
        company: 'Winx Club',
        companyUrl: 'https://winx.example/brand',
        position: 'Соосновательница и ведущая специалистка по световой магии',
        location: 'Магикс',
        fromMonth: '2004-01',
        toMonth: '',
        isCurrent: false,
        description:
          'С самого основания Winx Club отвечаю за боевую и защитную магию света: ставлю щиты, ослепляющие вспышки, телепортацию и работу с артефактами вроде Ring of Solaria. Во время миссий удерживаю командную мораль, быстро принимаю решения в стрессе и часто беру на себя коммуникацию с королевскими дворами и официальными лицами.',
        skills: ['Light magic', 'Командная координация', 'Стрессоустойчивость'],
      },
      {
        company: 'Stella Fashion Atelier',
        companyUrl: 'https://stella-solaria.example/atelier',
        position: 'Fashion designer и креативный консультант',
        location: 'Солярия',
        fromMonth: '2016-09',
        toMonth: '',
        isCurrent: false,
        description:
          'Разрабатываю образы для сценических выступлений, королевских мероприятий и публичных кампаний. Известна сильным чувством цвета, умением быстро собирать визуальную концепцию и превращать стилизацию в часть бренда персонажа, события или команды.',
        skills: ['Creative direction', 'Visual branding', 'Fashion design'],
      },
    ],
    education: [
      {
        institution: 'Алфея, колледж фей',
        degree: 'Фея-хранительница',
        field: 'Световая магия, трансформации и межмировая дипломатия',
        fromMonth: '2004-09',
        toMonth: '2007-06',
        isCurrent: false,
      },
    ],
    skills: [
      { name: 'Публичные выступления' },
      { name: 'Кризисные коммуникации' },
      { name: 'Creative direction' },
      { name: 'Event strategy' },
      { name: 'Visual branding' },
      { name: 'Световая магия' },
    ],
    languages: [
      { name: 'Соларианский', proficiency: 'Native' },
      { name: 'Английский', proficiency: 'Fluent' },
      { name: 'Итальянский', proficiency: 'Advanced' },
    ],
    projects: [
      {
        kind: 'project',
        title: 'Solaria Cultural Gala',
        subtitle: 'Креативный лидер и официальный спикер',
        issuedAt: '',
        link: 'https://stella-solaria.example/gala',
        description:
          'Курировала визуальную концепцию, публичную программу и межкоролевскую координацию ежегодного культурного бала Солярии.',
      },
      {
        kind: 'certification',
        title: 'Ring of Solaria Training',
        subtitle: 'Программа развития магических артефактов',
        issuedAt: '2024-01',
        link: '',
        description:
          'Разработала и провела серию тренировок по безопасному использованию и демонстрации артефактов света для союзных команд.',
      },
    ],
  },
  en: {
    personal: {
      fullName: 'Stella, Princess of Solaria',
      firstName: 'Stella',
      lastName: 'Solaria',
      middleName: '',
      position: 'Creative lead and public-facing representative',
      location: 'Solaria',
      citizenship: 'Solaria',
      workPermit: 'Solaria',
      workFormats: ['Hybrid', 'Project-based', 'Public events'],
      birthDate: '',
      gender: 'Female',
      age: '',
      photo: '',
      phone: '+39 555 013-88-21',
      links: [
        { label: 'Email', url: 'stella@solaria.example' },
        { label: 'LinkedIn', url: 'https://linkedin.com/in/stella-solaria' },
        { label: 'Telegram', url: 'https://t.me/stella_solaria' },
        { label: 'GitHub', url: 'https://github.com/stella-solaria' },
        { label: 'Link', url: 'https://stella-solaria.example' },
      ],
    },
    aboutMe:
      'Crown Princess of Solaria, Fairy of the Shining Sun and Moon, and a founding member of the Winx Club. I combine royal diplomacy, light-based magic, and a strong fashion instinct to lead public initiatives, protect my world, and turn bold concepts into memorable experiences. My strongest work happens where visibility, team morale, and fast creative decision-making matter most.',
    workExperience: [
      {
        company: 'Kingdom of Solaria',
        companyUrl: 'https://stella-solaria.example',
        position: 'Crown Princess and Guardian Fairy of Solaria',
        location: 'Solaria',
        fromMonth: '2019-01',
        toMonth: '',
        isCurrent: true,
        description:
          'Represent Solaria in interplanetary diplomacy, protect the realm during magical crises, and lead highly visible royal and cultural initiatives. Use sun, moon, and star magic for shielding, illumination, teleportation, and team support, while serving as one of the most public-facing figures of the kingdom.',
        skills: ['Public speaking', 'Crisis communication', 'Event strategy'],
      },
      {
        company: 'Winx Club',
        companyUrl: 'https://winx.example/brand',
        position: 'Co-Founder and Light Magic Specialist',
        location: 'Magix',
        fromMonth: '2004-01',
        toMonth: '',
        isCurrent: false,
        description:
          'Since the club’s formation, I have been one of its core combat and support fairies, responsible for light shields, blinding attacks, teleportation, and fast coordination under pressure. I often act as the team’s morale driver and as a bridge between magical institutions, royals, and the Winx.',
        skills: ['Light magic', 'Team coordination', 'Stakeholder communication'],
      },
      {
        company: 'Stella Fashion Atelier',
        companyUrl: 'https://stella-solaria.example/atelier',
        position: 'Fashion Designer and Creative Consultant',
        location: 'Solaria',
        fromMonth: '2016-09',
        toMonth: '',
        isCurrent: false,
        description:
          'Design looks for performances, royal events, and public appearances. Known for a sharp eye for color, styling, and visual identity, with a natural ability to turn wardrobe choices into memorable personal and event branding.',
        skills: ['Creative direction', 'Visual branding', 'Fashion design'],
      },
    ],
    education: [
      {
        institution: 'Alfea College for Fairies',
        degree: 'Guardian Fairy Training',
        field: 'Light Magic, Transformations, and Interdimensional Diplomacy',
        fromMonth: '2004-09',
        toMonth: '2007-06',
        isCurrent: false,
      },
    ],
    skills: [
      { name: 'Public speaking' },
      { name: 'Crisis communication' },
      { name: 'Creative direction' },
      { name: 'Event strategy' },
      { name: 'Visual branding' },
      { name: 'Light magic' },
    ],
    languages: [
      { name: 'Solarian', proficiency: 'Native' },
      { name: 'English', proficiency: 'Fluent' },
      { name: 'Italian', proficiency: 'Advanced' },
    ],
    projects: [
      {
        kind: 'project',
        title: 'Solaria Cultural Gala',
        subtitle: 'Creative Lead and Official Spokesperson',
        issuedAt: '',
        link: 'https://stella-solaria.example/gala',
        description:
          'Led the visual identity, public program, and cross-kingdom coordination for Solaria’s flagship cultural event.',
      },
      {
        kind: 'certification',
        title: 'Ring of Solaria Training',
        subtitle: 'Artifact Readiness Program',
        issuedAt: '2024-01',
        link: '',
        description:
          'Designed and delivered a training program focused on safe use and presentation of light-based artifacts for allied teams.',
      },
    ],
  },
}

export function createEmptyResume(): ResumeData {
  return {
    personal: {
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
    },
    aboutMe: '',
    workExperience: [],
    education: [],
    skills: [],
    languages: [],
    projects: [],
  }
}

export function createDemoResume(locale: Locale = detectPreferredLocale()): ResumeData {
  const demo = DEMO_RESUMES[locale]

  return {
    personal: {
      ...demo.personal,
      links: demo.personal.links.map((link, index) => ({
        id: `demo-link-${index + 1}`,
        ...link,
      })),
    },
    aboutMe: demo.aboutMe,
    workExperience: demo.workExperience.map((entry, index) => ({
      id: `demo-work-${index + 1}`,
      ...entry,
      skills: entry.skills ?? [],
    })),
    education: demo.education.map((entry, index) => ({
      id: `demo-edu-${index + 1}`,
      ...entry,
    })),
    skills: demo.skills.map((entry, index) => ({
      id: `demo-skill-${index + 1}`,
      ...entry,
    })),
    languages: demo.languages.map((entry, index) => ({
      id: `demo-lang-${index + 1}`,
      ...entry,
    })),
    projects: demo.projects.map((entry, index) => ({
      id: `demo-project-${index + 1}`,
      ...entry,
    })),
  }
}

function detectPreferredLocale(): Locale {
  if (typeof navigator === 'undefined') {
    return 'en'
  }

  return navigator.language.toLowerCase().startsWith('ru') ? 'ru' : 'en'
}
