/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useLocaleStore } from '@/stores/locale';
import AppInput from '@/components/ui/AppInput.vue';
import AppMonthField from '@/components/ui/AppMonthField.vue';
import AppTextarea from '@/components/ui/AppTextarea.vue';
import AppButton from '@/components/ui/AppButton.vue';
import WritingHint from '@/components/ui/WritingHint.vue';
const props = defineProps();
const __VLS_emit = defineEmits();
const localeStore = useLocaleStore();
const { t } = localeStore;
const { locale } = storeToRefs(localeStore);
const WORK_CHECKLIST = {
    ru: [
        'Начинайте с глагола действия (разрабатывал, оптимизировал, внедрил)',
        'Добавьте измеримый результат: цифры, %, сроки',
        'Укажите технологии, релевантные вакансии',
        'Описывайте зону ответственности, а не только задачи',
        'Оптимальная длина: 3–6 предложений',
    ],
    en: [
        'Start with an action verb (developed, optimized, implemented)',
        'Add a measurable result: numbers, %, timeframe',
        'Name the technologies relevant to the role',
        'Describe scope of responsibility, not just tasks',
        'Ideal length: 3–6 sentences',
    ],
};
const workChecklist = computed(() => WORK_CHECKLIST[locale.value] ?? WORK_CHECKLIST.en);
const monthPlaceholder = computed(() => t('common.monthPlaceholder'));
const skillDraft = ref('');
function onCurrentChange() {
    if (props.exp.isCurrent)
        props.exp.toMonth = '';
}
function commitSkills() {
    const nextSkills = skillDraft.value
        .split(/[,;|]+/g)
        .map((entry) => entry.trim())
        .filter(Boolean);
    if (!nextSkills.length)
        return;
    const seen = new Set(props.exp.skills.map((skill) => skill.toLowerCase()));
    for (const skill of nextSkills) {
        const key = skill.toLowerCase();
        if (seen.has(key))
            continue;
        props.exp.skills.push(skill);
        seen.add(key);
    }
    skillDraft.value = '';
}
function removeSkill(index) {
    props.exp.skills.splice(index, 1);
}
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['grid-2']} */ ;
/** @type {__VLS_StyleScopedClasses['dates']} */ ;
/** @type {__VLS_StyleScopedClasses['current-check']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "block" },
});
/** @type {__VLS_StyleScopedClasses['block']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "block__header" },
});
/** @type {__VLS_StyleScopedClasses['block__header']} */ ;
const __VLS_0 = AppButton || AppButton;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
    variant: "danger",
    size: "sm",
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
    variant: "danger",
    size: "sm",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_5;
const __VLS_6 = ({ click: {} },
    { onClick: (...[$event]) => {
            __VLS_ctx.$emit('remove');
            // @ts-ignore
            [$emit,];
        } });
const { default: __VLS_7 } = __VLS_3.slots;
(__VLS_ctx.t('common.remove'));
// @ts-ignore
[t,];
var __VLS_3;
var __VLS_4;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "grid-2" },
});
/** @type {__VLS_StyleScopedClasses['grid-2']} */ ;
const __VLS_8 = AppInput;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
    modelValue: (__VLS_ctx.exp.company),
    label: (__VLS_ctx.t('form.company')),
    placeholder: (__VLS_ctx.t('form.companyPlaceholder')),
}));
const __VLS_10 = __VLS_9({
    modelValue: (__VLS_ctx.exp.company),
    label: (__VLS_ctx.t('form.company')),
    placeholder: (__VLS_ctx.t('form.companyPlaceholder')),
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
const __VLS_13 = AppInput;
// @ts-ignore
const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
    modelValue: (__VLS_ctx.exp.companyUrl),
    label: (__VLS_ctx.t('form.companyUrl')),
    placeholder: "https://...",
}));
const __VLS_15 = __VLS_14({
    modelValue: (__VLS_ctx.exp.companyUrl),
    label: (__VLS_ctx.t('form.companyUrl')),
    placeholder: "https://...",
}, ...__VLS_functionalComponentArgsRest(__VLS_14));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "grid-2" },
});
/** @type {__VLS_StyleScopedClasses['grid-2']} */ ;
const __VLS_18 = AppInput;
// @ts-ignore
const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
    modelValue: (__VLS_ctx.exp.position),
    label: (__VLS_ctx.t('form.position')),
    placeholder: (__VLS_ctx.t('form.positionPlaceholder')),
}));
const __VLS_20 = __VLS_19({
    modelValue: (__VLS_ctx.exp.position),
    label: (__VLS_ctx.t('form.position')),
    placeholder: (__VLS_ctx.t('form.positionPlaceholder')),
}, ...__VLS_functionalComponentArgsRest(__VLS_19));
const __VLS_23 = AppInput;
// @ts-ignore
const __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({
    modelValue: (__VLS_ctx.exp.location),
    label: (__VLS_ctx.t('form.experienceLocation')),
    placeholder: (__VLS_ctx.t('form.experienceLocationPlaceholder')),
}));
const __VLS_25 = __VLS_24({
    modelValue: (__VLS_ctx.exp.location),
    label: (__VLS_ctx.t('form.experienceLocation')),
    placeholder: (__VLS_ctx.t('form.experienceLocationPlaceholder')),
}, ...__VLS_functionalComponentArgsRest(__VLS_24));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "dates" },
});
/** @type {__VLS_StyleScopedClasses['dates']} */ ;
const __VLS_28 = AppMonthField;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent1(__VLS_28, new __VLS_28({
    modelValue: (__VLS_ctx.exp.fromMonth),
    ...{ class: "dates__field" },
    label: (__VLS_ctx.t('common.from')),
    placeholder: (__VLS_ctx.monthPlaceholder),
}));
const __VLS_30 = __VLS_29({
    modelValue: (__VLS_ctx.exp.fromMonth),
    ...{ class: "dates__field" },
    label: (__VLS_ctx.t('common.from')),
    placeholder: (__VLS_ctx.monthPlaceholder),
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
/** @type {__VLS_StyleScopedClasses['dates__field']} */ ;
const __VLS_33 = AppMonthField;
// @ts-ignore
const __VLS_34 = __VLS_asFunctionalComponent1(__VLS_33, new __VLS_33({
    modelValue: (__VLS_ctx.exp.toMonth),
    ...{ class: "dates__field" },
    label: (__VLS_ctx.t('common.to')),
    placeholder: (__VLS_ctx.monthPlaceholder),
    disabled: (__VLS_ctx.exp.isCurrent),
}));
const __VLS_35 = __VLS_34({
    modelValue: (__VLS_ctx.exp.toMonth),
    ...{ class: "dates__field" },
    label: (__VLS_ctx.t('common.to')),
    placeholder: (__VLS_ctx.monthPlaceholder),
    disabled: (__VLS_ctx.exp.isCurrent),
}, ...__VLS_functionalComponentArgsRest(__VLS_34));
/** @type {__VLS_StyleScopedClasses['dates__field']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
    ...{ class: "current-check" },
});
/** @type {__VLS_StyleScopedClasses['current-check']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.input)({
    ...{ onChange: (__VLS_ctx.onCurrentChange) },
    type: "checkbox",
});
(__VLS_ctx.exp.isCurrent);
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
(__VLS_ctx.t('common.present'));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "tags-field" },
});
/** @type {__VLS_StyleScopedClasses['tags-field']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
    ...{ class: "tags-field__label" },
});
/** @type {__VLS_StyleScopedClasses['tags-field__label']} */ ;
(__VLS_ctx.t('form.stack'));
if (__VLS_ctx.exp.skills.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "tags-field__list" },
    });
    /** @type {__VLS_StyleScopedClasses['tags-field__list']} */ ;
    for (const [skill, skillIndex] of __VLS_vFor((__VLS_ctx.exp.skills))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.exp.skills.length))
                        return;
                    __VLS_ctx.removeSkill(skillIndex);
                    // @ts-ignore
                    [t, t, t, t, t, t, t, t, t, t, t, exp, exp, exp, exp, exp, exp, exp, exp, exp, exp, monthPlaceholder, monthPlaceholder, onCurrentChange, removeSkill,];
                } },
            key: (`${__VLS_ctx.exp.id}-${skill}-${skillIndex}`),
            type: "button",
            ...{ class: "tags-field__tag" },
        });
        /** @type {__VLS_StyleScopedClasses['tags-field__tag']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (skill);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            'aria-hidden': "true",
        });
        // @ts-ignore
        [exp,];
    }
}
const __VLS_38 = AppInput;
// @ts-ignore
const __VLS_39 = __VLS_asFunctionalComponent1(__VLS_38, new __VLS_38({
    ...{ 'onKeydown': {} },
    ...{ 'onBlur': {} },
    modelValue: (__VLS_ctx.skillDraft),
    placeholder: (__VLS_ctx.t('form.stackPlaceholder')),
}));
const __VLS_40 = __VLS_39({
    ...{ 'onKeydown': {} },
    ...{ 'onBlur': {} },
    modelValue: (__VLS_ctx.skillDraft),
    placeholder: (__VLS_ctx.t('form.stackPlaceholder')),
}, ...__VLS_functionalComponentArgsRest(__VLS_39));
let __VLS_43;
const __VLS_44 = ({ keydown: {} },
    { onKeydown: (__VLS_ctx.commitSkills) });
const __VLS_45 = ({ blur: {} },
    { onBlur: (__VLS_ctx.commitSkills) });
var __VLS_41;
var __VLS_42;
const __VLS_46 = WritingHint;
// @ts-ignore
const __VLS_47 = __VLS_asFunctionalComponent1(__VLS_46, new __VLS_46({
    fieldValue: (__VLS_ctx.exp.description),
    title: (__VLS_ctx.t('form.workDescriptionHintTitle')),
    example: (__VLS_ctx.t('form.workDescriptionHintExample')),
    checklist: (__VLS_ctx.workChecklist),
}));
const __VLS_48 = __VLS_47({
    fieldValue: (__VLS_ctx.exp.description),
    title: (__VLS_ctx.t('form.workDescriptionHintTitle')),
    example: (__VLS_ctx.t('form.workDescriptionHintExample')),
    checklist: (__VLS_ctx.workChecklist),
}, ...__VLS_functionalComponentArgsRest(__VLS_47));
const __VLS_51 = AppTextarea;
// @ts-ignore
const __VLS_52 = __VLS_asFunctionalComponent1(__VLS_51, new __VLS_51({
    modelValue: (__VLS_ctx.exp.description),
    label: (__VLS_ctx.t('form.description')),
    placeholder: (__VLS_ctx.t('form.workDescriptionPlaceholder')),
    rows: (4),
}));
const __VLS_53 = __VLS_52({
    modelValue: (__VLS_ctx.exp.description),
    label: (__VLS_ctx.t('form.description')),
    placeholder: (__VLS_ctx.t('form.workDescriptionPlaceholder')),
    rows: (4),
}, ...__VLS_functionalComponentArgsRest(__VLS_52));
// @ts-ignore
[t, t, t, t, t, exp, exp, skillDraft, commitSkills, commitSkills, workChecklist,];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
export default {};
