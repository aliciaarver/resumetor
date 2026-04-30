/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { useId } from 'vue';
const inputId = useId();
const __VLS_props = withDefaults(defineProps(), {
    label: '',
    disabled: false,
});
const __VLS_emit = defineEmits();
const __VLS_defaults = {
    label: '',
    disabled: false,
};
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
    ...{ class: "month-field" },
});
/** @type {__VLS_StyleScopedClasses['month-field']} */ ;
if (__VLS_ctx.label) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "month-field__label" },
        for: (__VLS_ctx.inputId),
    });
    /** @type {__VLS_StyleScopedClasses['month-field__label']} */ ;
    (__VLS_ctx.label);
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "month-field__control" },
});
/** @type {__VLS_StyleScopedClasses['month-field__control']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.input)({
    ...{ onInput: (...[$event]) => {
            __VLS_ctx.$emit('update:modelValue', $event.target.value);
            // @ts-ignore
            [label, label, inputId, $emit,];
        } },
    id: (__VLS_ctx.inputId),
    ...{ class: (['month-field__input', { 'month-field__input--empty': !__VLS_ctx.modelValue }]) },
    type: "month",
    value: (__VLS_ctx.modelValue),
    disabled: (__VLS_ctx.disabled),
});
/** @type {__VLS_StyleScopedClasses['month-field__input']} */ ;
/** @type {__VLS_StyleScopedClasses['month-field__input--empty']} */ ;
if (!__VLS_ctx.modelValue && !__VLS_ctx.disabled) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "month-field__placeholder" },
    });
    /** @type {__VLS_StyleScopedClasses['month-field__placeholder']} */ ;
    (__VLS_ctx.placeholder);
}
// @ts-ignore
[inputId, modelValue, modelValue, modelValue, disabled, disabled, placeholder,];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
    __defaults: __VLS_defaults,
    __typeProps: {},
});
export default {};
