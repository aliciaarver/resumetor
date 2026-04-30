import { ref } from 'vue';
import { parseTextToResumeDetailed, } from '@/utils/parseTextToResume';
import { useLocaleStore } from '@/stores/locale';
import { normalizeSocialLinkLabel } from '@/utils/socialLinks';
import { normalizePdfPageText } from '@/utils/pdfTextNormalizer';
import { resolveParserFeatureFlags } from '@/utils/parserFeatureFlags';
import { buildConfidenceNote, buildPersonalMetrics, toConfidenceLevel, } from '@/entities/resume';
export function useResumeParser() {
    const localeStore = useLocaleStore();
    const { t } = localeStore;
    const parsing = ref(false);
    const error = ref(null);
    async function parseFile(file) {
        parsing.value = true;
        error.value = null;
        try {
            const featureFlags = resolveParserFeatureFlags();
            if (!isPdfFile(file)) {
                throw new Error(t('parser.unsupportedFileType'));
            }
            const { text, personal, pdfMeta: extractedPdfMeta } = await extractPdfData(file, t, featureFlags);
            const parsed = parseTextToResumeDetailed(text, {
                genericLinkLabel: t('common.link'),
                featureFlags,
            });
            const resume = parsed.resume;
            resume.personal = mergePersonalInfo(resume.personal, personal);
            const review = buildParseReview(text, parsed, resume, t);
            const safeResume = applyConfidenceFallback(resume, review.blocks);
            return {
                resume: safeResume,
                pdfMeta: buildParsedPdfMeta(extractedPdfMeta, safeResume, t('pdf.defaultTitleSuffix')),
                review,
            };
        }
        catch (e) {
            error.value = e instanceof Error ? e.message : t('parser.failedToParse');
            return null;
        }
        finally {
            parsing.value = false;
        }
    }
    return { parseFile, parsing, error };
}
function isPdfFile(file) {
    return file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
}
function mergePersonalInfo(parsedPersonal, extractedPersonal) {
    const parsed = parsedPersonal ?? {
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
    const links = dedupeLinks([...(extractedPersonal.links ?? []), ...(parsed.links ?? [])]);
    return {
        fullName: parsed.fullName || extractedPersonal.fullName || '',
        firstName: parsed.firstName || extractedPersonal.firstName || '',
        lastName: parsed.lastName || extractedPersonal.lastName || '',
        middleName: parsed.middleName || extractedPersonal.middleName || '',
        position: parsed.position || extractedPersonal.position || '',
        location: parsed.location || extractedPersonal.location || '',
        citizenship: parsed.citizenship || extractedPersonal.citizenship || '',
        workPermit: parsed.workPermit || extractedPersonal.workPermit || '',
        workFormats: parsed.workFormats?.length ? parsed.workFormats : (extractedPersonal.workFormats ?? []),
        birthDate: parsed.birthDate || extractedPersonal.birthDate || '',
        gender: parsed.gender || extractedPersonal.gender || '',
        age: parsed.age || extractedPersonal.age || '',
        photo: parsed.photo || extractedPersonal.photo || '',
        phone: parsed.phone || extractedPersonal.phone || '',
        links,
    };
}
function dedupeLinks(links) {
    const seen = new Set();
    return links.filter((link) => {
        if (!link.url)
            return false;
        if (seen.has(link.url))
            return false;
        seen.add(link.url);
        link.label = normalizeSocialLinkLabel(link.label);
        return true;
    });
}
async function extractPdfData(file, t, featureFlags = resolveParserFeatureFlags()) {
    const arrayBuffer = await file.arrayBuffer();
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).href;
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pages = [];
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageWidth = Array.isArray(page.view) ? page.view[2] - page.view[0] : 0;
        pages.push(normalizePdfPageText(content.items, pageWidth));
    }
    const text = pages.filter(Boolean).join('\n\n').trim();
    if (!text) {
        throw new Error(t('parser.noExtractableText'));
    }
    return {
        text,
        personal: featureFlags.enableHeaderAnnotationLinks ? await extractHeaderPersonalInfo(pdf) : {},
        pdfMeta: await extractPdfMetadata(pdf),
    };
}
async function extractHeaderPersonalInfo(pdf) {
    if (pdf.numPages < 1) {
        return {};
    }
    const firstPage = await pdf.getPage(1);
    const annotations = await firstPage.getAnnotations();
    const pageHeight = Array.isArray(firstPage.view) ? firstPage.view[3] : 0;
    const headerLinks = annotations.filter((annotation) => {
        const url = annotation.url || annotation.unsafeUrl;
        const rect = annotation.rect;
        return Boolean(url &&
            Array.isArray(rect) &&
            pageHeight &&
            rect[1] >= pageHeight * 0.75);
    });
    const links = headerLinks
        .map((annotation) => annotation.url || annotation.unsafeUrl)
        .map((url) => ({
        id: crypto.randomUUID(),
        label: detectLinkLabel(url),
        url: url.replace(/^mailto:/i, ''),
    }));
    return {
        links,
    };
}
function detectLinkLabel(url) {
    const normalized = url.toLowerCase();
    if (normalized.startsWith('mailto:') || normalized.includes('@'))
        return 'Email';
    if (normalized.includes('github'))
        return 'GitHub';
    if (normalized.includes('linkedin'))
        return 'LinkedIn';
    if (normalized.includes('t.me') || normalized.includes('telegram'))
        return 'Telegram';
    return 'Link';
}
async function extractPdfMetadata(pdf) {
    try {
        const metadata = await pdf.getMetadata();
        const info = metadata?.info ?? {};
        return {
            title: sanitizePdfMetaField(info.Title),
            author: sanitizePdfMetaField(info.Author),
            subject: sanitizePdfMetaField(info.Subject),
            keywords: sanitizePdfKeywords(info.Keywords),
        };
    }
    catch {
        return {};
    }
}
function sanitizePdfMetaField(value) {
    return typeof value === 'string' ? value.replace(/\0/g, '').trim() : '';
}
function sanitizePdfKeywords(value) {
    const raw = sanitizePdfMetaField(value);
    if (!raw)
        return '';
    const parts = raw
        .split(/[;,]/g)
        .map((part) => part.trim())
        .filter(Boolean);
    if (!parts.length)
        return '';
    if (parts.every((part) => /^[A-Za-z0-9-]{6,}$/.test(part) || /^\d+$/.test(part))) {
        return '';
    }
    return parts.join(', ');
}
function buildParsedPdfMeta(extractedPdfMeta, resume, defaultTitleSuffix) {
    const fullName = [
        resume.personal?.lastName ?? '',
        resume.personal?.firstName ?? '',
        resume.personal?.middleName ?? '',
    ].map((part) => part.trim()).filter(Boolean).join(' ') || (resume.personal?.fullName?.trim() ?? '');
    const aboutMe = resume.aboutMe?.trim() ?? '';
    return {
        title: fullName ? `${fullName} — ${defaultTitleSuffix}` : extractedPdfMeta.title || '',
        author: fullName || extractedPdfMeta.author || '',
        subject: aboutMe || extractedPdfMeta.subject || '',
        keywords: extractedPdfMeta.keywords || '',
    };
}
function buildParseReview(rawText, parsed, resume, t) {
    const personalMetrics = buildPersonalMetrics(resume.personal, parsed.blocks.personal.rawText);
    const blockMetrics = {
        ...parsed.blocks,
        personal: personalMetrics,
    };
    const orderedKeys = [
        'personal',
        'aboutMe',
        'workExperience',
        'education',
        'skills',
        'languages',
        'projects',
    ];
    const blocks = orderedKeys.map((key) => {
        const metrics = blockMetrics[key];
        const confidence = toConfidenceLevel(metrics);
        return {
            key,
            label: t(`review.${key}`),
            score: metrics.score,
            confidence,
            note: buildConfidenceNote(key, metrics, confidence, t),
            rawText: metrics.rawText,
            extractedCount: metrics.extractedCount,
            imported: confidence === 'high' || confidence === 'medium',
        };
    });
    return {
        rawText,
        hasWarnings: blocks.some((block) => block.confidence === 'low'),
        blocks,
        diff: null,
    };
}
function applyConfidenceFallback(resume, blocks) {
    const keep = new Set(blocks
        .filter((block) => block.imported)
        .map((block) => block.key));
    const safeResume = {};
    if (keep.has('personal') && resume.personal)
        safeResume.personal = resume.personal;
    if (keep.has('aboutMe'))
        safeResume.aboutMe = resume.aboutMe ?? '';
    if (keep.has('workExperience'))
        safeResume.workExperience = resume.workExperience ?? [];
    if (keep.has('education'))
        safeResume.education = resume.education ?? [];
    if (keep.has('skills'))
        safeResume.skills = resume.skills ?? [];
    if (keep.has('languages'))
        safeResume.languages = resume.languages ?? [];
    if (keep.has('projects'))
        safeResume.projects = resume.projects ?? [];
    return safeResume;
}
