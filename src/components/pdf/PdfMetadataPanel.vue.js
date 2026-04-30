/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { useId } from 'vue';
import { storeToRefs } from 'pinia';
import { usePdfMetaStore } from '@/stores/pdfMeta';
import { useLocaleStore } from '@/stores/locale';
import AppInput from '@/components/ui/AppInput.vue';
import AppTextarea from '@/components/ui/AppTextarea.vue';
const __VLS_props = defineProps();
const __VLS_emit = defineEmits();
const pdfMetaStore = usePdfMetaStore();
const localeStore = useLocaleStore();
const { t } = localeStore;
const { meta } = storeToRefs(pdfMetaStore);
const titleId = useId();
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
if (__VLS_ctx.open) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "panel-layer" },
    });
    /** @type {__VLS_StyleScopedClasses['panel-layer']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.open))
                    return;
                __VLS_ctx.$emit('close');
                // @ts-ignore
                [open, $emit,];
            } },
        type: "button",
        ...{ class: "panel-layer__backdrop" },
        'aria-label': "Close PDF settings",
    });
    /** @type {__VLS_StyleScopedClasses['panel-layer__backdrop']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "panel" },
        role: "dialog",
        'aria-modal': "true",
        'aria-labelledby': (__VLS_ctx.titleId),
    });
    /** @type {__VLS_StyleScopedClasses['panel']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "panel__header" },
    });
    /** @type {__VLS_StyleScopedClasses['panel__header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        id: (__VLS_ctx.titleId),
        ...{ class: "panel__title" },
    });
    /** @type {__VLS_StyleScopedClasses['panel__title']} */ ;
    (__VLS_ctx.t('pdf.settings'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.open))
                    return;
                __VLS_ctx.$emit('close');
                // @ts-ignore
                [$emit, titleId, titleId, t,];
            } },
        type: "button",
        ...{ class: "panel__close" },
    });
    /** @type {__VLS_StyleScopedClasses['panel__close']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        width: "16",
        height: "16",
        viewBox: "0 0 16 16",
        fill: "none",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        d: "M2 2l12 12M14 2L2 14",
        stroke: "currentColor",
        'stroke-width': "2",
        'stroke-linecap': "round",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "panel__hint" },
    });
    /** @type {__VLS_StyleScopedClasses['panel__hint']} */ ;
    (__VLS_ctx.t('pdf.hint'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "panel__fields" },
    });
    /** @type {__VLS_StyleScopedClasses['panel__fields']} */ ;
    const __VLS_0 = AppInput;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        modelValue: (__VLS_ctx.meta.title),
        label: (__VLS_ctx.t('pdf.title')),
        placeholder: (__VLS_ctx.t('pdf.titlePlaceholder')),
    }));
    const __VLS_2 = __VLS_1({
        modelValue: (__VLS_ctx.meta.title),
        label: (__VLS_ctx.t('pdf.title')),
        placeholder: (__VLS_ctx.t('pdf.titlePlaceholder')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    const __VLS_5 = AppInput;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
        modelValue: (__VLS_ctx.meta.author),
        label: (__VLS_ctx.t('pdf.author')),
        placeholder: (__VLS_ctx.t('pdf.authorPlaceholder')),
    }));
    const __VLS_7 = __VLS_6({
        modelValue: (__VLS_ctx.meta.author),
        label: (__VLS_ctx.t('pdf.author')),
        placeholder: (__VLS_ctx.t('pdf.authorPlaceholder')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    const __VLS_10 = AppTextarea;
    // @ts-ignore
    const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({
        modelValue: (__VLS_ctx.meta.subject),
        label: (__VLS_ctx.t('pdf.subject')),
        placeholder: (__VLS_ctx.t('pdf.subjectPlaceholder')),
        rows: (3),
    }));
    const __VLS_12 = __VLS_11({
        modelValue: (__VLS_ctx.meta.subject),
        label: (__VLS_ctx.t('pdf.subject')),
        placeholder: (__VLS_ctx.t('pdf.subjectPlaceholder')),
        rows: (3),
    }, ...__VLS_functionalComponentArgsRest(__VLS_11));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "keywords-field" },
    });
    /** @type {__VLS_StyleScopedClasses['keywords-field']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "kw-label" },
    });
    /** @type {__VLS_StyleScopedClasses['kw-label']} */ ;
    (__VLS_ctx.t('pdf.keywords'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "kw-hint" },
    });
    /** @type {__VLS_StyleScopedClasses['kw-hint']} */ ;
    (__VLS_ctx.t('pdf.keywordsHint'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        ...{ class: "kw-input" },
        placeholder: (__VLS_ctx.t('pdf.keywordsPlaceholder')),
    });
    (__VLS_ctx.meta.keywords);
    /** @type {__VLS_StyleScopedClasses['kw-input']} */ ;
}
// @ts-ignore
[t, t, t, t, t, t, t, t, t, t, meta, meta, meta, meta,];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
export default {};
