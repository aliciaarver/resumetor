/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { storeToRefs } from 'pinia';
import { useLocaleStore } from '@/stores/locale';
import { useResumeStore } from '@/stores/resume';
import AppInput from '@/components/ui/AppInput.vue';
import AppButton from '@/components/ui/AppButton.vue';
const store = useResumeStore();
const localeStore = useLocaleStore();
const { t } = localeStore;
const { data } = storeToRefs(store);
const { addSkill, removeSkill } = store;
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
(__VLS_ctx.t('form.skills'));
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
    { onClick: (__VLS_ctx.addSkill) });
const { default: __VLS_7 } = __VLS_3.slots;
(__VLS_ctx.t('common.add'));
// @ts-ignore
[t, t, addSkill,];
var __VLS_3;
var __VLS_4;
if (__VLS_ctx.data.skills.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "skills" },
    });
    /** @type {__VLS_StyleScopedClasses['skills']} */ ;
    let __VLS_8;
    /** @ts-ignore @type {typeof __VLS_components.TransitionGroup | typeof __VLS_components.TransitionGroup} */
    TransitionGroup;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
        name: "list",
        tag: "div",
        ...{ class: "skills__list" },
    }));
    const __VLS_10 = __VLS_9({
        name: "list",
        tag: "div",
        ...{ class: "skills__list" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    /** @type {__VLS_StyleScopedClasses['skills__list']} */ ;
    const { default: __VLS_13 } = __VLS_11.slots;
    for (const [skill] of __VLS_vFor((__VLS_ctx.data.skills))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (skill.id),
            ...{ class: "skill-row" },
        });
        /** @type {__VLS_StyleScopedClasses['skill-row']} */ ;
        const __VLS_14 = AppInput;
        // @ts-ignore
        const __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({
            modelValue: (skill.name),
            placeholder: (__VLS_ctx.t('form.skillPlaceholder')),
        }));
        const __VLS_16 = __VLS_15({
            modelValue: (skill.name),
            placeholder: (__VLS_ctx.t('form.skillPlaceholder')),
        }, ...__VLS_functionalComponentArgsRest(__VLS_15));
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.data.skills.length))
                        return;
                    __VLS_ctx.removeSkill(skill.id);
                    // @ts-ignore
                    [t, data, data, removeSkill,];
                } },
            ...{ class: "skill-row__remove" },
            title: (__VLS_ctx.t('common.remove')),
        });
        /** @type {__VLS_StyleScopedClasses['skill-row__remove']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
            width: "14",
            height: "14",
            viewBox: "0 0 14 14",
            fill: "none",
        });
        __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
            d: "M1 1l12 12M13 1L1 13",
            stroke: "currentColor",
            'stroke-width': "2",
            'stroke-linecap': "round",
        });
        // @ts-ignore
        [t,];
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
    (__VLS_ctx.t('form.skillsEmpty'));
}
// @ts-ignore
[t,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
