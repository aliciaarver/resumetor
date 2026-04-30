/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { useId } from 'vue';
defineOptions({ inheritAttrs: false });
const inputId = useId();
const __VLS_props = withDefaults(defineProps(), { type: 'text' });
const __VLS_emit = defineEmits();
const __VLS_defaults = { type: 'text' };
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
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "field" },
    ...{ class: ({ 'field--error': __VLS_ctx.error }) },
});
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field--error']} */ ;
if (__VLS_ctx.label) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "field__label" },
        for: (__VLS_ctx.inputId),
    });
    /** @type {__VLS_StyleScopedClasses['field__label']} */ ;
    (__VLS_ctx.label);
}
__VLS_asFunctionalElement1(__VLS_intrinsics.input)({
    ...{ onInput: (...[$event]) => {
            __VLS_ctx.$emit('update:modelValue', $event.target.value);
            // @ts-ignore
            [error, label, label, inputId, $emit,];
        } },
    id: (__VLS_ctx.inputId),
    ...{ class: "field__input" },
    value: (__VLS_ctx.modelValue),
    placeholder: (__VLS_ctx.placeholder),
    type: (__VLS_ctx.type),
    'aria-invalid': (__VLS_ctx.error ? 'true' : undefined),
});
(__VLS_ctx.$attrs);
/** @type {__VLS_StyleScopedClasses['field__input']} */ ;
if (__VLS_ctx.error) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "field__error" },
    });
    /** @type {__VLS_StyleScopedClasses['field__error']} */ ;
    (__VLS_ctx.error);
}
// @ts-ignore
[error, error, error, inputId, modelValue, placeholder, type, $attrs,];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
    __defaults: __VLS_defaults,
    __typeProps: {},
});
export default {};
