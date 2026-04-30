import { resolveParserFeatureFlags, } from '@/utils/parserFeatureFlags';
const SECTION_ALIASES = {
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
};
// hh.ru specific section headings that should be skipped entirely (not assigned to any bucket)
const HH_SKIP_SECTIONS_RE = /^(?:желаемая должность и зарплата|желаемая должность|специализации|опыт вождения|additional information)$/i;
const MONTH_PATTERN = 'jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?|янв(?:арь|аря)?|фев(?:раль|раля)?|мар(?:т|та)?|апр(?:ель|еля)?|ма[йя]|июн(?:ь|я)?|июл(?:ь|я)?|авг(?:уст|уста)?|сен(?:тябрь|тября)?|окт(?:ябрь|ября)?|ноя(?:брь|бря)?|дек(?:абрь|абря)?';
const MONTH_YEAR_RE = new RegExp(`(?:${MONTH_PATTERN})\\s+\\d{4}|\\d{4}[.-]\\d{2}|\\d{1,2}\\/\\d{4}|\\d{4}\\s*[-–—]\\s*(?:\\d{4}|present|current|now|по\\s*наст)`, 'gi');
const HUMAN_LANGUAGE_NAMES = new Set([
    'английский', 'english',
    'русский', 'russian',
    'немецкий', 'german', 'deutsch',
    'французский', 'french',
    'испанский', 'spanish',
    'итальянский', 'italian',
    'португальский', 'portuguese',
    'китайский', 'chinese', 'mandarin', 'cantonese',
    'японский', 'japanese',
    'корейский', 'korean',
    'арабский', 'arabic',
    'турецкий', 'turkish',
    'польский', 'polish',
    'украинский', 'ukrainian',
    'белорусский', 'belarusian',
    'чешский', 'czech',
    'словацкий', 'slovak',
    'румынский', 'romanian',
    'венгерский', 'hungarian',
    'болгарский', 'bulgarian',
    'сербский', 'serbian',
    'хорватский', 'croatian',
    'нидерландский', 'dutch',
    'голландский',
    'шведский', 'swedish',
    'норвежский', 'norwegian',
    'датский', 'danish',
    'финский', 'finnish',
    'греческий', 'greek',
    'иврит', 'hebrew',
    'хинди', 'hindi',
    'тайский', 'thai',
    'вьетнамский', 'vietnamese',
    'индонезийский', 'indonesian',
    'казахский', 'kazakh',
    'узбекский', 'uzbek',
]);
const CEFR_LEVEL_MAP = {
    c2: 'Fluent',
    c1: 'Advanced',
    b2: 'Intermediate',
    b1: 'Intermediate',
    a2: 'Basic',
    a1: 'Basic',
};
const WORD_LEVEL_MAP = {
    native: 'Native', родной: 'Native',
    fluent: 'Fluent', свободно: 'Fluent',
    advanced: 'Advanced', продвинутый: 'Advanced',
    intermediate: 'Intermediate', средний: 'Intermediate',
    basic: 'Basic', beginner: 'Basic', базовый: 'Basic',
};
const EMAIL_RE = /[\w.+-]+@[\w-]+\.[a-z]{2,}/i;
const PHONE_RE = /(\+?\d[\d\s()\-]{6,}\d)/;
const URL_RE = /https?:\/\/[^\s]+|(?:www|github|linkedin|t\.me|telegram|vk\.company)[.\w/\-?=&%#@]+/i;
const DATE_RE = new RegExp(MONTH_YEAR_RE.source, 'i');
const CURRENT_MARKER_RE = /present|current|now|по\s*наст/i;
const HH_RESUME_UPDATED_RE = /(?:резюме обновлено|resume updated)/i;
const LANGUAGE_NAME_RE = new RegExp(`(${[...HUMAN_LANGUAGE_NAMES].join('|')})`, 'gi');
const PROFICIENCY_RE = /\b(c[12]|b[12]|a[12])\b|native|fluent|advanced|intermediate|basic|beginner|родной|свободно|продвинутый|средний|базовый/i;
const EXPERIENCE_KEYWORD_RE = /\b(engineer|developer|manager|analyst|designer|consultant|lead|director|architect|specialist|intern|owner|founder|qa|tester|devops|product|project|marketing|sales|recruiter|accountant|администратор|аналитик|архитектор|дизайнер|директор|инженер|консультант|менеджер|разработчик|руководитель|специалист|стаж[её]р|тестировщик|маркетолог|продакт|проектный|проджект)\b/i;
const EXPERIENCE_ACTION_RE = /\b(led|built|developed|implemented|optimized|launched|managed|designed|created|improved|delivered|разработал|разработала|внедрил|внедрила|запустил|запустила|оптимизировал|оптимизировала|руководил|руководила|создал|создала|улучшил|улучшила)\b/i;
const COMPANY_RE = /\b(inc|llc|ltd|corp|company|group|studio|agency|gmbh|s\.?a\.?|ooo|ооо|зао|пао|ao|ip|ип)\b/i;
const EDUCATION_KEYWORD_RE = /\b(university|institute|college|academy|school|faculty|department|lyceum|bachelor|master|phd|doctorate|associate|gpa|курс|курсы|университет|институт|академия|колледж|лицей|школа|факультет|кафедра|бакалавр|магистр|аспирант|специалист)\b/i;
const ABOUT_KEYWORD_RE = /\b(summary|profile|objective|overview|highlights|about|обо мне|о себе|профиль|кратко о себе)\b/i;
const SKILL_KEYWORD_RE = /\b(skill|skills|stack|tech stack|tooling|technologies|frameworks|libraries|tools|навык|навыки|стек|технологии|инструменты|фреймворки|библиотеки)\b/i;
const PROJECT_KEYWORD_RE = /\b(project|projects|case study|portfolio|certification|certificate|credential|badge|initiative|launch|integration|migration|проект|проекты|портфолио|кейс|сертификат|сертификация|инициатива|миграция|внедрение)\b/i;
const SKILL_TOKEN_RE = /\b(react|vue|angular|svelte|typescript|javascript|node\.?js|nestjs|express|python|django|flask|fastapi|java|kotlin|swift|php|laravel|go|golang|rust|sql|postgres(?:ql)?|mysql|mongodb|redis|docker|kubernetes|aws|gcp|azure|terraform|ansible|graphql|rest|figma|photoshop|illustrator|sketch|jira|confluence|git|github|gitlab|ci\/cd|linux|html|css|sass|webpack|vite|nuxt|next\.?js|tailwind|pinia|vuex|rxjs|c\+\+|c#|\.net|excel|power bi|tableau|scrum|kanban|аналитика|управление|маркетинг|дизайн|продажи|переговоры|презентации)\b/i;
function isSectionHeading(line) {
    if (line.includes(':') && line.length > 24)
        return false;
    if (line.length > 40)
        return false;
    return line.split(/\s+/).length <= 4;
}
function detectSection(line) {
    const trimmed = normalizeHeading(line);
    if (!trimmed || !isSectionHeading(trimmed))
        return null;
    for (const [key, aliases] of Object.entries(SECTION_ALIASES)) {
        if (aliases.includes(trimmed))
            return key;
    }
    return null;
}
function collectExplicitSectionBuckets(lines) {
    const buckets = {
        about: [],
        experience: [],
        education: [],
        skills: [],
        languages: [],
        projects: [],
    };
    let current = null;
    for (const line of lines) {
        if (HH_SKIP_SECTIONS_RE.test(line.trim())) {
            current = null;
            continue;
        }
        const explicit = detectSection(line);
        if (explicit) {
            current = explicit;
            continue;
        }
        if (current) {
            buckets[current].push(line);
        }
    }
    return buckets;
}
function detectParserProfile(lines) {
    const text = lines.join('\n').toLowerCase();
    if (/желаемая должность|резюме обновлено|опыт вождения|гражданство|проживает|готова к переезду/i.test(text) ||
        /опыт работы/.test(text)) {
        return 'hh_ru';
    }
    if (/\babout\b/.test(text) &&
        /\bskills\b/.test(text) &&
        /\bexperience\b/.test(text) &&
        /\beducation\b/.test(text)) {
        return 'en_cv';
    }
    return 'generic';
}
function normalizeHeading(line) {
    return line
        .trim()
        .toLowerCase()
        .replace(/[.:]+$/, '')
        // strip trailing "— 5 лет 5 месяцев" or "— 5+ years" style suffixes
        .replace(/\s*[-–—]\s*\d.*$/, '')
        .replace(/\s+/g, ' ')
        .trim();
}
function matchProficiency(context) {
    // CEFR level takes priority: C1, B2, etc.
    const cefrMatch = context.match(/\b(c[12]|b[12]|a[12])\b/i);
    if (cefrMatch)
        return CEFR_LEVEL_MAP[cefrMatch[1].toLowerCase()] ?? 'Intermediate';
    // Fall back to descriptive words
    const wordMatch = context.match(/(native|fluent|advanced|intermediate|basic|beginner|родной|свободно|продвинутый|средний|базовый)/i);
    if (wordMatch)
        return WORD_LEVEL_MAP[wordMatch[1].toLowerCase()] ?? 'Intermediate';
    return 'Intermediate';
}
function parseMonthYear(str) {
    const months = {
        jan: '01', january: '01', feb: '02', february: '02',
        mar: '03', march: '03', apr: '04', april: '04',
        may: '05', jun: '06', june: '06', jul: '07', july: '07',
        aug: '08', august: '08', sep: '09', september: '09',
        oct: '10', october: '10', nov: '11', november: '11',
        dec: '12', december: '12',
        янв: '01', январь: '01', января: '01',
        фев: '02', февраль: '02', февраля: '02',
        мар: '03', март: '03', марта: '03',
        апр: '04', апрель: '04', апреля: '04',
        май: '05', мая: '05',
        июн: '06', июнь: '06', июня: '06',
        июл: '07', июль: '07', июля: '07',
        авг: '08', август: '08', августа: '08',
        сен: '09', сентябрь: '09', сентября: '09',
        окт: '10', октябрь: '10', октября: '10',
        ноя: '11', ноябрь: '11', ноября: '11',
        дек: '12', декабрь: '12', декабря: '12',
    };
    // YYYY-MM or YYYY.MM (but not YYYY-YYYY range)
    const iso = str.match(/(\d{4})[.-](\d{2})(?!\d{2})/);
    if (iso)
        return `${iso[1]}-${iso[2]}`;
    // MM/YYYY
    const slash = str.match(/(\d{1,2})\/(\d{4})/);
    if (slash)
        return `${slash[2]}-${slash[1].padStart(2, '0')}`;
    // Month YYYY
    const wordy = str.match(/([a-zа-яё.]+)\s+(\d{4})/i);
    if (wordy) {
        const m = months[wordy[1].toLowerCase().replace('.', '')];
        if (m)
            return `${wordy[2]}-${m}`;
    }
    // YYYY – YYYY or YYYY – present: extract the first year only
    const yearRange = str.match(/^(\d{4})\s*[-–—]/);
    if (yearRange)
        return yearRange[1];
    // Bare YYYY
    const bareYear = str.match(/^(\d{4})$/);
    if (bareYear)
        return bareYear[1];
    return '';
}
function extractDates(text) {
    const current = CURRENT_MARKER_RE.test(text);
    const rawMatches = [...text.matchAll(new RegExp(MONTH_YEAR_RE.source, 'gi'))]
        .map((m) => m[0].trim())
        .filter(Boolean);
    // Expand "YYYY – YYYY" single-match ranges into two separate entries
    const dates = [];
    for (const match of rawMatches) {
        const rangeMatch = match.match(/^(\d{4})\s*[-–—]\s*(\d{4})$/);
        if (rangeMatch) {
            dates.push(rangeMatch[1], rangeMatch[2]);
        }
        else {
            dates.push(match);
        }
    }
    const from = dates[0] ? parseMonthYear(dates[0]) : '';
    const to = !current && dates[1] ? parseMonthYear(dates[1]) : '';
    return { from, to, isCurrent: current };
}
export function parseTextToResumeDetailed(text, options = {}) {
    const rawLines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    const lines = stripFooterLines(rawLines);
    const profile = detectParserProfile(lines);
    const genericLinkLabel = options.genericLinkLabel ?? 'Link';
    const featureFlags = resolveParserFeatureFlags(options.featureFlags);
    const result = {
        personal: parsePersonalInfo(lines.slice(0, 35), genericLinkLabel),
        aboutMe: '',
        workExperience: [],
        education: [],
        skills: [],
        languages: [],
        projects: [],
    };
    const sectionBuckets = {
        about: [],
        experience: [],
        education: [],
        skills: [],
        languages: [],
        projects: [],
    };
    const explicitSectionBuckets = collectExplicitSectionBuckets(lines);
    const analyzedLines = lines.map((line, index) => analyzeLine(line, index, lines.length));
    let currentSection = null;
    let inExplicitSection = false;
    let structuredSectionSeen = false;
    let inHhSkipSection = false;
    for (let index = 0; index < analyzedLines.length; index++) {
        const line = analyzedLines[index];
        const previousLine = analyzedLines[index - 1];
        const nextLine = analyzedLines[index + 1];
        // hh.ru: "Желаемая должность и зарплата" block — skip but capture position
        if (HH_SKIP_SECTIONS_RE.test(line.text.trim())) {
            inHhSkipSection = true;
            currentSection = null;
            inExplicitSection = false;
            continue;
        }
        if (line.explicitSection) {
            inHhSkipSection = false;
            currentSection = line.explicitSection;
            inExplicitSection = true;
            structuredSectionSeen = line.explicitSection !== 'about';
            continue;
        }
        // Inside hh.ru skip section: capture position if not yet found
        if (inHhSkipSection) {
            const trimmed = line.text.trim();
            // Position is a short non-meta line that looks like a job title
            if (!result.personal.position &&
                trimmed.length > 2 &&
                trimmed.length <= 100 &&
                !looksLikePersonalMetaLine(trimmed) &&
                !looksLikeDurationSummary(trimmed) &&
                !HH_SKIP_SECTIONS_RE.test(trimmed) &&
                !/^(?:специализации|занятость|график работы|желательное время|опыт вождения)/i.test(trimmed) &&
                !/^[—\-•]/.test(trimmed)) {
                result.personal.position = trimmed;
            }
            continue;
        }
        if (line.isContactLike && line.index < 12) {
            continue;
        }
        if (looksLikeTopPersonalMeta(line.text, line.index)) {
            continue;
        }
        if (inExplicitSection && currentSection) {
            sectionBuckets[currentSection].push(line.text);
            if (currentSection !== 'about') {
                structuredSectionSeen = true;
            }
            continue;
        }
        const startsExperienceEntryWithFollowingDate = !line.explicitSection &&
            !line.hasDate &&
            !line.isBullet &&
            !line.isContactLike &&
            Boolean(nextLine?.hasDate) &&
            line.text.length <= 120;
        const likelyInsideExperienceFlow = currentSection === 'experience' ||
            previousLine?.bestSection === 'experience' ||
            previousLine?.bestSection === 'skills' ||
            /^(?:stack|стек)\s*:/i.test(previousLine?.text ?? '');
        if (likelyInsideExperienceFlow && startsExperienceEntryWithFollowingDate) {
            currentSection = 'experience';
            inExplicitSection = true;
            sectionBuckets.experience.push(line.text);
            structuredSectionSeen = true;
            continue;
        }
        const inferredSection = inferSectionForLine(line, previousLine, nextLine, currentSection, structuredSectionSeen, featureFlags);
        if (featureFlags.enableExplicitSectionOverrides &&
            inExplicitSection &&
            currentSection &&
            inferredSection &&
            inferredSection !== currentSection) {
            const shouldKeepExplicitExperience = currentSection === 'experience' &&
                inferredSection === 'skills' &&
                !line.explicitSection;
            const shouldKeepExplicitAbout = currentSection === 'about' &&
                inferredSection === 'experience' &&
                !line.explicitSection;
            if (shouldKeepExplicitExperience || shouldKeepExplicitAbout) {
                // Stay inside the explicit EXPERIENCE block even on stack-heavy lines.
            }
            else {
                const currentScore = line.scores[currentSection];
                const inferredScore = line.scores[inferredSection];
                if (inferredScore >= currentScore + 2 && inferredScore >= 5) {
                    currentSection = inferredSection;
                    inExplicitSection = false;
                }
            }
        }
        if (!currentSection || !inExplicitSection) {
            if (inferredSection) {
                if (currentSection === 'experience' &&
                    inferredSection === 'skills' &&
                    /^(?:stack|стек)\s*:/i.test(line.text)) {
                    currentSection = 'experience';
                }
                else if (currentSection === 'about' &&
                    inferredSection === 'experience' &&
                    !line.explicitSection) {
                    currentSection = 'about';
                }
                else {
                    currentSection = inferredSection;
                }
            }
            else if (featureFlags.enableAboutFallbackInference && !structuredSectionSeen && looksLikeAboutFallback(line)) {
                currentSection = 'about';
            }
        }
        if (!currentSection) {
            continue;
        }
        if (!inferredSection && !shouldContinueSection(currentSection, line, previousLine, nextLine, featureFlags)) {
            if (featureFlags.enableAboutFallbackInference && !structuredSectionSeen && looksLikeAboutFallback(line)) {
                sectionBuckets.about.push(line.text);
            }
            continue;
        }
        sectionBuckets[currentSection].push(line.text);
        if (currentSection !== 'about') {
            structuredSectionSeen = true;
        }
    }
    result.aboutMe = parseAboutBlock(sectionBuckets.about);
    const inferredWorkExperience = parseExperienceBlock(sectionBuckets.experience, profile);
    const explicitWorkExperience = explicitSectionBuckets.experience.length
        ? parseExperienceBlock(stripFooterLines(explicitSectionBuckets.experience), profile)
        : [];
    const inferredWorkScore = scoreWorkEntries(inferredWorkExperience, sectionBuckets.experience);
    const explicitWorkScore = scoreWorkEntries(explicitWorkExperience, explicitSectionBuckets.experience);
    result.workExperience = explicitWorkScore > inferredWorkScore
        ? explicitWorkExperience
        : inferredWorkExperience;
    result.education = parseEducationBlock(sectionBuckets.education);
    const inferredSkills = parseSkillsBlock(sectionBuckets.skills, profile);
    const explicitSkills = explicitSectionBuckets.skills.length
        ? parseSkillsBlock(stripFooterLines(explicitSectionBuckets.skills), profile)
        : [];
    const inferredSkillsScore = scoreSkills(inferredSkills, sectionBuckets.skills);
    const explicitSkillsScore = scoreSkills(explicitSkills, explicitSectionBuckets.skills);
    result.skills = explicitSkillsScore > inferredSkillsScore
        ? explicitSkills
        : inferredSkills;
    result.languages = parseLanguagesBlock(sectionBuckets.languages);
    result.projects = parseProjectsBlock(sectionBuckets.projects);
    const effectiveExperienceRaw = explicitWorkScore > inferredWorkScore
        ? stripFooterLines(explicitSectionBuckets.experience)
        : sectionBuckets.experience;
    const effectiveSkillsRaw = explicitSkillsScore > inferredSkillsScore
        ? stripFooterLines(explicitSectionBuckets.skills)
        : sectionBuckets.skills;
    return {
        resume: result,
        blocks: buildParseBlockMetrics(result, {
            ...sectionBuckets,
            experience: effectiveExperienceRaw,
            skills: effectiveSkillsRaw,
        }, lines),
    };
}
export function parseTextToResume(text, options = {}) {
    return parseTextToResumeDetailed(text, options).resume;
}
function parsePersonalInfo(lines, genericLinkLabel) {
    const personal = {
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
    };
    const seenLinks = new Set();
    for (const line of lines) {
        const emailMatch = line.match(new RegExp(EMAIL_RE.source, 'i'));
        if (emailMatch) {
            const email = emailMatch[0];
            if (!seenLinks.has(email)) {
                personal.links.push({
                    id: crypto.randomUUID(),
                    label: 'Email',
                    url: email,
                });
                seenLinks.add(email);
            }
        }
        const phoneMatch = line.match(PHONE_RE);
        if (phoneMatch && !personal.phone) {
            personal.phone = phoneMatch[0];
        }
        const urlRe = new RegExp(URL_RE.source, 'gi');
        let urlMatch;
        while ((urlMatch = urlRe.exec(line)) !== null) {
            const url = urlMatch[0];
            if (seenLinks.has(url))
                continue;
            const lowerUrl = url.toLowerCase();
            const label = lowerUrl.includes('github') ? 'GitHub'
                : lowerUrl.includes('linkedin') ? 'LinkedIn'
                    : lowerUrl.includes('t.me') || lowerUrl.includes('telegram') ? 'Telegram'
                        : genericLinkLabel;
            personal.links.push({
                id: crypto.randomUUID(),
                label,
                url,
            });
            seenLinks.add(url);
        }
    }
    for (const line of lines) {
        if (!EMAIL_RE.test(line) &&
            !PHONE_RE.test(line) &&
            !URL_RE.test(line) &&
            line.length > 2 &&
            line.length < 60 &&
            !detectSection(line)) {
            personal.fullName = line;
            break;
        }
    }
    applyNameParts(personal);
    const remainingLines = lines.filter((line) => !EMAIL_RE.test(line) &&
        !PHONE_RE.test(line) &&
        !URL_RE.test(line) &&
        !detectSection(line) &&
        !HH_RESUME_UPDATED_RE.test(line));
    // Birth date: explicit label "Дата рождения: 19 декабря 1999" OR standalone Russian text date
    const RU_DATE_IN_LINE_RE = /\d{1,2}\s+(?:января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)\s+\d{4}/i;
    const birthLine = remainingLines.find((line) => /\b(?:дата рождения|birth date|born)\b/i.test(line) ||
        RU_DATE_IN_LINE_RE.test(line));
    if (birthLine) {
        personal.birthDate = normalizeBirthDate(birthLine.replace(/\b(?:дата рождения|birth date|born|родилась|родился)\b[:\s-]*/i, '').trim());
    }
    const genderAgeLine = remainingLines.find((line) => looksLikeGenderAgeLine(line));
    if (genderAgeLine) {
        const genderMatch = genderAgeLine.match(/(?:^|\s)(женщина|мужчина|female|male)(?:\s|,|$)/i);
        const ageMatch = genderAgeLine.match(/(\d{1,2})\s*(лет|года|год|years?|yrs?)(?:\s|,|$)/i);
        personal.gender = genderMatch?.[1]?.trim() ?? '';
        personal.age = ageMatch ? `${ageMatch[1]} ${ageMatch[2]}`.trim() : '';
        if (!personal.birthDate) {
            const trailingBirth = genderAgeLine.match(/(?:родил[а-я]*|born)\s*([0-9]{1,2}[.\-/][0-9]{1,2}[.\-/][0-9]{2,4}|[0-9]{4}-[0-9]{2}-[0-9]{2})/i);
            if (trailingBirth?.[1]) {
                personal.birthDate = normalizeBirthDate(trailingBirth[1]);
            }
            // Also check for Russian text date in the gender/age line
            if (!personal.birthDate) {
                const ruInGenderLine = genderAgeLine.match(RU_DATE_IN_LINE_RE);
                if (ruInGenderLine) {
                    personal.birthDate = normalizeBirthDate(ruInGenderLine[0]);
                }
            }
        }
    }
    // "Проживает: Москва" → location
    const livesInLine = remainingLines.find((line) => /^проживает[:\s]/i.test(line));
    if (livesInLine && !personal.location) {
        personal.location = livesInLine.replace(/^проживает[:\s]*/i, '').trim();
    }
    const citizenshipLine = remainingLines.find((line) => /\b(?:гражданство|citizenship)\b/i.test(line));
    if (citizenshipLine) {
        // hh.ru format: "Гражданство: Россия, есть разрешение на работу: Россия"
        // Extract just the citizenship value (before any "есть разрешение" suffix)
        const citizenshipRaw = citizenshipLine.replace(/\b(?:гражданство|citizenship)\b[:\s-]*/i, '');
        const citizenshipValue = citizenshipRaw.split(/,\s*есть разрешение/i)[0].trim();
        personal.citizenship = citizenshipValue;
        // Also extract work permit from the same line if it contains it
        if (!personal.workPermit && /\bесть разрешение на работу[:\s]*/i.test(citizenshipRaw)) {
            const permitMatch = citizenshipRaw.match(/есть разрешение на работу[:\s]*([^,\n]+)/i);
            if (permitMatch?.[1]) {
                personal.workPermit = permitMatch[1].trim();
            }
        }
    }
    const workPermitLine = remainingLines.find((line) => /\b(?:разрешени[ея] на работу|work permit|имеется разрешение на работу)\b/i.test(line) &&
        line !== citizenshipLine);
    if (workPermitLine) {
        personal.workPermit = workPermitLine.replace(/\b(?:разрешени[ея] на работу|work permit|имеется разрешение на работу|есть разрешение на работу)\b[:\s-]*/i, '').trim();
    }
    const workFormatLine = remainingLines.find((line) => /\b(?:формат(?:ы)? работы|занятость|work format|work formats|employment type)\b/i.test(line) ||
        /\b(?:remote|hybrid|office|onsite|full[- ]time|part[- ]time|contract|freelance|удаленн|гибрид|офис|полный день|частичн|проектная работа)\b/i.test(line));
    if (workFormatLine) {
        personal.workFormats = splitTagList(workFormatLine.replace(/\b(?:формат(?:ы)? работы|занятость|work format|work formats|employment type)\b[:\s-]*/i, ''));
    }
    const photoLine = lines.find((line) => /\b(?:photo|фото)\b/i.test(line) && URL_RE.test(line));
    if (photoLine) {
        const photoMatch = photoLine.match(new RegExp(URL_RE.source, 'i'));
        personal.photo = photoMatch?.[0] ?? '';
    }
    const consumed = new Set([
        personal.fullName,
        genderAgeLine ?? '',
        birthLine ?? '',
        citizenshipLine ?? '',
        workPermitLine ?? '',
        workFormatLine ?? '',
    ]);
    const candidateLines = remainingLines.filter((line) => {
        if (consumed.has(line))
            return false;
        if (DATE_RE.test(line) || CURRENT_MARKER_RE.test(line))
            return false;
        return line.length > 1;
    });
    const locationLine = candidateLines.find((line) => line.length <= 80 &&
        !EXPERIENCE_KEYWORD_RE.test(line) &&
        !looksLikePersonalMetaLine(line));
    if (locationLine) {
        personal.location = normalizePersonalValue(locationLine);
        consumed.add(locationLine);
    }
    const positionLine = candidateLines.find((line) => !consumed.has(line) &&
        line.length <= 100 &&
        !looksLikePersonalMetaLine(line));
    if (positionLine) {
        personal.position = normalizePersonalValue(positionLine);
    }
    return personal;
}
function parseAboutBlock(lines) {
    return lines
        .map((line) => preserveStructuredLine(line))
        .filter((line) => line && !detectSection(line))
        .join('\n')
        .trim();
}
function buildParseBlockMetrics(resume, sectionBuckets, lines) {
    const personal = resume.personal ?? {
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
    };
    const aboutText = resume.aboutMe?.trim() ?? '';
    const workEntries = resume.workExperience ?? [];
    const educationEntries = resume.education ?? [];
    const skills = resume.skills ?? [];
    const languages = resume.languages ?? [];
    const projects = resume.projects ?? [];
    return {
        personal: {
            score: roundScore(clamp01((personal.fullName.trim() ? 0.45 : 0) +
                (personal.position.trim() ? 0.15 : 0) +
                (personal.location.trim() ? 0.1 : 0) +
                (personal.phone.trim() ? 0.2 : 0) +
                Math.min(0.25, (personal.links?.filter((link) => link.url.trim()).length ?? 0) * 0.12))),
            rawText: lines.slice(0, 35).join('\n').trim(),
            extractedCount: countFilledPersonalFields(personal),
        },
        aboutMe: {
            score: roundScore(scoreAboutBlock(aboutText, sectionBuckets.about)),
            rawText: sectionBuckets.about.join('\n').trim(),
            extractedCount: aboutText ? 1 : 0,
        },
        workExperience: {
            score: roundScore(scoreWorkEntries(workEntries, sectionBuckets.experience)),
            rawText: sectionBuckets.experience.join('\n').trim(),
            extractedCount: workEntries.length,
        },
        education: {
            score: roundScore(scoreEducationEntries(educationEntries, sectionBuckets.education)),
            rawText: sectionBuckets.education.join('\n').trim(),
            extractedCount: educationEntries.length,
        },
        skills: {
            score: roundScore(scoreSkills(skills, sectionBuckets.skills)),
            rawText: sectionBuckets.skills.join('\n').trim(),
            extractedCount: skills.length,
        },
        languages: {
            score: roundScore(scoreLanguages(languages, sectionBuckets.languages)),
            rawText: sectionBuckets.languages.join('\n').trim(),
            extractedCount: languages.length,
        },
        projects: {
            score: roundScore(scoreProjects(projects, sectionBuckets.projects)),
            rawText: sectionBuckets.projects.join('\n').trim(),
            extractedCount: projects.length,
        },
    };
}
function analyzeLine(line, index, totalLines) {
    const normalized = normalizeHeading(line);
    const explicitSection = detectSection(line);
    const lower = line.toLowerCase();
    const languageMatches = [...lower.matchAll(new RegExp(LANGUAGE_NAME_RE.source, 'gi'))];
    const hasLanguage = languageMatches.length > 0;
    const hasProficiency = PROFICIENCY_RE.test(line);
    const hasDate = DATE_RE.test(line) || CURRENT_MARKER_RE.test(line);
    const hasExperienceKeyword = EXPERIENCE_KEYWORD_RE.test(line);
    const hasExperienceAction = EXPERIENCE_ACTION_RE.test(line);
    const hasCompanyMarker = COMPANY_RE.test(line);
    const hasEducationKeyword = EDUCATION_KEYWORD_RE.test(line);
    const hasAboutKeyword = ABOUT_KEYWORD_RE.test(line);
    const hasSkillKeyword = SKILL_KEYWORD_RE.test(line) || SKILL_TOKEN_RE.test(line);
    const hasProjectKeyword = PROJECT_KEYWORD_RE.test(line);
    const isContactLike = EMAIL_RE.test(line) || PHONE_RE.test(line) || URL_RE.test(line);
    const isBullet = /^[•·*\-–—]\s+|^\d+[.)]\s+/.test(line);
    const isSentenceLike = line.length > 60 || /[.!?]$/.test(line) || line.split(/\s+/).length > 10;
    const scores = {
        about: 0,
        experience: 0,
        education: 0,
        skills: 0,
        languages: 0,
        projects: 0,
    };
    if (explicitSection) {
        scores[explicitSection] += 10;
    }
    if (hasAboutKeyword)
        scores.about += 4;
    if (isSentenceLike)
        scores.about += index < Math.max(8, totalLines * 0.2) ? 2 : 1;
    if (!hasDate && !hasLanguage && !isContactLike && index < 6 && line.length <= 120)
        scores.about += 1;
    if (hasDate)
        scores.experience += 3;
    if (hasExperienceKeyword)
        scores.experience += 4;
    if (hasCompanyMarker)
        scores.experience += 2;
    if (hasExperienceAction)
        scores.experience += 2;
    if (isBullet && hasExperienceAction)
        scores.experience += 2;
    if (hasEducationKeyword)
        scores.education += 5;
    if (hasDate)
        scores.education += 2;
    if (/gpa|coursework|faculty|department|факультет|кафедра/i.test(line))
        scores.education += 2;
    if (hasSkillKeyword)
        scores.skills += 4;
    if (isBullet && hasSkillKeyword)
        scores.skills += 2;
    if (!hasDate && /[,/|•·]/.test(line) && line.length < 140)
        scores.skills += 1;
    if (hasLanguage)
        scores.languages += Math.min(5, languageMatches.length * 2);
    if (hasProficiency)
        scores.languages += 3;
    if (hasLanguage && /[,/|]/.test(line))
        scores.languages += 1;
    if (hasProjectKeyword)
        scores.projects += 4;
    if (/(https?:\/\/|www\.|github\.com|linkedin\.com|t\.me|telegram)/i.test(line))
        scores.projects += 2;
    if (hasDate)
        scores.projects += 1;
    if (isBullet && (hasProjectKeyword || isSentenceLike))
        scores.projects += 1;
    if (isContactLike) {
        scores.about -= 2;
        scores.experience -= 2;
        scores.education -= 2;
        scores.skills -= 1;
        scores.languages -= 1;
        scores.projects -= 1;
    }
    if (hasLanguage) {
        scores.about -= 2;
        scores.experience -= 3;
        scores.education -= 2;
        scores.skills -= 1;
    }
    if (hasEducationKeyword) {
        scores.experience -= 1;
        scores.about -= 1;
        scores.projects -= 1;
    }
    if (hasExperienceKeyword || hasExperienceAction || hasCompanyMarker) {
        scores.education -= 1;
        scores.projects -= 1;
    }
    if (hasSkillKeyword) {
        scores.about -= 1;
        scores.experience -= 1;
        scores.education -= 1;
    }
    if (hasProjectKeyword) {
        scores.about -= 1;
        scores.skills -= 1;
    }
    const bestSection = pickBestSection(scores, 3);
    return {
        text: line,
        index,
        normalized,
        explicitSection,
        scores,
        bestSection,
        bestScore: bestSection ? scores[bestSection] : 0,
        isContactLike,
        hasDate,
        hasLanguage,
        hasProficiency,
        hasSkillKeyword,
        hasProjectKeyword,
        isBullet,
        isSentenceLike,
    };
}
function inferSectionForLine(line, previousLine, nextLine, currentSection, structuredSectionSeen, featureFlags) {
    const contextualScores = { ...line.scores };
    if (featureFlags.enableContextualSectionBoosts) {
        for (const section of Object.keys(contextualScores)) {
            if (previousLine?.bestSection === section && previousLine.bestScore >= 4) {
                contextualScores[section] += 1.5;
            }
            if (nextLine?.bestSection === section && nextLine.bestScore >= 4) {
                contextualScores[section] += 1;
            }
            if (currentSection === section) {
                contextualScores[section] += 1;
            }
        }
    }
    if (line.isBullet && currentSection === 'experience') {
        contextualScores.experience += 2;
    }
    if (featureFlags.enableAboutFallbackInference && line.isSentenceLike && currentSection === 'about' && !structuredSectionSeen) {
        contextualScores.about += 1.5;
    }
    if (line.hasDate && nextLine?.bestSection === 'education') {
        contextualScores.education += 1.5;
    }
    if (line.hasDate && nextLine?.bestSection === 'experience') {
        contextualScores.experience += 1.5;
    }
    if (line.hasSkillKeyword && currentSection === 'skills') {
        contextualScores.skills += 2;
    }
    if (line.hasProjectKeyword && currentSection === 'projects') {
        contextualScores.projects += 2;
    }
    if (line.hasLanguage && currentSection === 'languages') {
        contextualScores.languages += 2;
    }
    if (!line.hasDate && currentSection === 'education' && previousLine?.bestSection === 'education') {
        contextualScores.education += 1;
    }
    if (currentSection === 'projects' && line.isSentenceLike) {
        contextualScores.projects += 1;
    }
    return pickBestSection(contextualScores, 3);
}
function pickBestSection(scores, threshold) {
    let bestSection = null;
    let bestScore = Number.NEGATIVE_INFINITY;
    for (const section of Object.keys(scores)) {
        const score = scores[section];
        if (score > bestScore) {
            bestScore = score;
            bestSection = section;
        }
    }
    return bestScore >= threshold ? bestSection : null;
}
function looksLikeAboutFallback(line) {
    if (line.isContactLike || line.hasDate || line.hasLanguage)
        return false;
    return line.isSentenceLike || (line.index < 6 && line.text.length > 30);
}
function shouldContinueSection(section, line, previousLine, nextLine, featureFlags) {
    if (line.bestSection === section)
        return true;
    if (section === 'about')
        return line.isSentenceLike && !line.hasDate && !line.hasLanguage;
    if (section === 'skills') {
        return line.hasSkillKeyword || (featureFlags.enableLooseSkillsContinuation &&
            line.isBullet &&
            line.text.length < 120);
    }
    if (section === 'languages') {
        return line.hasLanguage || (featureFlags.enableLooseLanguagesContinuation &&
            line.hasProficiency);
    }
    if (section === 'projects') {
        return line.hasProjectKeyword || (featureFlags.enableLooseProjectsContinuation &&
            (line.isSentenceLike || URL_RE.test(line.text)));
    }
    if (section === 'education') {
        return line.hasDate || EDUCATION_KEYWORD_RE.test(line.text) || previousLine?.bestSection === 'education';
    }
    if (section === 'experience') {
        return (line.hasDate ||
            line.isBullet ||
            EXPERIENCE_KEYWORD_RE.test(line.text) ||
            previousLine?.bestSection === 'experience' ||
            (Boolean(nextLine?.hasDate) &&
                !line.isContactLike &&
                !/^(?:stack|стек)\s*:/i.test(line.text) &&
                line.text.length <= 120) ||
            (looksLikeEntryHeaderPrelude(line.text) && Boolean(nextLine?.hasDate)));
    }
    return false;
}
function cleanLine(value) {
    return value
        .replace(new RegExp(URL_RE.source, 'gi'), '')
        .replace(/\s+/g, ' ')
        .replace(/^[·•\-–—\s]+|[·•\-–—\s]+$/g, '')
        .trim();
}
function preserveStructuredLine(value) {
    return value
        .replace(/\s+$/g, '')
        .replace(/\s+[|¦]+$/g, '')
        .trimEnd();
}
function firstUrl(lines) {
    for (const line of lines) {
        const match = line.match(URL_RE);
        if (match)
            return match[0];
    }
    return '';
}
function splitEntries(lines) {
    const entries = [];
    let current = [];
    for (let index = 0; index < lines.length; index++) {
        const line = lines[index];
        const nextLine = lines[index + 1];
        const hasDate = DATE_RE.test(line) || CURRENT_MARKER_RE.test(line);
        const currentHasDate = current.some((entryLine) => DATE_RE.test(entryLine) || CURRENT_MARKER_RE.test(entryLine));
        const startsCompanyFirstEntry = !hasDate &&
            current.length > 0 &&
            currentHasDate &&
            Boolean(nextLine) &&
            (DATE_RE.test(nextLine) || CURRENT_MARKER_RE.test(nextLine)) &&
            looksLikeEntryHeaderPrelude(line);
        if (startsCompanyFirstEntry) {
            entries.push(current);
            current = [line];
            continue;
        }
        if (hasDate && current.length && currentHasDate) {
            const isSplitDateRangeContinuation = current.length === 1 &&
                (DATE_RE.test(current[0]) || CURRENT_MARKER_RE.test(current[0])) &&
                !looksLikeDurationSummary(line);
            if (isSplitDateRangeContinuation) {
                current.push(line);
                continue;
            }
            entries.push(current);
            current = [line];
            continue;
        }
        current.push(line);
    }
    if (current.length) {
        entries.push(current);
    }
    return entries.filter((entry) => entry.some((line) => DATE_RE.test(line)));
}
function looksLikeJobTitle(line) {
    const wordCount = line.split(/\s+/).length;
    if (line.length > 70 || wordCount > 8)
        return false;
    if (/[.!?]$/.test(line))
        return false;
    if (/^\d/.test(line))
        return false;
    if (/\d\s*(?:год|лет|year|month|месяц)/i.test(line))
        return false;
    if (/^(?:стек|stack):/i.test(line))
        return false;
    if (/^[•\-–—]/.test(line))
        return false;
    return true;
}
function stripExperienceDurationSuffix(line) {
    return line
        .replace(/\s+\d+(?:\s*[.,]\s*\d+)?\s*\+?\s*(?:years?|yrs?|год(?:а)?|лет|месяц(?:а|ев)?)(?:\s+experience)?\s*$/i, '')
        .replace(/\s+/g, ' ')
        .trim();
}
function normalizeCompanyName(line) {
    return line
        .replace(/\b([A-Za-zА-Яа-яЁё])\s+(\d)\b/g, '$1$2')
        .replace(/\b(\d)\s+([A-Za-zА-Яа-яЁё]{1,8})\b/g, '$1$2')
        .replace(/\s+/g, ' ')
        .trim();
}
function normalizeSkillName(value, profile = 'generic') {
    const normalized = value
        .replace(/\bPr\s+eact\b/gi, 'Preact')
        .replace(/\bPr\s+eact Signals\b/gi, 'Preact Signals')
        .replace(/\bTanstack\b/gi, 'TanStack')
        .replace(/\bReact Testing Library\b/gi, 'React Testing Library')
        .replace(/\b(\d)\s+D\b/g, '$1D')
        .replace(/\s+/g, ' ')
        .replace(/\.$/, '')
        .trim();
    if (profile === 'hh_ru') {
        return normalized
            .replace(/^@tanstack$/i, '')
            .trim();
    }
    return normalized;
}
function extractEmployerFromDateLine(line) {
    return normalizeCompanyName(stripExperienceDurationSuffix(cleanLine(line
        .replace(new RegExp(MONTH_YEAR_RE.source, 'gi'), ' ')
        .replace(CURRENT_MARKER_RE, ' ')
        .replace(/^[\s\-–—|,:;]+/, '')
        .replace(/[\s\-–—|,:;]+$/, '')
        .replace(/\s+/g, ' '))));
}
function extractRoleTitle(line) {
    const roleMatch = line.match(/^роль\s*:\s*(.+?)(?:\s+в\s+команде|\.\s*|$)/i);
    if (!roleMatch?.[1])
        return '';
    return cleanLine(roleMatch[1]);
}
function looksLikeRoleTitle(line) {
    if (!looksLikeJobTitle(line))
        return false;
    return (EXPERIENCE_KEYWORD_RE.test(line) ||
        /\b(?:senior|middle|junior|lead|staff|principal|intern|ведущий|старший|младший|стаж[её]р)\b/i.test(line) ||
        /\b(?:frontend|front[- ]?end|backend|back[- ]?end|full[- ]?stack|fullstack|mobile|ios|android|web|qa|sdet|devops|ux|ui)\b/i.test(line));
}
function normalizeComparableText(value) {
    return value
        .toLowerCase()
        .replace(new RegExp(URL_RE.source, 'gi'), '')
        .replace(/[^a-zа-яё0-9]+/gi, '');
}
function looksLikeCompanyUrlLine(line, company) {
    if (!URL_RE.test(line))
        return false;
    const label = cleanLine(line.replace(new RegExp(URL_RE.source, 'gi'), ' '));
    if (!label)
        return false;
    if (KNOWN_CITIES_RE.test(label))
        return false;
    const normalizedLabel = normalizeComparableText(label);
    const normalizedCompany = normalizeComparableText(company);
    if (!normalizedCompany)
        return label.split(/\s+/).length <= 6;
    return (normalizedLabel.includes(normalizedCompany) ||
        normalizedCompany.includes(normalizedLabel));
}
function looksLikeEntryHeaderPrelude(line) {
    if (!line)
        return false;
    if (DATE_RE.test(line) || CURRENT_MARKER_RE.test(line))
        return false;
    if (/^[•\-–—]/.test(line))
        return false;
    if (/^(?:stack|стек)\s*:/i.test(line))
        return false;
    if (/^роль\s*:/i.test(line))
        return false;
    if (looksLikeExperienceNoise(line) || looksLikeDurationSummary(line))
        return false;
    if (/[.!?]$/.test(line))
        return false;
    if (line.length > 80)
        return false;
    return Boolean(stripExperienceDurationSuffix(line));
}
function looksLikePersonalMetaLine(line) {
    // \b doesn't work with Cyrillic — use substring/prefix checks
    return /(?:^|\s)(?:гражданство|citizenship|дата рождения|birth date|born|удаленн|гибрид|разрешени[ея] на работу|work permit|проживает|проживаю|занятость|специализаци[яи])(?:\s|:|,|$)/i.test(line) ||
        /(?:^|\s)(?:женщина|мужчина|female|male)(?:\s|,|$)/i.test(line) ||
        /\b(?:remote|hybrid|office|onsite|work permit)\b/i.test(line) ||
        /готов[а]?\s+к\s+(?:переезду|командировкам)/i.test(line) ||
        /^(?:график работы|желательное время в пути)/i.test(line);
}
function normalizePersonalValue(line) {
    return line.replace(/^[^:]{1,30}:\s*/, '').trim();
}
function splitTagList(value) {
    return value
        .split(/[,;|•·/]+/g)
        .map((part) => part.trim())
        .filter(Boolean);
}
function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function detectProbableFullName(lines) {
    for (const line of lines.slice(0, 20)) {
        if (!EMAIL_RE.test(line) &&
            !PHONE_RE.test(line) &&
            !URL_RE.test(line) &&
            !detectSection(line) &&
            line.length > 2 &&
            line.length < 80) {
            return line;
        }
    }
    return '';
}
function stripFooterLines(lines) {
    const probableName = detectProbableFullName(lines);
    const namePattern = probableName
        ? new RegExp(`^${escapeRegExp(probableName)}\\s*•\\s*(?:Резюме обновлено|Resume updated)`, 'i')
        : null;
    return lines.filter((line) => {
        if (!HH_RESUME_UPDATED_RE.test(line))
            return true;
        if (namePattern?.test(line))
            return false;
        return !/^[^•]{2,80}\s*•\s*(?:Резюме обновлено|Resume updated)/i.test(line);
    });
}
function looksLikeGenderAgeLine(line) {
    return /(?:^|\s)(?:женщина|мужчина|female|male)(?:\s|,|$)/i.test(line) ||
        /\d{1,2}\s*(?:лет|года|год)(?:\s|,|$)/i.test(line) ||
        /\b\d{1,2}\s*(?:years?|yrs?)\b/i.test(line);
}
function applyNameParts(personal) {
    const normalized = personal.fullName.replace(/\s+/g, ' ').trim();
    const parts = normalized.split(' ').filter(Boolean);
    if (parts.length >= 2) {
        personal.lastName = parts[0] ?? '';
        personal.firstName = parts[1] ?? '';
        personal.middleName = parts.slice(2).join(' ');
    }
}
const BIRTH_MONTH_MAP = {
    января: '01', янв: '01',
    февраля: '02', фев: '02',
    марта: '03', мар: '03',
    апреля: '04', апр: '04',
    мая: '05',
    июня: '06', июн: '06',
    июля: '07', июл: '07',
    августа: '08', авг: '08',
    сентября: '09', сен: '09',
    октября: '10', окт: '10',
    ноября: '11', ноя: '11',
    декабря: '12', дек: '12',
};
function normalizeBirthDate(value) {
    const normalized = value.replace(/\s+/g, ' ').trim();
    // ISO: 1999-12-19
    const iso = normalized.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
    if (iso)
        return `${iso[1]}-${iso[2]}-${iso[3]}`;
    // Dotted/slashed: 19.12.1999 or 19/12/1999
    const dotted = normalized.match(/\b(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})\b/);
    if (dotted) {
        const year = dotted[3].length === 2 ? `19${dotted[3]}` : dotted[3];
        return `${year}-${dotted[2].padStart(2, '0')}-${dotted[1].padStart(2, '0')}`;
    }
    // Russian text: "19 декабря 1999" or "19 декабря 1999 (26 лет)"
    const ruText = normalized.match(/(\d{1,2})\s+([а-яё]+)\s+(\d{4})/i);
    if (ruText) {
        const monthKey = ruText[2].toLowerCase();
        const month = BIRTH_MONTH_MAP[monthKey];
        if (month)
            return `${ruText[3]}-${month}-${ruText[1].padStart(2, '0')}`;
    }
    return normalized;
}
function looksLikeTopPersonalMeta(line, index) {
    if (index > 40)
        return false;
    if (looksLikePersonalMetaLine(line))
        return true;
    if (looksLikeGenderAgeLine(line))
        return true;
    // Birth date line
    if (/\b(?:дата рождения|birth date|born)\b/i.test(line))
        return true;
    if (/\d{1,2}\s+(?:января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)\s+\d{4}/i.test(line))
        return true;
    // hh.ru relocation/trip readiness lines
    if (/готов[а]?\s+к\s+(?:переезду|командировкам)/i.test(line))
        return true;
    // Lines starting with "Проживает:" or similar
    if (/^(?:проживает|проживаю)[:\s]/i.test(line))
        return true;
    return false;
}
function looksLikeExperienceNoise(line) {
    // Duration lines: "1 год 6 месяцев", "2 years" — \b doesn't work with Cyrillic, use \s|$
    if (/^\d+\s*(?:год|года|лет|месяц|месяца|месяцев)(?:\s|$)/i.test(line))
        return true;
    if (/^\d+(?:[.,]\d+)?\s*\+?\s*(?:years?|months?)(?:\s|$)/i.test(line))
        return true;
    // hh.ru industry tag lines — long comma-separated industry category strings
    // e.g. "Информационные технологии, системная интеграция, интернет"
    if (/^(?:информационные технологии|сми\s*[,;]|маркетинг\s*[,;]|internet|media\s*[,;]|other:|frontend:|реклама\s*[,;]|розничная торговля|финансы\s*[,;]|банки\s*[,;]|страхование\s*[,;]|строительство\s*[,;]|медицина\s*[,;]|образование\s*[,;]|производство\s*[,;]|транспорт\s*[,;]|логистика\s*[,;]|консалтинг\s*[,;])/i.test(line))
        return true;
    // Generic hh.ru industry pattern: multi-word comma-separated line with only letters/spaces/commas,
    // NO skill tokens, NO experience keywords, starts uppercase — industry category strings
    // e.g. "Информационные технологии, системная интеграция, интернет"
    // EXCLUDE company names like "Иннотех, Группа компаний" — they have ≤2 segments
    if (line.includes(',') &&
        line.split(',').length >= 3 && // at least 3 comma-separated parts
        line.length > 30 &&
        line.length < 200 &&
        !DATE_RE.test(line) &&
        !URL_RE.test(line) &&
        !EXPERIENCE_KEYWORD_RE.test(line) &&
        !SKILL_TOKEN_RE.test(line) &&
        /^[А-ЯЁA-Z]/.test(line) &&
        /^[А-Яа-яЁёA-Za-z\s,]+$/.test(line) && // only letters, spaces, commas
        line.split(',').every((part) => part.trim().split(/\s+/).length <= 4) // each segment is ≤4 words
    )
        return true;
    // Bullet-prefixed industry noise lines from hh.ru
    if (/^[•\-]\s*(?:разработка|маркетинговые|рекламные|btl|designer|event|pr|internet|software|system integration|интернет-компания|системная интеграция|автоматизаци)/i.test(line))
        return true;
    return false;
}
function looksLikeDurationSummary(line) {
    return (/^\d+\s*(?:год|года|лет|месяц|месяца|месяцев)(?:\s|$)/i.test(line) ||
        /^\d+(?:[.,]\d+)?\s*\+?\s*(?:years?|months?)(?:\s|$)/i.test(line));
}
// Known city names for company/location split disambiguation
const KNOWN_CITIES_RE = /^(?:москва|санкт-петербург|спб|питер|екатеринбург|новосибирск|казань|нижний новгород|самара|омск|уфа|краснодар|воронеж|пермь|волгоград|ростов|саратов|тюмень|тольятти|барнаул|ижевск|красноярск|москве|moscow|saint.?petersburg|novosibirsk)$/i;
function parseExperienceBlock(lines, profile) {
    if (profile === 'en_cv') {
        return parseExperienceBlockEnCv(lines);
    }
    return parseExperienceBlockHh(lines);
}
function parseExperienceBlockHh(lines) {
    return splitEntries(lines).map((entryLines) => {
        // Step 1: find date line
        const dateLineIndex = entryLines.findIndex((line) => DATE_RE.test(line) || CURRENT_MARKER_RE.test(line));
        const dateLine = dateLineIndex >= 0 ? entryLines[dateLineIndex] : entryLines[0];
        const leadingDateLines = entryLines
            .slice(0, 3)
            .filter((line) => DATE_RE.test(line) || CURRENT_MARKER_RE.test(line));
        const { from, to, isCurrent } = extractDates(leadingDateLines.join(' '));
        const companyFromDateLine = extractEmployerFromDateLine(dateLine);
        // Step 2: all non-date lines
        const nonDateLines = entryLines.filter((_, i) => i !== dateLineIndex);
        // Step 3: normalize body once and extract semantic markers from all lines.
        const normalizedLines = nonDateLines
            .map((line) => ({
            raw: preserveStructuredLine(line),
            clean: cleanLine(line),
            wasBullet: /^[•\-–—]/.test(line),
            hasUrl: URL_RE.test(line),
        }))
            .filter((line) => line.clean)
            .filter((line) => !looksLikeDurationSummary(line.clean))
            .filter((line) => !looksLikeExperienceNoise(line.clean));
        // Step 4: parse company from the date line first, then fall back to early header lines.
        let company = companyFromDateLine;
        let location = '';
        for (const line of normalizedLines.slice(0, 6)) {
            const clean = stripExperienceDurationSuffix(cleanLine(line.clean.replace(new RegExp(MONTH_YEAR_RE.source, 'gi'), '').replace(/[-–—|]+/g, ' ')));
            if (!clean)
                continue;
            if (looksLikeRoleTitle(clean))
                continue;
            if (/^роль\s*:/i.test(clean))
                continue;
            if (!company) {
                const parts = clean.split(',').map(p => p.trim()).filter(Boolean);
                if (parts.length > 1 && KNOWN_CITIES_RE.test(parts[parts.length - 1])) {
                    company = normalizeCompanyName(parts.slice(0, -1).join(', '));
                    location = parts[parts.length - 1];
                }
                else {
                    company = normalizeCompanyName(clean);
                }
            }
            else if (!location && KNOWN_CITIES_RE.test(clean)) {
                location = clean;
            }
        }
        let companyUrl = '';
        for (const line of normalizedLines) {
            if (!looksLikeCompanyUrlLine(line.raw, company))
                continue;
            companyUrl = line.raw.match(URL_RE)?.[0] ?? '';
            break;
        }
        // Step 5: parse body — explicit "Роль:" wins, then compact title-like lines.
        let position = '';
        let positionIdx = -1;
        for (let i = 0; i < normalizedLines.length; i++) {
            const roleTitle = extractRoleTitle(normalizedLines[i].clean);
            if (roleTitle) {
                position = roleTitle;
                positionIdx = i;
                break;
            }
        }
        for (let i = 0; !position && i < Math.min(normalizedLines.length, 15); i++) {
            if (!normalizedLines[i].wasBullet && looksLikeRoleTitle(normalizedLines[i].clean)) {
                position = normalizedLines[i].clean;
                positionIdx = i;
                break;
            }
        }
        const skills = normalizedLines
            .filter((l) => /^(?:стек|stack):/i.test(l.clean))
            .flatMap((l) => splitTagList(l.clean.replace(/^(?:стек|stack):/i, '')));
        const descriptionLines = normalizedLines
            .filter((_, i) => i !== positionIdx)
            .filter((l) => !/^(?:стек|stack):/i.test(l.clean))
            .filter((l) => l.clean !== location)
            .filter((l) => normalizeCompanyName(stripExperienceDurationSuffix(l.clean)) !== company)
            .filter((l) => !(companyUrl && l.raw.includes(companyUrl) && looksLikeCompanyUrlLine(l.raw, company)))
            .map((l) => l.raw)
            .filter(Boolean);
        return {
            id: crypto.randomUUID(),
            company,
            companyUrl,
            position,
            location,
            fromMonth: from,
            toMonth: to,
            isCurrent,
            description: descriptionLines.join('\n').trim(),
            skills,
        };
    }).filter((exp) => exp.company || exp.position || exp.description || exp.skills.length);
}
function parseExperienceBlockEnCv(lines) {
    const normalizedLines = lines
        .map((line) => preserveStructuredLine(line))
        .filter(Boolean);
    const entries = [];
    let current = [];
    for (let index = 0; index < normalizedLines.length; index++) {
        const line = normalizedLines[index];
        const nextLine = normalizedLines[index + 1];
        const startsEntry = !DATE_RE.test(line) &&
            !CURRENT_MARKER_RE.test(line) &&
            Boolean(nextLine) &&
            (DATE_RE.test(nextLine) || CURRENT_MARKER_RE.test(nextLine)) &&
            !/^(?:stack|стек)\s*:/i.test(line) &&
            !/^[•\-–—]/.test(line);
        if (startsEntry) {
            if (current.length)
                entries.push(current);
            current = [line];
            continue;
        }
        if (current.length) {
            current.push(line);
        }
    }
    if (current.length)
        entries.push(current);
    return entries.map((entryLines) => {
        const companyLine = entryLines[0] ?? '';
        const dateLine = entryLines.find((line, index) => index > 0 && (DATE_RE.test(line) || CURRENT_MARKER_RE.test(line))) ?? '';
        const { from, to, isCurrent } = extractDates(dateLine);
        const company = normalizeCompanyName(stripExperienceDurationSuffix(cleanLine(companyLine)));
        const skills = entryLines
            .filter((line) => /^(?:stack|стек)\s*:/i.test(line))
            .flatMap((line) => splitTagList(line.replace(/^(?:stack|стек)\s*:/i, '')))
            .map((skill) => normalizeSkillName(skill, 'en_cv'))
            .filter(Boolean);
        const description = entryLines
            .filter((line) => line !== companyLine && line !== dateLine)
            .filter((line) => !/^(?:stack|стек)\s*:/i.test(line))
            .map((line) => preserveStructuredLine(line))
            .filter(Boolean)
            .join('\n')
            .trim();
        return {
            id: crypto.randomUUID(),
            company,
            companyUrl: '',
            position: '',
            location: '',
            fromMonth: from,
            toMonth: to,
            isCurrent,
            description,
            skills,
        };
    }).filter((entry) => entry.company || entry.description || entry.skills.length);
}
function parseEducationBlock(lines) {
    return splitEntries(lines).map((entryLines) => {
        const dateLineIndex = entryLines.findIndex((line) => DATE_RE.test(line) || CURRENT_MARKER_RE.test(line));
        const dateLine = dateLineIndex >= 0 ? entryLines[dateLineIndex] : entryLines[0];
        const [headerLine, ...restLines] = entryLines;
        const { from, to, isCurrent } = extractDates(dateLine);
        const institutionParts = [cleanLine((dateLineIndex > 0 ? entryLines[0] : headerLine)
                .replace(new RegExp(MONTH_YEAR_RE.source, 'gi'), '')
                .replace(/[-–—|]+/g, ' '))];
        const programParts = [];
        const bodyLines = dateLineIndex > 0
            ? entryLines.filter((_, index) => index !== 0 && index !== dateLineIndex)
            : restLines;
        for (const line of bodyLines.map((value) => cleanLine(value)).filter(Boolean)) {
            if (!programParts.length && !looksLikeEducationProgram(line)) {
                institutionParts.push(line);
                continue;
            }
            programParts.push(line);
        }
        const institution = institutionParts.join(' ').trim();
        const programText = programParts.join(' ').trim();
        const { degree, field } = splitEducationProgram(programText);
        return {
            id: crypto.randomUUID(),
            institution,
            degree,
            field,
            fromMonth: from,
            toMonth: to,
            isCurrent,
        };
    }).filter((edu) => edu.institution || edu.degree || edu.field);
}
function parseSkillsBlock(lines, profile) {
    const seen = new Set();
    const results = [];
    const parts = lines
        .flatMap((line) => line
        .split(/\n|[,;|•·]+/g)
        .map((part) => part.replace(/^[-–—*]\s*/, '').trim()))
        .flatMap((part) => {
        const colonIndex = part.indexOf(':');
        if (colonIndex > 0 && colonIndex < 30) {
            return part.slice(colonIndex + 1).split(/[,;|]+/g).map((token) => token.trim());
        }
        return [part];
    })
        .map(cleanLine)
        .map((part) => normalizeSkillName(part, profile))
        .filter(Boolean);
    for (const part of parts) {
        if (part.length > 48)
            continue;
        // Skip sentence-like fragments that sneak in from description
        if (/\s/.test(part) && part.split(/\s+/).length > 4)
            continue;
        if (/[.!?]$/.test(part))
            continue;
        if (/\b(снизила|улучшил|провела|реализовала|внедрила|разработала|настроила|сократился|повысил|запустил)\b/i.test(part))
            continue;
        const key = part.toLowerCase();
        if (seen.has(key))
            continue;
        seen.add(key);
        results.push({
            id: crypto.randomUUID(),
            name: part,
        });
    }
    return results;
}
function parseProjectsBlock(lines) {
    const entries = splitLooseEntries(lines);
    return entries.map((entryLines) => {
        const cleaned = entryLines.map((line) => cleanLine(line)).filter(Boolean);
        const [titleLine = '', ...restLines] = cleaned;
        const link = firstUrl(entryLines);
        const title = cleanProjectTitle(titleLine);
        let subtitle = '';
        let descriptionLines = restLines;
        if (restLines[0] && restLines[0].length <= 80 && !/[.!?]$/.test(restLines[0])) {
            subtitle = restLines[0];
            descriptionLines = restLines.slice(1);
        }
        return {
            id: crypto.randomUUID(),
            kind: 'project',
            title,
            subtitle,
            issuedAt: '',
            link,
            description: descriptionLines.join('\n').trim(),
        };
    }).filter((entry) => entry.title || entry.subtitle || entry.description || entry.link);
}
function parseLanguagesBlock(lines) {
    const fullText = lines.join(' ');
    const results = [];
    const seenNames = new Set();
    // Build regex from known language names (no word boundaries — Cyrillic-safe)
    const namePattern = new RegExp(`(${[...HUMAN_LANGUAGE_NAMES].join('|')})`, 'gi');
    const nameMatches = [...fullText.matchAll(namePattern)];
    for (let i = 0; i < nameMatches.length; i++) {
        const match = nameMatches[i];
        const name = match[0];
        const key = name.toLowerCase();
        if (seenNames.has(key))
            continue;
        seenNames.add(key);
        // Look at the text following this language name (up to the next language name)
        const contextStart = match.index + name.length;
        const nextMatchStart = nameMatches[i + 1]?.index ?? fullText.length;
        const context = fullText.slice(contextStart, Math.min(contextStart + 50, nextMatchStart));
        results.push({
            id: crypto.randomUUID(),
            name,
            proficiency: matchProficiency(context),
        });
    }
    return results;
}
function splitLooseEntries(lines) {
    const entries = [];
    let current = [];
    for (const line of lines) {
        const cleaned = cleanLine(line);
        const startsNew = current.length > 0 && (PROJECT_KEYWORD_RE.test(cleaned) ||
            (cleaned.length <= 90 && !/[.!?]$/.test(cleaned) && !/^[•\-–—]/.test(cleaned) && /[A-ZА-ЯЁ]/.test(cleaned[0] ?? '')) ||
            ((DATE_RE.test(cleaned) || CURRENT_MARKER_RE.test(cleaned)) && current.some((value) => cleanLine(value))));
        if (startsNew) {
            entries.push(current);
            current = [line];
            continue;
        }
        current.push(line);
    }
    if (current.length) {
        entries.push(current);
    }
    return entries.filter((entry) => entry.some((line) => cleanLine(line)));
}
function cleanProjectTitle(value) {
    return cleanLine(value)
        .replace(/\b(certification|certificate|project|projects|сертификат|сертификация|проект)\b[:\s-]*/i, '')
        .trim();
}
function countFilledPersonalFields(personal) {
    return [
        personal.fullName.trim(),
        personal.firstName.trim(),
        personal.lastName.trim(),
        personal.middleName.trim(),
        personal.position.trim(),
        personal.location.trim(),
        personal.citizenship.trim(),
        personal.workPermit.trim(),
        personal.birthDate.trim(),
        personal.gender.trim(),
        personal.age.trim(),
        personal.photo.trim(),
        personal.phone.trim(),
        ...(personal.workFormats ?? []).map((entry) => entry.trim()),
        ...(personal.links ?? []).map((link) => link.url.trim()),
    ].filter(Boolean).length;
}
function scoreAboutBlock(aboutText, rawLines) {
    if (!rawLines.length && !aboutText)
        return 0;
    if (!aboutText)
        return 0.2;
    if (aboutText.length >= 180)
        return 0.9;
    if (aboutText.length >= 80)
        return 0.7;
    return 0.45;
}
function scoreWorkEntries(entries, rawLines) {
    if (!rawLines.length && !entries.length)
        return 0;
    if (!entries.length)
        return 0.2;
    const completeness = average(entries.map((entry) => {
        let score = 0;
        if (entry.company.trim())
            score += 0.35;
        if (entry.position.trim())
            score += 0.25;
        if (entry.location.trim())
            score += 0.1;
        if (entry.fromMonth.trim() || entry.toMonth.trim() || entry.isCurrent)
            score += 0.25;
        if (entry.description.trim())
            score += 0.15;
        if (entry.skills.length)
            score += 0.1;
        return score;
    }));
    return clamp01(0.2 + Math.min(0.35, entries.length * 0.15) + completeness * 0.45);
}
function scoreEducationEntries(entries, rawLines) {
    if (!rawLines.length && !entries.length)
        return 0;
    if (!entries.length)
        return 0.2;
    const completeness = average(entries.map((entry) => {
        let score = 0;
        if (entry.institution.trim())
            score += 0.4;
        if (entry.degree.trim() || entry.field.trim())
            score += 0.3;
        if (entry.fromMonth.trim() || entry.toMonth.trim() || entry.isCurrent)
            score += 0.3;
        return score;
    }));
    return clamp01(0.2 + Math.min(0.3, entries.length * 0.18) + completeness * 0.5);
}
function scoreSkills(entries, rawLines) {
    if (!rawLines.length && !entries.length)
        return 0;
    if (!entries.length)
        return 0.2;
    const validSkills = entries.filter((entry) => entry.name.trim().length >= 2);
    if (!validSkills.length)
        return 0.2;
    return clamp01(0.25 + Math.min(0.45, validSkills.length * 0.08) + (rawLines.length ? 0.2 : 0));
}
function scoreLanguages(entries, rawLines) {
    if (!rawLines.length && !entries.length)
        return 0;
    if (!entries.length)
        return 0.2;
    const completeness = average(entries.map((entry) => {
        let score = 0;
        if (entry.name.trim())
            score += 0.6;
        if (entry.proficiency.trim())
            score += 0.4;
        return score;
    }));
    return clamp01(0.2 + Math.min(0.3, entries.length * 0.18) + completeness * 0.5);
}
function scoreProjects(entries, rawLines) {
    if (!rawLines.length && !entries.length)
        return 0;
    if (!entries.length)
        return 0.2;
    const completeness = average(entries.map((entry) => {
        let score = 0;
        if (entry.title.trim())
            score += 0.4;
        if (entry.subtitle.trim())
            score += 0.15;
        if (entry.link.trim())
            score += 0.15;
        if (entry.description.trim())
            score += 0.3;
        return score;
    }));
    return clamp01(0.2 + Math.min(0.25, entries.length * 0.16) + completeness * 0.55);
}
function average(values) {
    if (!values.length)
        return 0;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
}
function clamp01(value) {
    return Math.min(1, Math.max(0, value));
}
function roundScore(value) {
    return Math.round(value * 100) / 100;
}
function looksLikeEducationProgram(line) {
    return /(bachelor|master|phd|doctorate|associate|бакалавр|магистр|аспирант|специалист)/i.test(line)
        || (line.includes(',') && line.length > 40);
}
function splitEducationProgram(programText) {
    if (!programText) {
        return { degree: '', field: '' };
    }
    const degreeMatch = programText.match(/(bachelor|master|phd|doctorate|associate|бакалавр|магистр|аспирант|специалист)/i);
    if (degreeMatch) {
        return {
            degree: degreeMatch[0],
            field: programText.replace(degreeMatch[0], '').replace(/^[-–—,\s]+/, '').trim(),
        };
    }
    const parts = programText.split(',').map((part) => part.trim()).filter(Boolean);
    if (parts.length >= 2) {
        return {
            degree: parts[0],
            field: parts.slice(1).join(', '),
        };
    }
    return { degree: programText, field: '' };
}
