/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useLocaleStore } from '@/stores/locale';
import { useResumeStore } from '@/stores/resume';
import { normalizeSocialLinkLabel } from '@/utils/socialLinks';
import AppInput from '@/components/ui/AppInput.vue';
import AppButton from '@/components/ui/AppButton.vue';
const store = useResumeStore();
const localeStore = useLocaleStore();
const { t } = localeStore;
const { data } = storeToRefs(store);
const { socialLinkOptions, locale } = storeToRefs(localeStore);
const { addSocialLink, removeSocialLink } = store;
const photoInputEl = ref(null);
const selectedWorkFormat = ref('');
const RU_WORK_FORMATS = ['Удалённо', 'Гибрид', 'Офис', 'Проектная работа', 'Частичная занятость', 'Полная занятость'];
const EN_WORK_FORMATS = ['Remote', 'Hybrid', 'On-site', 'Contract', 'Part-time', 'Full-time'];
const workFormatOptions = ref([]);
watch(() => locale.value, (nextLocale) => {
    workFormatOptions.value = nextLocale === 'ru' ? RU_WORK_FORMATS : EN_WORK_FORMATS;
}, { immediate: true });
watch(() => [data.value.personal.lastName, data.value.personal.firstName, data.value.personal.middleName], () => {
    data.value.personal.fullName = [
        data.value.personal.lastName,
        data.value.personal.firstName,
        data.value.personal.middleName,
    ].map((value) => value.trim()).filter(Boolean).join(' ');
}, { immediate: true });
function linkUrlPlaceholder(label) {
    switch (normalizeSocialLinkLabel(label)) {
        case 'Email':
            return 'name@example.com';
        case 'LinkedIn':
            return 'https://linkedin.com/in/...';
        case 'Telegram':
            return 'https://t.me/...';
        case 'GitHub':
            return 'https://github.com/...';
        default:
            return 'https://...';
    }
}
function addWorkFormat() {
    const value = selectedWorkFormat.value.trim();
    if (!value)
        return;
    if (!data.value.personal.workFormats.includes(value)) {
        data.value.personal.workFormats.push(value);
    }
    selectedWorkFormat.value = '';
}
function removeWorkFormat(index) {
    data.value.personal.workFormats.splice(index, 1);
}
function openPhotoPicker() {
    photoInputEl.value?.click();
}
function removePhoto() {
    data.value.personal.photo = '';
    if (photoInputEl.value) {
        photoInputEl.value.value = '';
    }
}
function onPhotoChange(event) {
    const file = event.target.files?.[0];
    if (!file)
        return;
    const reader = new FileReader();
    reader.onload = () => {
        data.value.personal.photo = typeof reader.result === 'string' ? reader.result : '';
    };
    reader.readAsDataURL(file);
}
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['grid-2']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-3']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-2']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-3']} */ ;
/** @type {__VLS_StyleScopedClasses['link-row']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
    ...{ class: "section" },
});
/** @type {__VLS_StyleScopedClasses['section']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
    ...{ class: "section__title" },
});
/** @type {__VLS_StyleScopedClasses['section__title']} */ ;
(__VLS_ctx.t('form.personalInfo'));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "grid-3" },
});
/** @type {__VLS_StyleScopedClasses['grid-3']} */ ;
const __VLS_0 = AppInput;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.data.personal.lastName),
    label: (__VLS_ctx.t('form.lastName')),
    placeholder: (__VLS_ctx.t('form.lastNamePlaceholder')),
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.data.personal.lastName),
    label: (__VLS_ctx.t('form.lastName')),
    placeholder: (__VLS_ctx.t('form.lastNamePlaceholder')),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const __VLS_5 = AppInput;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
    modelValue: (__VLS_ctx.data.personal.firstName),
    label: (__VLS_ctx.t('form.firstName')),
    placeholder: (__VLS_ctx.t('form.firstNamePlaceholder')),
}));
const __VLS_7 = __VLS_6({
    modelValue: (__VLS_ctx.data.personal.firstName),
    label: (__VLS_ctx.t('form.firstName')),
    placeholder: (__VLS_ctx.t('form.firstNamePlaceholder')),
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
const __VLS_10 = AppInput;
// @ts-ignore
const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({
    modelValue: (__VLS_ctx.data.personal.middleName),
    label: (__VLS_ctx.t('form.middleName')),
    placeholder: (__VLS_ctx.t('form.middleNamePlaceholder')),
}));
const __VLS_12 = __VLS_11({
    modelValue: (__VLS_ctx.data.personal.middleName),
    label: (__VLS_ctx.t('form.middleName')),
    placeholder: (__VLS_ctx.t('form.middleNamePlaceholder')),
}, ...__VLS_functionalComponentArgsRest(__VLS_11));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "grid-2" },
});
/** @type {__VLS_StyleScopedClasses['grid-2']} */ ;
const __VLS_15 = AppInput;
// @ts-ignore
const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
    modelValue: (__VLS_ctx.data.personal.phone),
    label: (__VLS_ctx.t('form.phone')),
    placeholder: "+7 999 123-45-67",
    type: "tel",
}));
const __VLS_17 = __VLS_16({
    modelValue: (__VLS_ctx.data.personal.phone),
    label: (__VLS_ctx.t('form.phone')),
    placeholder: "+7 999 123-45-67",
    type: "tel",
}, ...__VLS_functionalComponentArgsRest(__VLS_16));
const __VLS_20 = AppInput;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
    modelValue: (__VLS_ctx.data.personal.position),
    label: (__VLS_ctx.t('form.desiredPosition')),
    placeholder: (__VLS_ctx.t('form.desiredPositionPlaceholder')),
}));
const __VLS_22 = __VLS_21({
    modelValue: (__VLS_ctx.data.personal.position),
    label: (__VLS_ctx.t('form.desiredPosition')),
    placeholder: (__VLS_ctx.t('form.desiredPositionPlaceholder')),
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "grid-2" },
});
/** @type {__VLS_StyleScopedClasses['grid-2']} */ ;
const __VLS_25 = AppInput;
// @ts-ignore
const __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({
    modelValue: (__VLS_ctx.data.personal.location),
    label: (__VLS_ctx.t('form.location')),
    placeholder: (__VLS_ctx.t('form.locationPlaceholder')),
}));
const __VLS_27 = __VLS_26({
    modelValue: (__VLS_ctx.data.personal.location),
    label: (__VLS_ctx.t('form.location')),
    placeholder: (__VLS_ctx.t('form.locationPlaceholder')),
}, ...__VLS_functionalComponentArgsRest(__VLS_26));
const __VLS_30 = AppInput;
// @ts-ignore
const __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
    modelValue: (__VLS_ctx.data.personal.citizenship),
    label: (__VLS_ctx.t('form.citizenship')),
    placeholder: (__VLS_ctx.t('form.citizenshipPlaceholder')),
}));
const __VLS_32 = __VLS_31({
    modelValue: (__VLS_ctx.data.personal.citizenship),
    label: (__VLS_ctx.t('form.citizenship')),
    placeholder: (__VLS_ctx.t('form.citizenshipPlaceholder')),
}, ...__VLS_functionalComponentArgsRest(__VLS_31));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "grid-3" },
});
/** @type {__VLS_StyleScopedClasses['grid-3']} */ ;
const __VLS_35 = AppInput;
// @ts-ignore
const __VLS_36 = __VLS_asFunctionalComponent1(__VLS_35, new __VLS_35({
    modelValue: (__VLS_ctx.data.personal.workPermit),
    label: (__VLS_ctx.t('form.workPermit')),
    placeholder: (__VLS_ctx.t('form.workPermitPlaceholder')),
}));
const __VLS_37 = __VLS_36({
    modelValue: (__VLS_ctx.data.personal.workPermit),
    label: (__VLS_ctx.t('form.workPermit')),
    placeholder: (__VLS_ctx.t('form.workPermitPlaceholder')),
}, ...__VLS_functionalComponentArgsRest(__VLS_36));
const __VLS_40 = AppInput;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent1(__VLS_40, new __VLS_40({
    modelValue: (__VLS_ctx.data.personal.gender),
    label: (__VLS_ctx.t('form.gender')),
    placeholder: (__VLS_ctx.t('form.genderPlaceholder')),
}));
const __VLS_42 = __VLS_41({
    modelValue: (__VLS_ctx.data.personal.gender),
    label: (__VLS_ctx.t('form.gender')),
    placeholder: (__VLS_ctx.t('form.genderPlaceholder')),
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
const __VLS_45 = AppInput;
// @ts-ignore
const __VLS_46 = __VLS_asFunctionalComponent1(__VLS_45, new __VLS_45({
    modelValue: (__VLS_ctx.data.personal.age),
    label: (__VLS_ctx.t('form.age')),
    placeholder: (__VLS_ctx.t('form.agePlaceholder')),
}));
const __VLS_47 = __VLS_46({
    modelValue: (__VLS_ctx.data.personal.age),
    label: (__VLS_ctx.t('form.age')),
    placeholder: (__VLS_ctx.t('form.agePlaceholder')),
}, ...__VLS_functionalComponentArgsRest(__VLS_46));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "grid-2" },
});
/** @type {__VLS_StyleScopedClasses['grid-2']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "field" },
});
/** @type {__VLS_StyleScopedClasses['field']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
    ...{ class: "field__label" },
    for: "birth-date",
});
/** @type {__VLS_StyleScopedClasses['field__label']} */ ;
(__VLS_ctx.t('form.birthDate'));
__VLS_asFunctionalElement1(__VLS_intrinsics.input)({
    id: "birth-date",
    ...{ class: "field__input" },
    type: "date",
});
(__VLS_ctx.data.personal.birthDate);
/** @type {__VLS_StyleScopedClasses['field__input']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "photo-field" },
});
/** @type {__VLS_StyleScopedClasses['photo-field']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
    ...{ class: "field__label" },
});
/** @type {__VLS_StyleScopedClasses['field__label']} */ ;
(__VLS_ctx.t('form.photo'));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "photo-field__controls" },
});
/** @type {__VLS_StyleScopedClasses['photo-field__controls']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.input)({
    ...{ onChange: (__VLS_ctx.onPhotoChange) },
    ref: "photoInputEl",
    ...{ class: "photo-field__input" },
    type: "file",
    accept: "image/*",
});
/** @type {__VLS_StyleScopedClasses['photo-field__input']} */ ;
const __VLS_50 = AppButton || AppButton;
// @ts-ignore
const __VLS_51 = __VLS_asFunctionalComponent1(__VLS_50, new __VLS_50({
    ...{ 'onClick': {} },
    variant: "secondary",
    size: "sm",
}));
const __VLS_52 = __VLS_51({
    ...{ 'onClick': {} },
    variant: "secondary",
    size: "sm",
}, ...__VLS_functionalComponentArgsRest(__VLS_51));
let __VLS_55;
const __VLS_56 = ({ click: {} },
    { onClick: (__VLS_ctx.openPhotoPicker) });
const { default: __VLS_57 } = __VLS_53.slots;
(__VLS_ctx.t('form.photoUpload'));
// @ts-ignore
[t, t, t, t, t, t, t, t, t, t, t, t, t, t, t, t, t, t, t, t, t, t, t, data, data, data, data, data, data, data, data, data, data, data, onPhotoChange, openPhotoPicker,];
var __VLS_53;
var __VLS_54;
if (__VLS_ctx.data.personal.photo) {
    const __VLS_58 = AppButton || AppButton;
    // @ts-ignore
    const __VLS_59 = __VLS_asFunctionalComponent1(__VLS_58, new __VLS_58({
        ...{ 'onClick': {} },
        variant: "ghost",
        size: "sm",
    }));
    const __VLS_60 = __VLS_59({
        ...{ 'onClick': {} },
        variant: "ghost",
        size: "sm",
    }, ...__VLS_functionalComponentArgsRest(__VLS_59));
    let __VLS_63;
    const __VLS_64 = ({ click: {} },
        { onClick: (__VLS_ctx.removePhoto) });
    const { default: __VLS_65 } = __VLS_61.slots;
    (__VLS_ctx.t('form.photoRemove'));
    // @ts-ignore
    [t, data, removePhoto,];
    var __VLS_61;
    var __VLS_62;
}
if (__VLS_ctx.data.personal.photo) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
        src: (__VLS_ctx.data.personal.photo),
        alt: "",
        ...{ class: "photo-field__preview" },
    });
    /** @type {__VLS_StyleScopedClasses['photo-field__preview']} */ ;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "field" },
});
/** @type {__VLS_StyleScopedClasses['field']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
    ...{ class: "field__label" },
});
/** @type {__VLS_StyleScopedClasses['field__label']} */ ;
(__VLS_ctx.t('form.workFormats'));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "format-picker" },
});
/** @type {__VLS_StyleScopedClasses['format-picker']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
    ...{ onChange: (__VLS_ctx.addWorkFormat) },
    value: (__VLS_ctx.selectedWorkFormat),
    ...{ class: "format-picker__select" },
});
/** @type {__VLS_StyleScopedClasses['format-picker__select']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
    value: "",
});
(__VLS_ctx.t('form.workFormatPlaceholder'));
for (const [option] of __VLS_vFor((__VLS_ctx.workFormatOptions))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        key: (option),
        value: (option),
    });
    (option);
    // @ts-ignore
    [t, t, data, data, addWorkFormat, selectedWorkFormat, workFormatOptions,];
}
if (__VLS_ctx.data.personal.workFormats.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "tags" },
    });
    /** @type {__VLS_StyleScopedClasses['tags']} */ ;
    for (const [format, index] of __VLS_vFor((__VLS_ctx.data.personal.workFormats))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.data.personal.workFormats.length))
                        return;
                    __VLS_ctx.removeWorkFormat(index);
                    // @ts-ignore
                    [data, data, removeWorkFormat,];
                } },
            key: (`${format}-${index}`),
            type: "button",
            ...{ class: "tags__item" },
        });
        /** @type {__VLS_StyleScopedClasses['tags__item']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (format);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            'aria-hidden': "true",
        });
        // @ts-ignore
        [];
    }
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "links" },
});
/** @type {__VLS_StyleScopedClasses['links']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "links__header" },
});
/** @type {__VLS_StyleScopedClasses['links__header']} */ ;
const __VLS_66 = AppButton || AppButton;
// @ts-ignore
const __VLS_67 = __VLS_asFunctionalComponent1(__VLS_66, new __VLS_66({
    ...{ 'onClick': {} },
    variant: "ghost",
    size: "sm",
}));
const __VLS_68 = __VLS_67({
    ...{ 'onClick': {} },
    variant: "ghost",
    size: "sm",
}, ...__VLS_functionalComponentArgsRest(__VLS_67));
let __VLS_71;
const __VLS_72 = ({ click: {} },
    { onClick: (__VLS_ctx.addSocialLink) });
const { default: __VLS_73 } = __VLS_69.slots;
(__VLS_ctx.t('form.addLink'));
// @ts-ignore
[t, addSocialLink,];
var __VLS_69;
var __VLS_70;
let __VLS_74;
/** @ts-ignore @type {typeof __VLS_components.TransitionGroup | typeof __VLS_components.TransitionGroup} */
TransitionGroup;
// @ts-ignore
const __VLS_75 = __VLS_asFunctionalComponent1(__VLS_74, new __VLS_74({
    name: "list",
    tag: "div",
    ...{ class: "links__list" },
}));
const __VLS_76 = __VLS_75({
    name: "list",
    tag: "div",
    ...{ class: "links__list" },
}, ...__VLS_functionalComponentArgsRest(__VLS_75));
/** @type {__VLS_StyleScopedClasses['links__list']} */ ;
const { default: __VLS_79 } = __VLS_77.slots;
for (const [link] of __VLS_vFor((__VLS_ctx.data.personal.links))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        key: (link.id),
        ...{ class: "link-row" },
    });
    /** @type {__VLS_StyleScopedClasses['link-row']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
        ...{ onChange: (...[$event]) => {
                link.label = $event.target.value;
                // @ts-ignore
                [data,];
            } },
        ...{ class: "link-row__type" },
        value: (__VLS_ctx.normalizeSocialLinkLabel(link.label)),
    });
    /** @type {__VLS_StyleScopedClasses['link-row__type']} */ ;
    for (const [option] of __VLS_vFor((__VLS_ctx.socialLinkOptions))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
            key: (option.value),
            value: (option.value),
        });
        (option.label);
        // @ts-ignore
        [normalizeSocialLinkLabel, socialLinkOptions,];
    }
    const __VLS_80 = AppInput;
    // @ts-ignore
    const __VLS_81 = __VLS_asFunctionalComponent1(__VLS_80, new __VLS_80({
        modelValue: (link.url),
        placeholder: (__VLS_ctx.linkUrlPlaceholder(link.label)),
        type: (__VLS_ctx.normalizeSocialLinkLabel(link.label) === 'Email' ? 'email' : 'url'),
    }));
    const __VLS_82 = __VLS_81({
        modelValue: (link.url),
        placeholder: (__VLS_ctx.linkUrlPlaceholder(link.label)),
        type: (__VLS_ctx.normalizeSocialLinkLabel(link.label) === 'Email' ? 'email' : 'url'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_81));
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.removeSocialLink(link.id);
                // @ts-ignore
                [normalizeSocialLinkLabel, linkUrlPlaceholder, removeSocialLink,];
            } },
        ...{ class: "link-row__remove" },
        title: (__VLS_ctx.t('common.remove')),
    });
    /** @type {__VLS_StyleScopedClasses['link-row__remove']} */ ;
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
var __VLS_77;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
