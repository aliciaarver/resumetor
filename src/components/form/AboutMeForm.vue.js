/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { storeToRefs } from 'pinia';
import { useLocaleStore } from '@/stores/locale';
import { useResumeStore } from '@/stores/resume';
import AppTextarea from '@/components/ui/AppTextarea.vue';
const store = useResumeStore();
const localeStore = useLocaleStore();
const { t } = localeStore;
const { data } = storeToRefs(store);
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
const __VLS_0 = AppTextarea;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.data.aboutMe),
    placeholder: (__VLS_ctx.t('form.aboutPlaceholder')),
    rows: (5),
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.data.aboutMe),
    placeholder: (__VLS_ctx.t('form.aboutPlaceholder')),
    rows: (5),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
// @ts-ignore
[t, t, data,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
