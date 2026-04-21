export const MONTH_PATTERN =
  'jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?|янв(?:арь|аря)?|фев(?:раль|раля)?|мар(?:т|та)?|апр(?:ель|еля)?|ма[йя]|июн(?:ь|я)?|июл(?:ь|я)?|авг(?:уст|уста)?|сен(?:тябрь|тября)?|окт(?:ябрь|ября)?|ноя(?:брь|бря)?|дек(?:абрь|абря)?'

export const MONTH_YEAR_RE = new RegExp(
  `(?:${MONTH_PATTERN})\\s+\\d{4}|\\d{4}[.-]\\d{2}|\\d{1,2}\\/\\d{4}|\\d{4}\\s*[-–—]\\s*(?:\\d{4}|present|current|now|по\\s*наст)`,
  'gi',
)

export const EMAIL_RE = /[\w.+-]+@[\w-]+\.[a-z]{2,}/i
export const PHONE_RE = /(\+?\d[\d\s()\-]{6,}\d)/
export const URL_RE = /https?:\/\/[^\s]+|(?:www|github|linkedin|t\.me|telegram|vk\.company)[.\w/\-?=&%#@]+/i
export const DATE_RE = new RegExp(MONTH_YEAR_RE.source, 'i')
export const CURRENT_MARKER_RE = /present|current|now|по\s*наст/i
export const HH_RESUME_UPDATED_RE = /(?:резюме обновлено|resume updated)/i
export const HH_SKIP_SECTIONS_RE =
  /^(?:желаемая должность и зарплата|желаемая должность|специализации|опыт вождения|additional information)$/i
export const PROFICIENCY_RE =
  /\b(c[12]|b[12]|a[12])\b|native|fluent|advanced|intermediate|basic|beginner|родной|свободно|продвинутый|средний|базовый/i
export const EXPERIENCE_KEYWORD_RE =
  /\b(engineer|developer|manager|analyst|designer|consultant|lead|director|architect|specialist|intern|owner|founder|qa|tester|devops|product|project|marketing|sales|recruiter|accountant|администратор|аналитик|архитектор|дизайнер|директор|инженер|консультант|менеджер|разработчик|руководитель|специалист|стаж[её]р|тестировщик|маркетолог|продакт|проектный|проджект)\b/i
export const EXPERIENCE_ACTION_RE =
  /\b(led|built|developed|implemented|optimized|launched|managed|designed|created|improved|delivered|разработал|разработала|внедрил|внедрила|запустил|запустила|оптимизировал|оптимизировала|руководил|руководила|создал|создала|улучшил|улучшила)\b/i
export const COMPANY_RE = /\b(inc|llc|ltd|corp|company|group|studio|agency|gmbh|s\.?a\.?|ooo|ооо|зао|пао|ao|ip|ип)\b/i
export const EDUCATION_KEYWORD_RE =
  /\b(university|institute|college|academy|school|faculty|department|lyceum|bachelor|master|phd|doctorate|associate|gpa|курс|курсы|университет|институт|академия|колледж|лицей|школа|факультет|кафедра|бакалавр|магистр|аспирант|специалист)\b/i
export const ABOUT_KEYWORD_RE = /\b(summary|profile|objective|overview|highlights|about|обо мне|о себе|профиль|кратко о себе)\b/i
export const SKILL_KEYWORD_RE =
  /\b(skill|skills|stack|tech stack|tooling|technologies|frameworks|libraries|tools|навык|навыки|стек|технологии|инструменты|фреймворки|библиотеки)\b/i
export const PROJECT_KEYWORD_RE =
  /\b(project|projects|case study|portfolio|certification|certificate|credential|badge|initiative|launch|integration|migration|проект|проекты|портфолио|кейс|сертификат|сертификация|инициатива|миграция|внедрение)\b/i
export const SKILL_TOKEN_RE =
  /\b(react|vue|angular|svelte|typescript|javascript|node\.?js|nestjs|express|python|django|flask|fastapi|java|kotlin|swift|php|laravel|go|golang|rust|sql|postgres(?:ql)?|mysql|mongodb|redis|docker|kubernetes|aws|gcp|azure|terraform|ansible|graphql|rest|figma|photoshop|illustrator|sketch|jira|confluence|git|github|gitlab|ci\/cd|linux|html|css|sass|webpack|vite|nuxt|next\.?js|tailwind|pinia|vuex|rxjs|c\+\+|c#|\.net|excel|power bi|tableau|scrum|kanban|аналитика|управление|маркетинг|дизайн|продажи|переговоры|презентации)\b/i
export const KNOWN_CITIES_RE =
  /^(?:москва|санкт-петербург|спб|питер|екатеринбург|новосибирск|казань|нижний новгород|самара|омск|уфа|краснодар|воронеж|пермь|волгоград|ростов|саратов|тюмень|тольятти|барнаул|ижевск|красноярск|москве|moscow|saint.?petersburg|novosibirsk)$/i
