/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { useId } from 'vue';
defineOptions({ inheritAttrs: false });
const textareaId = useId();
const __VLS_props = withDefaults(defineProps(), { rows: 4 });
const __VLS_emit = defineEmits();
const __VLS_defaults = { rows: 4 };
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
});
/** @type {__VLS_StyleScopedClasses['field']} */ ;
if (__VLS_ctx.label) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "field__label" },
        for: (__VLS_ctx.textareaId),
    });
    /** @type {__VLS_StyleScopedClasses['field__label']} */ ;
    (__VLS_ctx.label);
}
__VLS_asFunctionalElement1(__VLS_intrinsics.textarea)({
    ...{ onInput: (...[$event]) => {
            __VLS_ctx.$emit('update:modelValue', $event.target.value);
            // @ts-ignore
            [label, label, textareaId, $emit,];
        } },
    id: (__VLS_ctx.textareaId),
    ...{ class: "field__textarea" },
    value: (__VLS_ctx.modelValue),
    placeholder: (__VLS_ctx.placeholder),
    rows: (__VLS_ctx.rows),
});
(__VLS_ctx.$attrs);
/** @type {__VLS_StyleScopedClasses['field__textarea']} */ ;
// @ts-ignore
[textareaId, modelValue, placeholder, rows, $attrs,];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
    __defaults: __VLS_defaults,
    __typeProps: {},
});
export default {};
