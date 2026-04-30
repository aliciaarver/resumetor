/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useLocaleStore } from '@/stores/locale';
import { useResumeStore } from '@/stores/resume';
import AppInput from '@/components/ui/AppInput.vue';
import AppTextarea from '@/components/ui/AppTextarea.vue';
import AppButton from '@/components/ui/AppButton.vue';
import AppMonthField from '@/components/ui/AppMonthField.vue';
const store = useResumeStore();
const localeStore = useLocaleStore();
const { t } = localeStore;
const { data } = storeToRefs(store);
const { addProject, addCertification, removeProject } = store;
const monthPlaceholder = computed(() => t('common.monthPlaceholder'));
const projectEntries = computed(() => data.value.projects.filter((entry) => entry.kind === 'project'));
const certificationEntries = computed(() => data.value.projects.filter((entry) => entry.kind === 'certification'));
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['grid-2']} */ ;
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
(__VLS_ctx.t('form.projects'));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "section__actions" },
});
/** @type {__VLS_StyleScopedClasses['section__actions']} */ ;
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
    { onClick: (__VLS_ctx.addProject) });
const { default: __VLS_7 } = __VLS_3.slots;
(__VLS_ctx.t('form.addProject'));
// @ts-ignore
[t, t, addProject,];
var __VLS_3;
var __VLS_4;
const __VLS_8 = AppButton || AppButton;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
    ...{ 'onClick': {} },
    variant: "secondary",
    size: "sm",
}));
const __VLS_10 = __VLS_9({
    ...{ 'onClick': {} },
    variant: "secondary",
    size: "sm",
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
let __VLS_13;
const __VLS_14 = ({ click: {} },
    { onClick: (__VLS_ctx.addCertification) });
const { default: __VLS_15 } = __VLS_11.slots;
(__VLS_ctx.t('form.addCertification'));
// @ts-ignore
[t, addCertification,];
var __VLS_11;
var __VLS_12;
if (__VLS_ctx.projectEntries.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "group" },
    });
    /** @type {__VLS_StyleScopedClasses['group']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
        ...{ class: "group__title" },
    });
    /** @type {__VLS_StyleScopedClasses['group__title']} */ ;
    (__VLS_ctx.t('form.projectsOnly'));
    let __VLS_16;
    /** @ts-ignore @type {typeof __VLS_components.TransitionGroup | typeof __VLS_components.TransitionGroup} */
    TransitionGroup;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent1(__VLS_16, new __VLS_16({
        name: "list",
        tag: "div",
        ...{ class: "list" },
    }));
    const __VLS_18 = __VLS_17({
        name: "list",
        tag: "div",
        ...{ class: "list" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    /** @type {__VLS_StyleScopedClasses['list']} */ ;
    const { default: __VLS_21 } = __VLS_19.slots;
    for (const [project] of __VLS_vFor((__VLS_ctx.projectEntries))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.article, __VLS_intrinsics.article)({
            key: (project.id),
            ...{ class: "block" },
        });
        /** @type {__VLS_StyleScopedClasses['block']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "block__header" },
        });
        /** @type {__VLS_StyleScopedClasses['block__header']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({
            ...{ class: "block__title" },
        });
        /** @type {__VLS_StyleScopedClasses['block__title']} */ ;
        (project.title || __VLS_ctx.t('form.projectEntry'));
        const __VLS_22 = AppButton || AppButton;
        // @ts-ignore
        const __VLS_23 = __VLS_asFunctionalComponent1(__VLS_22, new __VLS_22({
            ...{ 'onClick': {} },
            variant: "ghost",
            size: "sm",
        }));
        const __VLS_24 = __VLS_23({
            ...{ 'onClick': {} },
            variant: "ghost",
            size: "sm",
        }, ...__VLS_functionalComponentArgsRest(__VLS_23));
        let __VLS_27;
        const __VLS_28 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(__VLS_ctx.projectEntries.length))
                        return;
                    __VLS_ctx.removeProject(project.id);
                    // @ts-ignore
                    [t, t, projectEntries, projectEntries, removeProject,];
                } });
        const { default: __VLS_29 } = __VLS_25.slots;
        (__VLS_ctx.t('common.remove'));
        // @ts-ignore
        [t,];
        var __VLS_25;
        var __VLS_26;
        const __VLS_30 = AppInput;
        // @ts-ignore
        const __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
            modelValue: (project.title),
            label: (__VLS_ctx.t('form.projectTitle')),
            placeholder: (__VLS_ctx.t('form.projectTitlePlaceholder')),
        }));
        const __VLS_32 = __VLS_31({
            modelValue: (project.title),
            label: (__VLS_ctx.t('form.projectTitle')),
            placeholder: (__VLS_ctx.t('form.projectTitlePlaceholder')),
        }, ...__VLS_functionalComponentArgsRest(__VLS_31));
        const __VLS_35 = AppInput;
        // @ts-ignore
        const __VLS_36 = __VLS_asFunctionalComponent1(__VLS_35, new __VLS_35({
            modelValue: (project.subtitle),
            label: (__VLS_ctx.t('form.projectRole')),
            placeholder: (__VLS_ctx.t('form.projectRolePlaceholder')),
        }));
        const __VLS_37 = __VLS_36({
            modelValue: (project.subtitle),
            label: (__VLS_ctx.t('form.projectRole')),
            placeholder: (__VLS_ctx.t('form.projectRolePlaceholder')),
        }, ...__VLS_functionalComponentArgsRest(__VLS_36));
        const __VLS_40 = AppInput;
        // @ts-ignore
        const __VLS_41 = __VLS_asFunctionalComponent1(__VLS_40, new __VLS_40({
            modelValue: (project.link),
            label: (__VLS_ctx.t('form.projectLink')),
            placeholder: (__VLS_ctx.t('form.projectLinkPlaceholder')),
        }));
        const __VLS_42 = __VLS_41({
            modelValue: (project.link),
            label: (__VLS_ctx.t('form.projectLink')),
            placeholder: (__VLS_ctx.t('form.projectLinkPlaceholder')),
        }, ...__VLS_functionalComponentArgsRest(__VLS_41));
        const __VLS_45 = AppTextarea;
        // @ts-ignore
        const __VLS_46 = __VLS_asFunctionalComponent1(__VLS_45, new __VLS_45({
            modelValue: (project.description),
            label: (__VLS_ctx.t('form.description')),
            placeholder: (__VLS_ctx.t('form.projectDescriptionPlaceholder')),
            rows: (4),
        }));
        const __VLS_47 = __VLS_46({
            modelValue: (project.description),
            label: (__VLS_ctx.t('form.description')),
            placeholder: (__VLS_ctx.t('form.projectDescriptionPlaceholder')),
            rows: (4),
        }, ...__VLS_functionalComponentArgsRest(__VLS_46));
        // @ts-ignore
        [t, t, t, t, t, t, t, t,];
    }
    // @ts-ignore
    [];
    var __VLS_19;
}
if (__VLS_ctx.certificationEntries.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "group" },
    });
    /** @type {__VLS_StyleScopedClasses['group']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
        ...{ class: "group__title" },
    });
    /** @type {__VLS_StyleScopedClasses['group__title']} */ ;
    (__VLS_ctx.t('form.certifications'));
    let __VLS_50;
    /** @ts-ignore @type {typeof __VLS_components.TransitionGroup | typeof __VLS_components.TransitionGroup} */
    TransitionGroup;
    // @ts-ignore
    const __VLS_51 = __VLS_asFunctionalComponent1(__VLS_50, new __VLS_50({
        name: "list",
        tag: "div",
        ...{ class: "list" },
    }));
    const __VLS_52 = __VLS_51({
        name: "list",
        tag: "div",
        ...{ class: "list" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_51));
    /** @type {__VLS_StyleScopedClasses['list']} */ ;
    const { default: __VLS_55 } = __VLS_53.slots;
    for (const [cert] of __VLS_vFor((__VLS_ctx.certificationEntries))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.article, __VLS_intrinsics.article)({
            key: (cert.id),
            ...{ class: "block block--compact" },
        });
        /** @type {__VLS_StyleScopedClasses['block']} */ ;
        /** @type {__VLS_StyleScopedClasses['block--compact']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "block__header" },
        });
        /** @type {__VLS_StyleScopedClasses['block__header']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({
            ...{ class: "block__title" },
        });
        /** @type {__VLS_StyleScopedClasses['block__title']} */ ;
        (cert.title || __VLS_ctx.t('form.certificationEntry'));
        const __VLS_56 = AppButton || AppButton;
        // @ts-ignore
        const __VLS_57 = __VLS_asFunctionalComponent1(__VLS_56, new __VLS_56({
            ...{ 'onClick': {} },
            variant: "ghost",
            size: "sm",
        }));
        const __VLS_58 = __VLS_57({
            ...{ 'onClick': {} },
            variant: "ghost",
            size: "sm",
        }, ...__VLS_functionalComponentArgsRest(__VLS_57));
        let __VLS_61;
        const __VLS_62 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(__VLS_ctx.certificationEntries.length))
                        return;
                    __VLS_ctx.removeProject(cert.id);
                    // @ts-ignore
                    [t, t, removeProject, certificationEntries, certificationEntries,];
                } });
        const { default: __VLS_63 } = __VLS_59.slots;
        (__VLS_ctx.t('common.remove'));
        // @ts-ignore
        [t,];
        var __VLS_59;
        var __VLS_60;
        const __VLS_64 = AppInput;
        // @ts-ignore
        const __VLS_65 = __VLS_asFunctionalComponent1(__VLS_64, new __VLS_64({
            modelValue: (cert.title),
            label: (__VLS_ctx.t('form.projectTitle')),
            placeholder: (__VLS_ctx.t('form.projectTitlePlaceholder')),
        }));
        const __VLS_66 = __VLS_65({
            modelValue: (cert.title),
            label: (__VLS_ctx.t('form.projectTitle')),
            placeholder: (__VLS_ctx.t('form.projectTitlePlaceholder')),
        }, ...__VLS_functionalComponentArgsRest(__VLS_65));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "grid-2" },
        });
        /** @type {__VLS_StyleScopedClasses['grid-2']} */ ;
        const __VLS_69 = AppInput;
        // @ts-ignore
        const __VLS_70 = __VLS_asFunctionalComponent1(__VLS_69, new __VLS_69({
            modelValue: (cert.subtitle),
            label: (__VLS_ctx.t('form.certificationOrg')),
            placeholder: (__VLS_ctx.t('form.certificationOrgPlaceholder')),
        }));
        const __VLS_71 = __VLS_70({
            modelValue: (cert.subtitle),
            label: (__VLS_ctx.t('form.certificationOrg')),
            placeholder: (__VLS_ctx.t('form.certificationOrgPlaceholder')),
        }, ...__VLS_functionalComponentArgsRest(__VLS_70));
        const __VLS_74 = AppMonthField;
        // @ts-ignore
        const __VLS_75 = __VLS_asFunctionalComponent1(__VLS_74, new __VLS_74({
            modelValue: (cert.issuedAt),
            label: (__VLS_ctx.t('form.certificationDate')),
            placeholder: (__VLS_ctx.monthPlaceholder),
        }));
        const __VLS_76 = __VLS_75({
            modelValue: (cert.issuedAt),
            label: (__VLS_ctx.t('form.certificationDate')),
            placeholder: (__VLS_ctx.monthPlaceholder),
        }, ...__VLS_functionalComponentArgsRest(__VLS_75));
        const __VLS_79 = AppInput;
        // @ts-ignore
        const __VLS_80 = __VLS_asFunctionalComponent1(__VLS_79, new __VLS_79({
            modelValue: (cert.link),
            label: (__VLS_ctx.t('form.projectLink')),
            placeholder: (__VLS_ctx.t('form.projectLinkPlaceholder')),
        }));
        const __VLS_81 = __VLS_80({
            modelValue: (cert.link),
            label: (__VLS_ctx.t('form.projectLink')),
            placeholder: (__VLS_ctx.t('form.projectLinkPlaceholder')),
        }, ...__VLS_functionalComponentArgsRest(__VLS_80));
        const __VLS_84 = AppTextarea;
        // @ts-ignore
        const __VLS_85 = __VLS_asFunctionalComponent1(__VLS_84, new __VLS_84({
            modelValue: (cert.description),
            label: (__VLS_ctx.t('form.description')),
            placeholder: (__VLS_ctx.t('form.projectDescriptionPlaceholder')),
            rows: (3),
        }));
        const __VLS_86 = __VLS_85({
            modelValue: (cert.description),
            label: (__VLS_ctx.t('form.description')),
            placeholder: (__VLS_ctx.t('form.projectDescriptionPlaceholder')),
            rows: (3),
        }, ...__VLS_functionalComponentArgsRest(__VLS_85));
        // @ts-ignore
        [t, t, t, t, t, t, t, t, t, monthPlaceholder,];
    }
    // @ts-ignore
    [];
    var __VLS_53;
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
