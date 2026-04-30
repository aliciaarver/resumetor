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
const { proficiencyOptions } = storeToRefs(localeStore);
const { addLanguage, removeLanguage } = store;
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['lang-row']} */ ;
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
(__VLS_ctx.t('form.languages'));
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
    { onClick: (__VLS_ctx.addLanguage) });
const { default: __VLS_7 } = __VLS_3.slots;
(__VLS_ctx.t('common.add'));
// @ts-ignore
[t, t, addLanguage,];
var __VLS_3;
var __VLS_4;
if (__VLS_ctx.data.languages.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "langs" },
    });
    /** @type {__VLS_StyleScopedClasses['langs']} */ ;
    let __VLS_8;
    /** @ts-ignore @type {typeof __VLS_components.TransitionGroup | typeof __VLS_components.TransitionGroup} */
    TransitionGroup;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
        name: "list",
        tag: "div",
        ...{ class: "langs__list" },
    }));
    const __VLS_10 = __VLS_9({
        name: "list",
        tag: "div",
        ...{ class: "langs__list" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    /** @type {__VLS_StyleScopedClasses['langs__list']} */ ;
    const { default: __VLS_13 } = __VLS_11.slots;
    for (const [lang] of __VLS_vFor((__VLS_ctx.data.languages))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (lang.id),
            ...{ class: "lang-row" },
        });
        /** @type {__VLS_StyleScopedClasses['lang-row']} */ ;
        const __VLS_14 = AppInput;
        // @ts-ignore
        const __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({
            modelValue: (lang.name),
            placeholder: (__VLS_ctx.t('form.languagePlaceholder')),
        }));
        const __VLS_16 = __VLS_15({
            modelValue: (lang.name),
            placeholder: (__VLS_ctx.t('form.languagePlaceholder')),
        }, ...__VLS_functionalComponentArgsRest(__VLS_15));
        __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
            value: (lang.proficiency),
            ...{ class: "select" },
        });
        /** @type {__VLS_StyleScopedClasses['select']} */ ;
        for (const [option] of __VLS_vFor((__VLS_ctx.proficiencyOptions))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
                key: (option.value),
                value: (option.value),
            });
            (option.label);
            // @ts-ignore
            [t, data, data, proficiencyOptions,];
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.data.languages.length))
                        return;
                    __VLS_ctx.removeLanguage(lang.id);
                    // @ts-ignore
                    [removeLanguage,];
                } },
            ...{ class: "lang-row__remove" },
            title: (__VLS_ctx.t('common.remove')),
        });
        /** @type {__VLS_StyleScopedClasses['lang-row__remove']} */ ;
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
    (__VLS_ctx.t('form.languagesEmpty'));
}
// @ts-ignore
[t,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
