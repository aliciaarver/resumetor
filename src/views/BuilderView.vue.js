/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, computed, onMounted, watch } from 'vue';
import { useResizeObserver } from '@vueuse/core';
import { storeToRefs } from 'pinia';
import { usePdfMetaStore } from '@/stores/pdfMeta';
import { usePdfExport } from '@/composables/usePdfExport';
import { useLocaleStore } from '@/stores/locale';
import { useResumeStore } from '@/stores/resume';
import { evaluatePreviewPerformance } from '@/utils/performanceBudget';
import { A4_PX_HEIGHT, A4_PX_WIDTH, measurePagedLayout, } from '@/utils/pagination';
import PdfMetadataPanel from '@/components/pdf/PdfMetadataPanel.vue';
import { RESUME_TEMPLATES } from '@/utils/resumeTemplates';
import ResumeUploader from '@/components/upload/ResumeUploader.vue';
import PersonalInfoForm from '@/components/form/PersonalInfoForm.vue';
import AboutMeForm from '@/components/form/AboutMeForm.vue';
import WorkExperienceForm from '@/components/form/WorkExperienceForm.vue';
import EducationForm from '@/components/form/EducationForm.vue';
import SkillsForm from '@/components/form/SkillsForm.vue';
import LanguagesForm from '@/components/form/LanguagesForm.vue';
import ProjectsForm from '@/components/form/ProjectsForm.vue';
import AppButton from '@/components/ui/AppButton.vue';
const activeTab = ref('edit');
const showPdfSettings = ref(false);
const selectedTemplateId = ref('classic');
const activeTemplate = computed(() => RESUME_TEMPLATES.find((t) => t.id === selectedTemplateId.value) ?? RESUME_TEMPLATES[0]);
const previewContainerEl = ref(null);
const previewComponentRef = ref(null);
const previewScale = ref(1);
const previewNaturalHeight = ref(A4_PX_HEIGHT);
const previewPageStarts = ref([0]);
useResizeObserver(previewContainerEl, ([entry]) => {
    const containerWidth = entry.contentRect.width;
    previewScale.value = containerWidth / A4_PX_WIDTH;
});
const previewEl = computed(() => previewComponentRef.value?.el ?? null);
useResizeObserver(previewEl, ([entry]) => {
    const layout = measurePagedLayout(entry.target);
    previewNaturalHeight.value = layout.height;
    previewPageStarts.value = layout.pageStarts;
});
watch(previewEl, (element) => {
    const layout = measurePagedLayout(element);
    previewNaturalHeight.value = layout.height;
    previewPageStarts.value = layout.pageStarts;
}, { immediate: true });
const pageOffsets = computed(() => previewPageStarts.value.map((naturalTop, index) => ({
    index,
    naturalTop,
})));
const previewStageHeight = computed(() => {
    const lastPageStart = previewPageStarts.value[previewPageStarts.value.length - 1] ?? 0;
    return Math.max(previewNaturalHeight.value, lastPageStart + A4_PX_HEIGHT);
});
const pageStyle = computed(() => ({
    width: `${A4_PX_WIDTH * previewScale.value}px`,
    height: `${previewStageHeight.value * previewScale.value}px`,
    margin: '0 auto',
    flexShrink: 0,
    position: 'relative',
}));
const previewPerformanceNotice = computed(() => {
    const issues = evaluatePreviewPerformance({
        height: previewNaturalHeight.value,
        pageStarts: previewPageStarts.value,
    });
    if (!issues.length)
        return '';
    const labels = issues.map((issue) => t(`builder.performanceIssue.${issue}`)).join(', ');
    return t('builder.performanceNotice', { issues: labels });
});
const pdfMetaStore = usePdfMetaStore();
const { meta } = storeToRefs(pdfMetaStore);
const { exportPdf, exporting } = usePdfExport(previewEl);
const localeStore = useLocaleStore();
const { locale } = storeToRefs(localeStore);
const { locales, t, setLocale } = localeStore;
const resumeStore = useResumeStore();
watch(locale, (nextLocale, previousLocale) => {
    if (!previousLocale)
        return;
    if (resumeStore.localizeDemoResume(nextLocale)) {
        pdfMetaStore.resetMeta();
    }
});
onMounted(() => {
    pdfMetaStore.syncFromResume();
});
async function handleExport() {
    await exportPdf(meta.value);
}
function confirmReset() {
    if (confirm(t('builder.confirmReset'))) {
        resumeStore.resetResume(locale.value);
        pdfMetaStore.resetMeta();
    }
}
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "builder" },
});
/** @type {__VLS_StyleScopedClasses['builder']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "tab-bar" },
    role: "tablist",
    'aria-label': (__VLS_ctx.t('builder.tabListLabel')),
});
/** @type {__VLS_StyleScopedClasses['tab-bar']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.activeTab = 'edit';
            // @ts-ignore
            [t, activeTab,];
        } },
    ...{ class: "tab-bar__btn" },
    type: "button",
    role: "tab",
    id: "builder-tab-edit",
    ...{ class: ({ 'tab-bar__btn--active': __VLS_ctx.activeTab === 'edit' }) },
    'aria-selected': (__VLS_ctx.activeTab === 'edit' ? 'true' : 'false'),
    'aria-controls': "builder-panel-edit",
});
/** @type {__VLS_StyleScopedClasses['tab-bar__btn']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-bar__btn--active']} */ ;
(__VLS_ctx.t('builder.editTab'));
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.activeTab = 'preview';
            // @ts-ignore
            [t, activeTab, activeTab, activeTab,];
        } },
    ...{ class: "tab-bar__btn" },
    type: "button",
    role: "tab",
    id: "builder-tab-preview",
    ...{ class: ({ 'tab-bar__btn--active': __VLS_ctx.activeTab === 'preview' }) },
    'aria-selected': (__VLS_ctx.activeTab === 'preview' ? 'true' : 'false'),
    'aria-controls': "builder-panel-preview",
});
/** @type {__VLS_StyleScopedClasses['tab-bar__btn']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-bar__btn--active']} */ ;
(__VLS_ctx.t('builder.previewTab'));
__VLS_asFunctionalElement1(__VLS_intrinsics.aside, __VLS_intrinsics.aside)({
    id: "builder-panel-edit",
    ...{ class: "builder__form" },
    role: "tabpanel",
    'aria-labelledby': "builder-tab-edit",
    'aria-hidden': (__VLS_ctx.activeTab !== 'edit' ? 'true' : 'false'),
    ...{ class: ({ 'builder__form--visible': __VLS_ctx.activeTab === 'edit' }) },
});
/** @type {__VLS_StyleScopedClasses['builder__form']} */ ;
/** @type {__VLS_StyleScopedClasses['builder__form--visible']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "form-scroll" },
});
/** @type {__VLS_StyleScopedClasses['form-scroll']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "form-header" },
});
/** @type {__VLS_StyleScopedClasses['form-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
    ...{ class: "form-header__logo" },
});
/** @type {__VLS_StyleScopedClasses['form-header__logo']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "form-header__actions" },
});
/** @type {__VLS_StyleScopedClasses['form-header__actions']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "locale-switch" },
    'aria-label': (__VLS_ctx.t('locale.switchLabel')),
    title: (__VLS_ctx.t('locale.switchLabel')),
});
/** @type {__VLS_StyleScopedClasses['locale-switch']} */ ;
for (const [option] of __VLS_vFor((__VLS_ctx.locales))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.setLocale(option);
                // @ts-ignore
                [t, t, t, activeTab, activeTab, activeTab, activeTab, locales, setLocale,];
            } },
        key: (option),
        type: "button",
        ...{ class: "locale-switch__btn" },
        ...{ class: ({ 'locale-switch__btn--active': __VLS_ctx.locale === option }) },
    });
    /** @type {__VLS_StyleScopedClasses['locale-switch__btn']} */ ;
    /** @type {__VLS_StyleScopedClasses['locale-switch__btn--active']} */ ;
    (option.toUpperCase());
    // @ts-ignore
    [locale,];
}
const __VLS_0 = AppButton || AppButton;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
    variant: "ghost",
    size: "sm",
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
    variant: "ghost",
    size: "sm",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_5;
const __VLS_6 = ({ click: {} },
    { onClick: (__VLS_ctx.confirmReset) });
const { default: __VLS_7 } = __VLS_3.slots;
(__VLS_ctx.t('builder.reset'));
// @ts-ignore
[t, confirmReset,];
var __VLS_3;
var __VLS_4;
const __VLS_8 = ResumeUploader;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
    ...{ class: "uploader-section" },
}));
const __VLS_10 = __VLS_9({
    ...{ class: "uploader-section" },
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
/** @type {__VLS_StyleScopedClasses['uploader-section']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "form-sections" },
});
/** @type {__VLS_StyleScopedClasses['form-sections']} */ ;
const __VLS_13 = PersonalInfoForm;
// @ts-ignore
const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({}));
const __VLS_15 = __VLS_14({}, ...__VLS_functionalComponentArgsRest(__VLS_14));
__VLS_asFunctionalElement1(__VLS_intrinsics.div)({
    ...{ class: "divider" },
});
/** @type {__VLS_StyleScopedClasses['divider']} */ ;
const __VLS_18 = AboutMeForm;
// @ts-ignore
const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({}));
const __VLS_20 = __VLS_19({}, ...__VLS_functionalComponentArgsRest(__VLS_19));
__VLS_asFunctionalElement1(__VLS_intrinsics.div)({
    ...{ class: "divider" },
});
/** @type {__VLS_StyleScopedClasses['divider']} */ ;
const __VLS_23 = WorkExperienceForm;
// @ts-ignore
const __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({}));
const __VLS_25 = __VLS_24({}, ...__VLS_functionalComponentArgsRest(__VLS_24));
__VLS_asFunctionalElement1(__VLS_intrinsics.div)({
    ...{ class: "divider" },
});
/** @type {__VLS_StyleScopedClasses['divider']} */ ;
const __VLS_28 = EducationForm;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent1(__VLS_28, new __VLS_28({}));
const __VLS_30 = __VLS_29({}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_asFunctionalElement1(__VLS_intrinsics.div)({
    ...{ class: "divider" },
});
/** @type {__VLS_StyleScopedClasses['divider']} */ ;
const __VLS_33 = SkillsForm;
// @ts-ignore
const __VLS_34 = __VLS_asFunctionalComponent1(__VLS_33, new __VLS_33({}));
const __VLS_35 = __VLS_34({}, ...__VLS_functionalComponentArgsRest(__VLS_34));
__VLS_asFunctionalElement1(__VLS_intrinsics.div)({
    ...{ class: "divider" },
});
/** @type {__VLS_StyleScopedClasses['divider']} */ ;
const __VLS_38 = LanguagesForm;
// @ts-ignore
const __VLS_39 = __VLS_asFunctionalComponent1(__VLS_38, new __VLS_38({}));
const __VLS_40 = __VLS_39({}, ...__VLS_functionalComponentArgsRest(__VLS_39));
__VLS_asFunctionalElement1(__VLS_intrinsics.div)({
    ...{ class: "divider" },
});
/** @type {__VLS_StyleScopedClasses['divider']} */ ;
const __VLS_43 = ProjectsForm;
// @ts-ignore
const __VLS_44 = __VLS_asFunctionalComponent1(__VLS_43, new __VLS_43({}));
const __VLS_45 = __VLS_44({}, ...__VLS_functionalComponentArgsRest(__VLS_44));
__VLS_asFunctionalElement1(__VLS_intrinsics.main, __VLS_intrinsics.main)({
    id: "builder-panel-preview",
    ...{ class: "builder__preview" },
    role: "tabpanel",
    'aria-labelledby': "builder-tab-preview",
    'aria-hidden': (__VLS_ctx.activeTab !== 'preview' ? 'true' : 'false'),
    ...{ class: ({ 'builder__preview--visible': __VLS_ctx.activeTab === 'preview' }) },
});
/** @type {__VLS_StyleScopedClasses['builder__preview']} */ ;
/** @type {__VLS_StyleScopedClasses['builder__preview--visible']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "preview-wrap" },
});
/** @type {__VLS_StyleScopedClasses['preview-wrap']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "preview-actions" },
});
/** @type {__VLS_StyleScopedClasses['preview-actions']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "template-picker" },
});
/** @type {__VLS_StyleScopedClasses['template-picker']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "template-picker__label" },
});
/** @type {__VLS_StyleScopedClasses['template-picker__label']} */ ;
(__VLS_ctx.t('builder.templateLabel'));
__VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
    ...{ onChange: (...[$event]) => {
            __VLS_ctx.selectedTemplateId = $event.target.value;
            // @ts-ignore
            [t, activeTab, activeTab, selectedTemplateId,];
        } },
    ...{ class: "template-picker__select" },
    value: (__VLS_ctx.selectedTemplateId),
});
/** @type {__VLS_StyleScopedClasses['template-picker__select']} */ ;
for (const [tmpl] of __VLS_vFor((__VLS_ctx.RESUME_TEMPLATES))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        key: (tmpl.id),
        value: (tmpl.id),
    });
    (__VLS_ctx.t(tmpl.labelKey));
    // @ts-ignore
    [t, selectedTemplateId, RESUME_TEMPLATES,];
}
const __VLS_48 = AppButton || AppButton;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent1(__VLS_48, new __VLS_48({
    ...{ 'onClick': {} },
    variant: "primary",
    loading: (__VLS_ctx.exporting),
}));
const __VLS_50 = __VLS_49({
    ...{ 'onClick': {} },
    variant: "primary",
    loading: (__VLS_ctx.exporting),
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
let __VLS_53;
const __VLS_54 = ({ click: {} },
    { onClick: (__VLS_ctx.handleExport) });
const { default: __VLS_55 } = __VLS_51.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    'stroke-width': "2",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.path)({
    d: "M12 3v12M7 11l5 5 5-5M4 21h16",
    'stroke-linecap': "round",
    'stroke-linejoin': "round",
});
(__VLS_ctx.t('builder.downloadPdf'));
// @ts-ignore
[t, exporting, handleExport,];
var __VLS_51;
var __VLS_52;
const __VLS_56 = AppButton || AppButton;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent1(__VLS_56, new __VLS_56({
    ...{ 'onClick': {} },
    variant: "secondary",
}));
const __VLS_58 = __VLS_57({
    ...{ 'onClick': {} },
    variant: "secondary",
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
let __VLS_61;
const __VLS_62 = ({ click: {} },
    { onClick: (...[$event]) => {
            __VLS_ctx.showPdfSettings = !__VLS_ctx.showPdfSettings;
            // @ts-ignore
            [showPdfSettings, showPdfSettings,];
        } });
const { default: __VLS_63 } = __VLS_59.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    'stroke-width': "2",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.circle)({
    cx: "12",
    cy: "12",
    r: "3",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.path)({
    d: "M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14",
    'stroke-linecap': "round",
});
(__VLS_ctx.t('builder.pdfSettings'));
// @ts-ignore
[t,];
var __VLS_59;
var __VLS_60;
if (__VLS_ctx.previewPerformanceNotice) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "preview-actions__note" },
        role: "status",
        'aria-live': "polite",
    });
    /** @type {__VLS_StyleScopedClasses['preview-actions__note']} */ ;
    (__VLS_ctx.previewPerformanceNotice);
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "preview-container" },
    ref: "previewContainerEl",
    'aria-label': (__VLS_ctx.t('builder.previewRegionLabel')),
});
/** @type {__VLS_StyleScopedClasses['preview-container']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "preview-pages" },
    ...{ style: (__VLS_ctx.pageStyle) },
});
/** @type {__VLS_StyleScopedClasses['preview-pages']} */ ;
for (const [page] of __VLS_vFor((__VLS_ctx.pageOffsets))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div)({
        key: (page.index),
        ...{ class: "preview-page__sheet" },
        'aria-hidden': "true",
        ...{ style: ({
                top: `${page.naturalTop * __VLS_ctx.previewScale}px`,
                height: `${__VLS_ctx.A4_PX_HEIGHT * __VLS_ctx.previewScale}px`,
            }) },
    });
    /** @type {__VLS_StyleScopedClasses['preview-page__sheet']} */ ;
    // @ts-ignore
    [t, previewPerformanceNotice, previewPerformanceNotice, pageStyle, pageOffsets, previewScale, previewScale, A4_PX_HEIGHT,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "preview-page__content-layer" },
});
/** @type {__VLS_StyleScopedClasses['preview-page__content-layer']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "preview-page__scaler" },
    ...{ style: ({
            transform: `scale(${__VLS_ctx.previewScale})`,
            transformOrigin: 'top left',
            width: `${__VLS_ctx.A4_PX_WIDTH}px`,
            height: `${__VLS_ctx.previewNaturalHeight}px`,
        }) },
});
/** @type {__VLS_StyleScopedClasses['preview-page__scaler']} */ ;
const __VLS_64 = (__VLS_ctx.activeTemplate.component);
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent1(__VLS_64, new __VLS_64({
    ref: "previewComponentRef",
    ...{ class: "preview-page__content" },
}));
const __VLS_66 = __VLS_65({
    ref: "previewComponentRef",
    ...{ class: "preview-page__content" },
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
var __VLS_69 = {};
/** @type {__VLS_StyleScopedClasses['preview-page__content']} */ ;
var __VLS_67;
const __VLS_71 = PdfMetadataPanel;
// @ts-ignore
const __VLS_72 = __VLS_asFunctionalComponent1(__VLS_71, new __VLS_71({
    ...{ 'onClose': {} },
    open: (__VLS_ctx.showPdfSettings),
}));
const __VLS_73 = __VLS_72({
    ...{ 'onClose': {} },
    open: (__VLS_ctx.showPdfSettings),
}, ...__VLS_functionalComponentArgsRest(__VLS_72));
let __VLS_76;
const __VLS_77 = ({ close: {} },
    { onClose: (...[$event]) => {
            __VLS_ctx.showPdfSettings = false;
            // @ts-ignore
            [showPdfSettings, showPdfSettings, previewScale, A4_PX_WIDTH, previewNaturalHeight, activeTemplate,];
        } });
var __VLS_74;
var __VLS_75;
// @ts-ignore
var __VLS_70 = __VLS_69;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
