/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useLocaleStore } from '@/stores/locale';
import { useResumeStore } from '@/stores/resume';
import AppTextarea from '@/components/ui/AppTextarea.vue';
import WritingHint from '@/components/ui/WritingHint.vue';
const store = useResumeStore();
const localeStore = useLocaleStore();
const { t } = localeStore;
const { locale } = storeToRefs(localeStore);
const { data } = storeToRefs(store);
const CHECKLIST = {
    ru: [
        'Укажите специализацию и лет опыта',
        'Добавьте 1–2 конкретных достижения с цифрами',
        'Упомяните ключевые домены или технологии',
        'Оптимальная длина: 3–5 предложений',
    ],
    en: [
        'State your specialization and years of experience',
        'Add 1–2 specific achievements with numbers',
        'Mention key domains or technologies',
        'Ideal length: 3–5 sentences',
    ],
};
const aboutChecklist = computed(() => CHECKLIST[locale.value] ?? CHECKLIST.en);
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
    ...{ class: "section" },
});
/** @type {__VLS_StyleScopedClasses['section']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
    ...{ class: "section__title" },
});
/** @type {__VLS_StyleScopedClasses['section__title']} */ ;
(__VLS_ctx.t('form.aboutMe'));
const __VLS_0 = WritingHint;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    fieldValue: (__VLS_ctx.data.aboutMe),
    title: (__VLS_ctx.t('form.aboutHintTitle')),
    example: (__VLS_ctx.t('form.aboutHintExample')),
    checklist: (__VLS_ctx.aboutChecklist),
}));
const __VLS_2 = __VLS_1({
    fieldValue: (__VLS_ctx.data.aboutMe),
    title: (__VLS_ctx.t('form.aboutHintTitle')),
    example: (__VLS_ctx.t('form.aboutHintExample')),
    checklist: (__VLS_ctx.aboutChecklist),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const __VLS_5 = AppTextarea;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
    modelValue: (__VLS_ctx.data.aboutMe),
    placeholder: (__VLS_ctx.t('form.aboutPlaceholder')),
    rows: (5),
}));
const __VLS_7 = __VLS_6({
    modelValue: (__VLS_ctx.data.aboutMe),
    placeholder: (__VLS_ctx.t('form.aboutPlaceholder')),
    rows: (5),
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
// @ts-ignore
[t, t, t, t, data, data, aboutChecklist,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
