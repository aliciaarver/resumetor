/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed } from 'vue';
import { useResumePreviewModel } from '@/composables/useResumePreviewModel';
const { data, fullName, t, proficiencyLabel, el, contactLinks, formatDateRange, buildLinkHref, } = useResumePreviewModel();
const URL_RE = /https?:\/\/[^\s<]+/g;
function escapeHtml(value) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
function renderTextWithLinks(value) {
    const escaped = escapeHtml(value);
    return escaped
        .replace(URL_RE, (url) => `<a href="${url}" class="modern-resume__text-link" target="_blank" rel="noreferrer">${url}</a>`)
        .replace(/\n/g, '<br>');
}
const projectEntries = computed(() => data.value.projects.filter((entry) => entry.kind === 'project'));
const certificationEntries = computed(() => data.value.projects.filter((entry) => entry.kind === 'certification'));
const __VLS_exposed = { el };
defineExpose(__VLS_exposed);
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "resume modern-resume" },
    ref: "el",
    role: "document",
    'aria-label': (__VLS_ctx.t('preview.documentLabel')),
});
/** @type {__VLS_StyleScopedClasses['resume']} */ ;
/** @type {__VLS_StyleScopedClasses['modern-resume']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
    ...{ class: "modern-resume__header" },
    'data-page-block': true,
    'data-page-block-kind': "header",
});
/** @type {__VLS_StyleScopedClasses['modern-resume__header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "modern-resume__header-main" },
});
/** @type {__VLS_StyleScopedClasses['modern-resume__header-main']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
    ...{ class: "modern-resume__name" },
});
/** @type {__VLS_StyleScopedClasses['modern-resume__name']} */ ;
(__VLS_ctx.fullName || __VLS_ctx.t('preview.yourName'));
if (__VLS_ctx.data.personal.position) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "modern-resume__role" },
    });
    /** @type {__VLS_StyleScopedClasses['modern-resume__role']} */ ;
    (__VLS_ctx.data.personal.position);
}
if (__VLS_ctx.data.aboutMe) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "modern-resume__summary" },
    });
    __VLS_asFunctionalDirective(__VLS_directives.vHtml, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.renderTextWithLinks(__VLS_ctx.data.aboutMe)) }, null, null);
    /** @type {__VLS_StyleScopedClasses['modern-resume__summary']} */ ;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.aside, __VLS_intrinsics.aside)({
    ...{ class: "modern-resume__sidebar" },
});
/** @type {__VLS_StyleScopedClasses['modern-resume__sidebar']} */ ;
if (__VLS_ctx.data.personal.photo) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "modern-resume__photo-wrap" },
    });
    /** @type {__VLS_StyleScopedClasses['modern-resume__photo-wrap']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
        src: (__VLS_ctx.data.personal.photo),
        alt: "",
        ...{ class: "modern-resume__photo" },
    });
    /** @type {__VLS_StyleScopedClasses['modern-resume__photo']} */ ;
}
if (__VLS_ctx.data.personal.location || __VLS_ctx.data.personal.citizenship || __VLS_ctx.data.personal.birthDate || __VLS_ctx.data.personal.workFormats.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "modern-resume__meta-block" },
    });
    /** @type {__VLS_StyleScopedClasses['modern-resume__meta-block']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
        ...{ class: "modern-resume__meta-title" },
    });
    /** @type {__VLS_StyleScopedClasses['modern-resume__meta-title']} */ ;
    (__VLS_ctx.t('preview.profile'));
    if (__VLS_ctx.data.personal.location) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "modern-resume__meta-line" },
        });
        /** @type {__VLS_StyleScopedClasses['modern-resume__meta-line']} */ ;
        (__VLS_ctx.data.personal.location);
    }
    if (__VLS_ctx.data.personal.citizenship) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "modern-resume__meta-line" },
        });
        /** @type {__VLS_StyleScopedClasses['modern-resume__meta-line']} */ ;
        (__VLS_ctx.data.personal.citizenship);
    }
    if (__VLS_ctx.data.personal.birthDate) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "modern-resume__meta-line" },
        });
        /** @type {__VLS_StyleScopedClasses['modern-resume__meta-line']} */ ;
        (__VLS_ctx.data.personal.birthDate);
    }
    if (__VLS_ctx.data.personal.workFormats.length) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "modern-resume__chips" },
        });
        /** @type {__VLS_StyleScopedClasses['modern-resume__chips']} */ ;
        for (const [format] of __VLS_vFor((__VLS_ctx.data.personal.workFormats))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                key: (format),
                ...{ class: "modern-resume__chip" },
            });
            /** @type {__VLS_StyleScopedClasses['modern-resume__chip']} */ ;
            (format);
            // @ts-ignore
            [t, t, t, fullName, data, data, data, data, data, data, data, data, data, data, data, data, data, data, data, data, data, data, renderTextWithLinks,];
        }
    }
}
if (__VLS_ctx.data.personal.phone || __VLS_ctx.contactLinks.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "modern-resume__meta-block" },
    });
    /** @type {__VLS_StyleScopedClasses['modern-resume__meta-block']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
        ...{ class: "modern-resume__meta-title" },
    });
    /** @type {__VLS_StyleScopedClasses['modern-resume__meta-title']} */ ;
    (__VLS_ctx.t('preview.contacts'));
    if (__VLS_ctx.data.personal.phone) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "modern-resume__meta-line" },
        });
        /** @type {__VLS_StyleScopedClasses['modern-resume__meta-line']} */ ;
        (__VLS_ctx.data.personal.phone);
    }
    for (const [link] of __VLS_vFor((__VLS_ctx.contactLinks))) {
        (link.id);
        if (link.href) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
                href: (link.href),
                ...{ class: "modern-resume__meta-line modern-resume__meta-link" },
                target: "_blank",
                rel: "noreferrer",
            });
            /** @type {__VLS_StyleScopedClasses['modern-resume__meta-line']} */ ;
            /** @type {__VLS_StyleScopedClasses['modern-resume__meta-link']} */ ;
            (link.text);
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "modern-resume__meta-line" },
            });
            /** @type {__VLS_StyleScopedClasses['modern-resume__meta-line']} */ ;
            (link.text);
        }
        // @ts-ignore
        [t, data, data, data, contactLinks, contactLinks,];
    }
}
if (__VLS_ctx.data.skills.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "modern-resume__meta-block" },
        'data-page-block': true,
        'data-page-block-kind': "item",
    });
    /** @type {__VLS_StyleScopedClasses['modern-resume__meta-block']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
        ...{ class: "modern-resume__meta-title" },
    });
    /** @type {__VLS_StyleScopedClasses['modern-resume__meta-title']} */ ;
    (__VLS_ctx.t('preview.skills'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "modern-resume__chips" },
    });
    /** @type {__VLS_StyleScopedClasses['modern-resume__chips']} */ ;
    for (const [skill] of __VLS_vFor((__VLS_ctx.data.skills))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            key: (skill.id),
            ...{ class: "modern-resume__chip" },
        });
        /** @type {__VLS_StyleScopedClasses['modern-resume__chip']} */ ;
        (skill.name);
        // @ts-ignore
        [t, data, data,];
    }
}
if (__VLS_ctx.data.languages.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "modern-resume__meta-block" },
        'data-page-block': true,
        'data-page-block-kind': "item",
    });
    /** @type {__VLS_StyleScopedClasses['modern-resume__meta-block']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
        ...{ class: "modern-resume__meta-title" },
    });
    /** @type {__VLS_StyleScopedClasses['modern-resume__meta-title']} */ ;
    (__VLS_ctx.t('preview.languages'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "modern-resume__meta-stack" },
    });
    /** @type {__VLS_StyleScopedClasses['modern-resume__meta-stack']} */ ;
    for (const [lang] of __VLS_vFor((__VLS_ctx.data.languages))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            key: (lang.id),
            ...{ class: "modern-resume__meta-line" },
        });
        /** @type {__VLS_StyleScopedClasses['modern-resume__meta-line']} */ ;
        (lang.name);
        if (lang.proficiency) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            (__VLS_ctx.proficiencyLabel(lang.proficiency));
        }
        // @ts-ignore
        [t, data, data, proficiencyLabel,];
    }
}
if (__VLS_ctx.data.workExperience.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
        ...{ class: "modern-resume__section" },
    });
    /** @type {__VLS_StyleScopedClasses['modern-resume__section']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "modern-resume__section-header" },
        'data-page-block': true,
        'data-page-block-kind': "heading",
    });
    /** @type {__VLS_StyleScopedClasses['modern-resume__section-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "modern-resume__section-kicker" },
    });
    /** @type {__VLS_StyleScopedClasses['modern-resume__section-kicker']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
        ...{ class: "modern-resume__section-title" },
    });
    /** @type {__VLS_StyleScopedClasses['modern-resume__section-title']} */ ;
    (__VLS_ctx.t('preview.workExperience'));
    for (const [exp] of __VLS_vFor((__VLS_ctx.data.workExperience))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.article, __VLS_intrinsics.article)({
            key: (exp.id),
            ...{ class: "modern-resume__entry" },
            'data-page-block': true,
            'data-page-block-kind': "item",
        });
        /** @type {__VLS_StyleScopedClasses['modern-resume__entry']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "modern-resume__entry-side" },
        });
        /** @type {__VLS_StyleScopedClasses['modern-resume__entry-side']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "modern-resume__dates" },
        });
        /** @type {__VLS_StyleScopedClasses['modern-resume__dates']} */ ;
        (__VLS_ctx.formatDateRange(exp.fromMonth, exp.toMonth, exp.isCurrent));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "modern-resume__entry-main" },
        });
        /** @type {__VLS_StyleScopedClasses['modern-resume__entry-main']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "modern-resume__entry-heading" },
        });
        /** @type {__VLS_StyleScopedClasses['modern-resume__entry-heading']} */ ;
        if (exp.companyUrl) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
                href: (__VLS_ctx.buildLinkHref({ label: 'Link', url: exp.companyUrl })),
                ...{ class: "modern-resume__entry-title modern-resume__entry-link" },
                target: "_blank",
                rel: "noreferrer",
            });
            /** @type {__VLS_StyleScopedClasses['modern-resume__entry-title']} */ ;
            /** @type {__VLS_StyleScopedClasses['modern-resume__entry-link']} */ ;
            (exp.company);
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "modern-resume__entry-title" },
            });
            /** @type {__VLS_StyleScopedClasses['modern-resume__entry-title']} */ ;
            (exp.company);
        }
        if (exp.position) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "modern-resume__entry-subtitle" },
            });
            /** @type {__VLS_StyleScopedClasses['modern-resume__entry-subtitle']} */ ;
            (exp.position);
        }
        if (exp.skills.length) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "modern-resume__chips modern-resume__entry-chips" },
            });
            /** @type {__VLS_StyleScopedClasses['modern-resume__chips']} */ ;
            /** @type {__VLS_StyleScopedClasses['modern-resume__entry-chips']} */ ;
            for (const [skill] of __VLS_vFor((exp.skills))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    key: (`${exp.id}-${skill}`),
                    ...{ class: "modern-resume__chip" },
                });
                /** @type {__VLS_StyleScopedClasses['modern-resume__chip']} */ ;
                (skill);
                // @ts-ignore
                [t, data, data, formatDateRange, buildLinkHref,];
            }
        }
        if (exp.description) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "modern-resume__entry-description" },
            });
            __VLS_asFunctionalDirective(__VLS_directives.vHtml, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.renderTextWithLinks(exp.description)) }, null, null);
            /** @type {__VLS_StyleScopedClasses['modern-resume__entry-description']} */ ;
        }
        // @ts-ignore
        [renderTextWithLinks,];
    }
}
if (__VLS_ctx.data.education.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
        ...{ class: "modern-resume__section" },
    });
    /** @type {__VLS_StyleScopedClasses['modern-resume__section']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "modern-resume__section-header" },
        'data-page-block': true,
        'data-page-block-kind': "heading",
    });
    /** @type {__VLS_StyleScopedClasses['modern-resume__section-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "modern-resume__section-kicker" },
    });
    /** @type {__VLS_StyleScopedClasses['modern-resume__section-kicker']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
        ...{ class: "modern-resume__section-title" },
    });
    /** @type {__VLS_StyleScopedClasses['modern-resume__section-title']} */ ;
    (__VLS_ctx.t('preview.education'));
    for (const [edu] of __VLS_vFor((__VLS_ctx.data.education))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.article, __VLS_intrinsics.article)({
            key: (edu.id),
            ...{ class: "modern-resume__entry" },
            'data-page-block': true,
            'data-page-block-kind': "item",
        });
        /** @type {__VLS_StyleScopedClasses['modern-resume__entry']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "modern-resume__entry-side" },
        });
        /** @type {__VLS_StyleScopedClasses['modern-resume__entry-side']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "modern-resume__dates" },
        });
        /** @type {__VLS_StyleScopedClasses['modern-resume__dates']} */ ;
        (__VLS_ctx.formatDateRange(edu.fromMonth, edu.toMonth, edu.isCurrent));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "modern-resume__entry-main" },
        });
        /** @type {__VLS_StyleScopedClasses['modern-resume__entry-main']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "modern-resume__entry-title" },
        });
        /** @type {__VLS_StyleScopedClasses['modern-resume__entry-title']} */ ;
        (edu.institution);
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "modern-resume__entry-subtitle" },
        });
        /** @type {__VLS_StyleScopedClasses['modern-resume__entry-subtitle']} */ ;
        ([edu.degree, edu.field].filter(Boolean).join(', '));
        // @ts-ignore
        [t, data, data, formatDateRange,];
    }
}
if (__VLS_ctx.projectEntries.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
        ...{ class: "modern-resume__section" },
    });
    /** @type {__VLS_StyleScopedClasses['modern-resume__section']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "modern-resume__section-header" },
        'data-page-block': true,
        'data-page-block-kind': "heading",
    });
    /** @type {__VLS_StyleScopedClasses['modern-resume__section-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "modern-resume__section-kicker" },
    });
    /** @type {__VLS_StyleScopedClasses['modern-resume__section-kicker']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
        ...{ class: "modern-resume__section-title" },
    });
    /** @type {__VLS_StyleScopedClasses['modern-resume__section-title']} */ ;
    (__VLS_ctx.t('preview.projectsOnly'));
    for (const [project] of __VLS_vFor((__VLS_ctx.projectEntries))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.article, __VLS_intrinsics.article)({
            key: (project.id),
            ...{ class: "modern-resume__entry" },
            'data-page-block': true,
            'data-page-block-kind': "item",
        });
        /** @type {__VLS_StyleScopedClasses['modern-resume__entry']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div)({
            ...{ class: "modern-resume__entry-side" },
        });
        /** @type {__VLS_StyleScopedClasses['modern-resume__entry-side']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "modern-resume__entry-main" },
        });
        /** @type {__VLS_StyleScopedClasses['modern-resume__entry-main']} */ ;
        if (project.link) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
                href: (__VLS_ctx.buildLinkHref({ label: 'Link', url: project.link })),
                ...{ class: "modern-resume__entry-title modern-resume__entry-link" },
                target: "_blank",
                rel: "noreferrer",
            });
            /** @type {__VLS_StyleScopedClasses['modern-resume__entry-title']} */ ;
            /** @type {__VLS_StyleScopedClasses['modern-resume__entry-link']} */ ;
            (project.title);
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "modern-resume__entry-title" },
            });
            /** @type {__VLS_StyleScopedClasses['modern-resume__entry-title']} */ ;
            (project.title);
        }
        if (project.subtitle) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "modern-resume__entry-subtitle" },
            });
            /** @type {__VLS_StyleScopedClasses['modern-resume__entry-subtitle']} */ ;
            (project.subtitle);
        }
        if (project.description) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "modern-resume__entry-description" },
            });
            /** @type {__VLS_StyleScopedClasses['modern-resume__entry-description']} */ ;
            (project.description);
        }
        // @ts-ignore
        [t, buildLinkHref, projectEntries, projectEntries,];
    }
}
if (__VLS_ctx.certificationEntries.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
        ...{ class: "modern-resume__section" },
    });
    /** @type {__VLS_StyleScopedClasses['modern-resume__section']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "modern-resume__section-header" },
        'data-page-block': true,
        'data-page-block-kind': "heading",
    });
    /** @type {__VLS_StyleScopedClasses['modern-resume__section-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "modern-resume__section-kicker" },
    });
    /** @type {__VLS_StyleScopedClasses['modern-resume__section-kicker']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
        ...{ class: "modern-resume__section-title" },
    });
    /** @type {__VLS_StyleScopedClasses['modern-resume__section-title']} */ ;
    (__VLS_ctx.t('preview.certifications'));
    for (const [cert] of __VLS_vFor((__VLS_ctx.certificationEntries))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.article, __VLS_intrinsics.article)({
            key: (cert.id),
            ...{ class: "modern-resume__entry" },
            'data-page-block': true,
            'data-page-block-kind': "item",
        });
        /** @type {__VLS_StyleScopedClasses['modern-resume__entry']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "modern-resume__entry-side" },
        });
        /** @type {__VLS_StyleScopedClasses['modern-resume__entry-side']} */ ;
        if (cert.issuedAt) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "modern-resume__dates" },
            });
            /** @type {__VLS_StyleScopedClasses['modern-resume__dates']} */ ;
            (__VLS_ctx.formatDateRange(cert.issuedAt, '', false));
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "modern-resume__entry-main" },
        });
        /** @type {__VLS_StyleScopedClasses['modern-resume__entry-main']} */ ;
        if (cert.link) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
                href: (__VLS_ctx.buildLinkHref({ label: 'Link', url: cert.link })),
                ...{ class: "modern-resume__entry-title modern-resume__entry-link" },
                target: "_blank",
                rel: "noreferrer",
            });
            /** @type {__VLS_StyleScopedClasses['modern-resume__entry-title']} */ ;
            /** @type {__VLS_StyleScopedClasses['modern-resume__entry-link']} */ ;
            (cert.title);
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "modern-resume__entry-title" },
            });
            /** @type {__VLS_StyleScopedClasses['modern-resume__entry-title']} */ ;
            (cert.title);
        }
        if (cert.subtitle) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "modern-resume__entry-subtitle" },
            });
            /** @type {__VLS_StyleScopedClasses['modern-resume__entry-subtitle']} */ ;
            (cert.subtitle);
        }
        if (cert.description) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "modern-resume__entry-description" },
            });
            /** @type {__VLS_StyleScopedClasses['modern-resume__entry-description']} */ ;
            (cert.description);
        }
        // @ts-ignore
        [t, formatDateRange, buildLinkHref, certificationEntries, certificationEntries,];
    }
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    setup: () => (__VLS_exposed),
});
export default {};
