/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { storeToRefs } from 'pinia';
import { useLocaleStore } from '@/stores/locale';
import { useResumeStore } from '@/stores/resume';
import WorkExperienceBlock from './WorkExperienceBlock.vue';
import AppButton from '@/components/ui/AppButton.vue';
const store = useResumeStore();
const localeStore = useLocaleStore();
const { t } = localeStore;
const { data } = storeToRefs(store);
const { addWorkExperience, removeWorkExperience } = store;
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
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "section__header" },
});
/** @type {__VLS_StyleScopedClasses['section__header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
    ...{ class: "section__title" },
});
/** @type {__VLS_StyleScopedClasses['section__title']} */ ;
(__VLS_ctx.t('form.workExperience'));
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
    { onClick: (__VLS_ctx.addWorkExperience) });
const { default: __VLS_7 } = __VLS_3.slots;
(__VLS_ctx.t('common.add'));
// @ts-ignore
[t, t, addWorkExperience,];
var __VLS_3;
var __VLS_4;
if (__VLS_ctx.data.workExperience.length) {
    let __VLS_8;
    /** @ts-ignore @type {typeof __VLS_components.TransitionGroup | typeof __VLS_components.TransitionGroup} */
    TransitionGroup;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
        name: "list",
        tag: "div",
        ...{ class: "list" },
    }));
    const __VLS_10 = __VLS_9({
        name: "list",
        tag: "div",
        ...{ class: "list" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    /** @type {__VLS_StyleScopedClasses['list']} */ ;
    const { default: __VLS_13 } = __VLS_11.slots;
    for (const [exp] of __VLS_vFor((__VLS_ctx.data.workExperience))) {
        const __VLS_14 = WorkExperienceBlock;
        // @ts-ignore
        const __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({
            ...{ 'onRemove': {} },
            key: (exp.id),
            exp: (exp),
        }));
        const __VLS_16 = __VLS_15({
            ...{ 'onRemove': {} },
            key: (exp.id),
            exp: (exp),
        }, ...__VLS_functionalComponentArgsRest(__VLS_15));
        let __VLS_19;
        const __VLS_20 = ({ remove: {} },
            { onRemove: (...[$event]) => {
                    if (!(__VLS_ctx.data.workExperience.length))
                        return;
                    __VLS_ctx.removeWorkExperience(exp.id);
                    // @ts-ignore
                    [data, data, removeWorkExperience,];
                } });
        var __VLS_17;
        var __VLS_18;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_11;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "empty" },
    });
    /** @type {__VLS_StyleScopedClasses['empty']} */ ;
    (__VLS_ctx.t('form.workExperienceEmpty'));
}
// @ts-ignore
[t,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
