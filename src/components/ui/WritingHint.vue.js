/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, computed } from 'vue';
const props = defineProps();
const userExpanded = ref(null);
const visible = computed(() => !props.fieldValue || userExpanded.value !== false);
const expanded = computed({
    get: () => {
        if (userExpanded.value !== null)
            return userExpanded.value;
        return !props.fieldValue;
    },
    set: (val) => {
        userExpanded.value = val;
    },
});
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
if (__VLS_ctx.visible) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "hint" },
    });
    /** @type {__VLS_StyleScopedClasses['hint']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.visible))
                    return;
                __VLS_ctx.expanded = !__VLS_ctx.expanded;
                // @ts-ignore
                [visible, expanded, expanded,];
            } },
        type: "button",
        ...{ class: "hint__toggle" },
    });
    /** @type {__VLS_StyleScopedClasses['hint__toggle']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "hint__icon" },
    });
    /** @type {__VLS_StyleScopedClasses['hint__icon']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "hint__label" },
    });
    /** @type {__VLS_StyleScopedClasses['hint__label']} */ ;
    (__VLS_ctx.title);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "hint__chevron" },
        ...{ class: ({ 'hint__chevron--open': __VLS_ctx.expanded }) },
    });
    /** @type {__VLS_StyleScopedClasses['hint__chevron']} */ ;
    /** @type {__VLS_StyleScopedClasses['hint__chevron--open']} */ ;
    if (__VLS_ctx.expanded) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "hint__body" },
        });
        /** @type {__VLS_StyleScopedClasses['hint__body']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "hint__example" },
        });
        /** @type {__VLS_StyleScopedClasses['hint__example']} */ ;
        (__VLS_ctx.example);
        __VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({
            ...{ class: "hint__list" },
        });
        /** @type {__VLS_StyleScopedClasses['hint__list']} */ ;
        for (const [item] of __VLS_vFor((__VLS_ctx.checklist))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
                key: (item),
            });
            (item);
            // @ts-ignore
            [expanded, expanded, title, example, checklist,];
        }
    }
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    __typeProps: {},
});
export default {};
