/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useLocaleStore } from '@/stores/locale';
import { useResumeStore } from '@/stores/resume';
import AppInput from '@/components/ui/AppInput.vue';
import AppMonthField from '@/components/ui/AppMonthField.vue';
import AppButton from '@/components/ui/AppButton.vue';
const store = useResumeStore();
const localeStore = useLocaleStore();
const { t } = localeStore;
const monthPlaceholder = computed(() => t('common.monthPlaceholder'));
const { data } = storeToRefs(store);
const { addEducation, removeEducation } = store;
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['grid-2']} */ ;
/** @type {__VLS_StyleScopedClasses['dates']} */ ;
/** @type {__VLS_StyleScopedClasses['current-check']} */ ;
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
(__VLS_ctx.t('form.education'));
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
    { onClick: (__VLS_ctx.addEducation) });
const { default: __VLS_7 } = __VLS_3.slots;
(__VLS_ctx.t('common.add'));
// @ts-ignore
[t, t, addEducation,];
var __VLS_3;
var __VLS_4;
if (__VLS_ctx.data.education.length) {
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
    for (const [edu] of __VLS_vFor((__VLS_ctx.data.education))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (edu.id),
            ...{ class: "block" },
        });
        /** @type {__VLS_StyleScopedClasses['block']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "block__header" },
        });
        /** @type {__VLS_StyleScopedClasses['block__header']} */ ;
        const __VLS_14 = AppButton || AppButton;
        // @ts-ignore
        const __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({
            ...{ 'onClick': {} },
            variant: "danger",
            size: "sm",
        }));
        const __VLS_16 = __VLS_15({
            ...{ 'onClick': {} },
            variant: "danger",
            size: "sm",
        }, ...__VLS_functionalComponentArgsRest(__VLS_15));
        let __VLS_19;
        const __VLS_20 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(__VLS_ctx.data.education.length))
                        return;
                    __VLS_ctx.removeEducation(edu.id);
                    // @ts-ignore
                    [data, data, removeEducation,];
                } });
        const { default: __VLS_21 } = __VLS_17.slots;
        (__VLS_ctx.t('common.remove'));
        // @ts-ignore
        [t,];
        var __VLS_17;
        var __VLS_18;
        const __VLS_22 = AppInput;
        // @ts-ignore
        const __VLS_23 = __VLS_asFunctionalComponent1(__VLS_22, new __VLS_22({
            modelValue: (edu.institution),
            label: (__VLS_ctx.t('form.institution')),
            placeholder: (__VLS_ctx.t('form.institutionPlaceholder')),
        }));
        const __VLS_24 = __VLS_23({
            modelValue: (edu.institution),
            label: (__VLS_ctx.t('form.institution')),
            placeholder: (__VLS_ctx.t('form.institutionPlaceholder')),
        }, ...__VLS_functionalComponentArgsRest(__VLS_23));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "grid-2" },
        });
        /** @type {__VLS_StyleScopedClasses['grid-2']} */ ;
        const __VLS_27 = AppInput;
        // @ts-ignore
        const __VLS_28 = __VLS_asFunctionalComponent1(__VLS_27, new __VLS_27({
            modelValue: (edu.degree),
            label: (__VLS_ctx.t('form.degree')),
            placeholder: (__VLS_ctx.t('form.degreePlaceholder')),
        }));
        const __VLS_29 = __VLS_28({
            modelValue: (edu.degree),
            label: (__VLS_ctx.t('form.degree')),
            placeholder: (__VLS_ctx.t('form.degreePlaceholder')),
        }, ...__VLS_functionalComponentArgsRest(__VLS_28));
        const __VLS_32 = AppInput;
        // @ts-ignore
        const __VLS_33 = __VLS_asFunctionalComponent1(__VLS_32, new __VLS_32({
            modelValue: (edu.field),
            label: (__VLS_ctx.t('form.fieldOfStudy')),
            placeholder: (__VLS_ctx.t('form.fieldOfStudyPlaceholder')),
        }));
        const __VLS_34 = __VLS_33({
            modelValue: (edu.field),
            label: (__VLS_ctx.t('form.fieldOfStudy')),
            placeholder: (__VLS_ctx.t('form.fieldOfStudyPlaceholder')),
        }, ...__VLS_functionalComponentArgsRest(__VLS_33));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "dates" },
        });
        /** @type {__VLS_StyleScopedClasses['dates']} */ ;
        const __VLS_37 = AppMonthField;
        // @ts-ignore
        const __VLS_38 = __VLS_asFunctionalComponent1(__VLS_37, new __VLS_37({
            modelValue: (edu.fromMonth),
            ...{ class: "dates__field" },
            label: (__VLS_ctx.t('common.from')),
            placeholder: (__VLS_ctx.monthPlaceholder),
        }));
        const __VLS_39 = __VLS_38({
            modelValue: (edu.fromMonth),
            ...{ class: "dates__field" },
            label: (__VLS_ctx.t('common.from')),
            placeholder: (__VLS_ctx.monthPlaceholder),
        }, ...__VLS_functionalComponentArgsRest(__VLS_38));
        /** @type {__VLS_StyleScopedClasses['dates__field']} */ ;
        const __VLS_42 = AppMonthField;
        // @ts-ignore
        const __VLS_43 = __VLS_asFunctionalComponent1(__VLS_42, new __VLS_42({
            modelValue: (edu.toMonth),
            ...{ class: "dates__field" },
            label: (__VLS_ctx.t('common.to')),
            placeholder: (__VLS_ctx.monthPlaceholder),
            disabled: (edu.isCurrent),
        }));
        const __VLS_44 = __VLS_43({
            modelValue: (edu.toMonth),
            ...{ class: "dates__field" },
            label: (__VLS_ctx.t('common.to')),
            placeholder: (__VLS_ctx.monthPlaceholder),
            disabled: (edu.isCurrent),
        }, ...__VLS_functionalComponentArgsRest(__VLS_43));
        /** @type {__VLS_StyleScopedClasses['dates__field']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
            ...{ class: "current-check" },
        });
        /** @type {__VLS_StyleScopedClasses['current-check']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
            ...{ onChange: (...[$event]) => {
                    if (!(__VLS_ctx.data.education.length))
                        return;
                    edu.isCurrent && (edu.toMonth = '');
                    // @ts-ignore
                    [t, t, t, t, t, t, t, t, monthPlaceholder, monthPlaceholder,];
                } },
            type: "checkbox",
        });
        (edu.isCurrent);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (__VLS_ctx.t('common.present'));
        // @ts-ignore
        [t,];
    }
    // @ts-ignore
    [];
    var __VLS_11;
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
