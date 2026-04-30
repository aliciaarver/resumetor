/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref } from 'vue';
import { useResumeParser } from '@/composables/useResumeParser';
import { useLocaleStore } from '@/stores/locale';
import { usePdfMetaStore } from '@/stores/pdfMeta';
import { useResumeStore } from '@/stores/resume';
defineOptions({ inheritAttrs: false });
const { parseFile, parsing, error: parseError } = useResumeParser();
const localeStore = useLocaleStore();
const { t } = localeStore;
const pdfMetaStore = usePdfMetaStore();
const store = useResumeStore();
const isOver = ref(false);
const success = ref(false);
const inputEl = ref(null);
const uploadError = ref(null);
function open() {
    inputEl.value?.click();
}
async function handleFile(file) {
    success.value = false;
    uploadError.value = null;
    try {
        const result = await parseFile(file);
        if (result) {
            store.hydrateFromParsed(result.resume);
            pdfMetaStore.hydrateFromParsed(result.pdfMeta);
            success.value = true;
            setTimeout(() => (success.value = false), 5000);
        }
    }
    catch (error) {
        uploadError.value = error instanceof Error ? error.message : t('parser.failedToParse');
    }
    finally {
        if (inputEl.value) {
            inputEl.value.value = '';
        }
    }
}
function onDrop(e) {
    isOver.value = false;
    const file = e.dataTransfer?.files[0];
    if (file)
        handleFile(file);
}
function onFileChange(e) {
    const file = e.target.files?.[0];
    if (file)
        handleFile(file);
}
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "uploader-stack" },
});
(__VLS_ctx.$attrs);
/** @type {__VLS_StyleScopedClasses['uploader-stack']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ onDragover: (...[$event]) => {
            __VLS_ctx.isOver = true;
            // @ts-ignore
            [$attrs, isOver,];
        } },
    ...{ onDragleave: (...[$event]) => {
            __VLS_ctx.isOver = false;
            // @ts-ignore
            [isOver,];
        } },
    ...{ onDrop: (__VLS_ctx.onDrop) },
    ...{ onClick: (__VLS_ctx.open) },
    ...{ onKeydown: (__VLS_ctx.open) },
    ...{ onKeydown: (__VLS_ctx.open) },
    ...{ class: "uploader" },
    ...{ class: ({ 'uploader--over': __VLS_ctx.isOver, 'uploader--parsing': __VLS_ctx.parsing }) },
    role: "button",
    tabindex: (__VLS_ctx.parsing ? -1 : 0),
    'aria-busy': (__VLS_ctx.parsing ? 'true' : 'false'),
});
/** @type {__VLS_StyleScopedClasses['uploader']} */ ;
/** @type {__VLS_StyleScopedClasses['uploader--over']} */ ;
/** @type {__VLS_StyleScopedClasses['uploader--parsing']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.input)({
    ...{ onChange: (__VLS_ctx.onFileChange) },
    ref: "inputEl",
    type: "file",
    accept: ".pdf,application/pdf",
    ...{ class: "uploader__input" },
});
/** @type {__VLS_StyleScopedClasses['uploader__input']} */ ;
if (!__VLS_ctx.parsing) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
        ...{ class: "uploader__icon" },
        width: "28",
        height: "28",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        'stroke-width': "1.5",
    });
    /** @type {__VLS_StyleScopedClasses['uploader__icon']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.path)({
        d: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 12V4M8 8l4-4 4 4",
        'stroke-linecap': "round",
        'stroke-linejoin': "round",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "uploader__text" },
    });
    /** @type {__VLS_StyleScopedClasses['uploader__text']} */ ;
    (__VLS_ctx.t('upload.dropPrefix'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "uploader__link" },
    });
    /** @type {__VLS_StyleScopedClasses['uploader__link']} */ ;
    (__VLS_ctx.t('upload.browse'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "uploader__hint" },
    });
    /** @type {__VLS_StyleScopedClasses['uploader__hint']} */ ;
    (__VLS_ctx.t('upload.hint'));
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div)({
        ...{ class: "uploader__spinner" },
    });
    /** @type {__VLS_StyleScopedClasses['uploader__spinner']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "uploader__text" },
    });
    /** @type {__VLS_StyleScopedClasses['uploader__text']} */ ;
    (__VLS_ctx.t('upload.parsing'));
}
if (__VLS_ctx.uploadError || __VLS_ctx.parseError) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ onClick: () => { } },
        ...{ class: "uploader__error" },
    });
    /** @type {__VLS_StyleScopedClasses['uploader__error']} */ ;
    (__VLS_ctx.uploadError || __VLS_ctx.parseError);
}
if (__VLS_ctx.success) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ onClick: () => { } },
        ...{ class: "uploader__success" },
    });
    /** @type {__VLS_StyleScopedClasses['uploader__success']} */ ;
    (__VLS_ctx.t('upload.success'));
}
// @ts-ignore
[isOver, onDrop, open, open, open, parsing, parsing, parsing, parsing, onFileChange, t, t, t, t, t, uploadError, uploadError, parseError, parseError, success,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
