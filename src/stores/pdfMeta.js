import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { useResumeStore } from './resume';
import { useLocaleStore } from './locale';
import { buildSuggestedPdfMeta, createEmptyPdfMeta } from '@/utils/pdfMetaDefaults';
export const usePdfMetaStore = defineStore('pdfMeta', () => {
    const meta = ref(createEmptyPdfMeta());
    const autoMeta = ref(createEmptyPdfMeta());
    let synced = false;
    function syncFromResume() {
        if (synced)
            return;
        synced = true;
        const resumeStore = useResumeStore();
        const localeStore = useLocaleStore();
        const { t } = localeStore;
        watch(() => ({
            locale: localeStore.locale,
            fullName: resumeStore.data.personal.fullName,
            aboutMe: resumeStore.data.aboutMe,
            positions: resumeStore.data.workExperience.map((entry) => `${entry.position}|${entry.company}`).join('::'),
            education: resumeStore.data.education.map((entry) => `${entry.degree}|${entry.field}`).join('::'),
            skills: resumeStore.data.skills.map((entry) => entry.name).join('::'),
            languages: resumeStore.data.languages.map((entry) => entry.name).join('::'),
            projects: resumeStore.data.projects.map((entry) => `${entry.title}|${entry.subtitle}`).join('::'),
        }), () => {
            const suggested = buildSuggestedPdfMeta(resumeStore.data, t('pdf.defaultTitleSuffix'));
            meta.value = {
                title: shouldSyncField(meta.value.title, autoMeta.value.title) ? suggested.title : meta.value.title,
                author: shouldSyncField(meta.value.author, autoMeta.value.author) ? suggested.author : meta.value.author,
                subject: shouldSyncField(meta.value.subject, autoMeta.value.subject) ? suggested.subject : meta.value.subject,
                keywords: shouldSyncField(meta.value.keywords, autoMeta.value.keywords) ? suggested.keywords : meta.value.keywords,
            };
            autoMeta.value = suggested;
        }, { immediate: true });
    }
    function hydrateFromParsed(parsedMeta) {
        const resumeStore = useResumeStore();
        const localeStore = useLocaleStore();
        const suggested = buildSuggestedPdfMeta(resumeStore.data, localeStore.t('pdf.defaultTitleSuffix'));
        meta.value = {
            ...suggested,
            ...Object.fromEntries(Object.entries(parsedMeta).filter(([, value]) => Boolean(value?.trim()))),
        };
        autoMeta.value = suggested;
    }
    function resetMeta() {
        const resumeStore = useResumeStore();
        const localeStore = useLocaleStore();
        const suggested = buildSuggestedPdfMeta(resumeStore.data, localeStore.t('pdf.defaultTitleSuffix'));
        meta.value = suggested;
        autoMeta.value = suggested;
    }
    return { meta, syncFromResume, hydrateFromParsed, resetMeta };
});
function shouldSyncField(currentValue, previousAutoValue) {
    return !currentValue.trim() || currentValue === previousAutoValue;
}
