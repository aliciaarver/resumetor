/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed } from 'vue';
import { useResumePreviewModel } from '@/composables/useResumePreviewModel';
const { data, fullName, t, proficiencyLabel, el, contactLinks, formatDateRange, buildLinkHref, } = useResumePreviewModel();
const topMeta = computed(() => [
    data.value.personal.gender,
    data.value.personal.age,
    data.value.personal.birthDate,
    data.value.personal.location,
    data.value.personal.citizenship,
    data.value.personal.workPermit ? `${t('form.workPermit')}: ${data.value.personal.workPermit}` : '',
].map((item) => item?.trim() ?? '').filter(Boolean));
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
    ...{ class: "resume" },
    ref: "el",
    role: "document",
    'aria-label': (__VLS_ctx.t('preview.documentLabel')),
});
/** @type {__VLS_StyleScopedClasses['resume']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
    ...{ class: "resume__header" },
    'data-page-block': true,
    'data-page-block-kind': "header",
});
/** @type {__VLS_StyleScopedClasses['resume__header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
    ...{ class: "resume__name" },
});
/** @type {__VLS_StyleScopedClasses['resume__name']} */ ;
(__VLS_ctx.fullName || __VLS_ctx.t('preview.yourName'));
if (__VLS_ctx.data.personal.position) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "resume__role" },
    });
    /** @type {__VLS_StyleScopedClasses['resume__role']} */ ;
    (__VLS_ctx.data.personal.position);
}
if (__VLS_ctx.topMeta.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "resume__personal-meta" },
    });
    /** @type {__VLS_StyleScopedClasses['resume__personal-meta']} */ ;
    for (const [item, index] of __VLS_vFor((__VLS_ctx.topMeta))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            key: (item),
            ...{ class: "resume__personal-item" },
        });
        /** @type {__VLS_StyleScopedClasses['resume__personal-item']} */ ;
        if (index > 0) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "resume__dot" },
            });
            /** @type {__VLS_StyleScopedClasses['resume__dot']} */ ;
        }
        (item);
        // @ts-ignore
        [t, t, fullName, data, data, topMeta, topMeta,];
    }
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "resume__contacts" },
});
/** @type {__VLS_StyleScopedClasses['resume__contacts']} */ ;
if (__VLS_ctx.data.personal.phone) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "resume__contact" },
    });
    /** @type {__VLS_StyleScopedClasses['resume__contact']} */ ;
    (__VLS_ctx.data.personal.phone);
}
for (const [link, index] of __VLS_vFor((__VLS_ctx.contactLinks))) {
    (link.id);
    if (__VLS_ctx.data.personal.phone || index > 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "resume__dot" },
        });
        /** @type {__VLS_StyleScopedClasses['resume__dot']} */ ;
    }
    if (link.href) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
            href: (link.href),
            ...{ class: "resume__contact resume__link" },
            target: "_blank",
            rel: "noreferrer",
        });
        /** @type {__VLS_StyleScopedClasses['resume__contact']} */ ;
        /** @type {__VLS_StyleScopedClasses['resume__link']} */ ;
        (link.text);
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "resume__contact" },
        });
        /** @type {__VLS_StyleScopedClasses['resume__contact']} */ ;
        (link.text);
    }
    // @ts-ignore
    [data, data, data, contactLinks,];
}
if (__VLS_ctx.data.aboutMe) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
        ...{ class: "resume__section" },
    });
    /** @type {__VLS_StyleScopedClasses['resume__section']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "resume__section-header" },
        'data-page-block': true,
        'data-page-block-kind': "heading",
    });
    /** @type {__VLS_StyleScopedClasses['resume__section-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
        ...{ class: "resume__section-title" },
    });
    /** @type {__VLS_StyleScopedClasses['resume__section-title']} */ ;
    (__VLS_ctx.t('preview.aboutMe'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div)({
        ...{ class: "resume__divider" },
    });
    /** @type {__VLS_StyleScopedClasses['resume__divider']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "resume__about" },
        'data-page-block': true,
        'data-page-block-kind': "item",
    });
    /** @type {__VLS_StyleScopedClasses['resume__about']} */ ;
    (__VLS_ctx.data.aboutMe);
}
if (__VLS_ctx.data.workExperience.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
        ...{ class: "resume__section" },
    });
    /** @type {__VLS_StyleScopedClasses['resume__section']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "resume__section-header" },
        'data-page-block': true,
        'data-page-block-kind': "heading",
    });
    /** @type {__VLS_StyleScopedClasses['resume__section-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
        ...{ class: "resume__section-title" },
    });
    /** @type {__VLS_StyleScopedClasses['resume__section-title']} */ ;
    (__VLS_ctx.t('preview.workExperience'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div)({
        ...{ class: "resume__divider" },
    });
    /** @type {__VLS_StyleScopedClasses['resume__divider']} */ ;
    for (const [exp] of __VLS_vFor((__VLS_ctx.data.workExperience))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (exp.id),
            ...{ class: "resume__exp" },
            'data-page-block': true,
            'data-page-block-kind': "item",
        });
        /** @type {__VLS_StyleScopedClasses['resume__exp']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "resume__exp-dates" },
        });
        /** @type {__VLS_StyleScopedClasses['resume__exp-dates']} */ ;
        (__VLS_ctx.formatDateRange(exp.fromMonth, exp.toMonth, exp.isCurrent));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "resume__exp-body" },
        });
        /** @type {__VLS_StyleScopedClasses['resume__exp-body']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "resume__exp-header" },
        });
        /** @type {__VLS_StyleScopedClasses['resume__exp-header']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "resume__exp-left" },
        });
        /** @type {__VLS_StyleScopedClasses['resume__exp-left']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "resume__exp-company" },
        });
        /** @type {__VLS_StyleScopedClasses['resume__exp-company']} */ ;
        if (exp.companyUrl) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
                href: (__VLS_ctx.buildLinkHref({ label: 'Link', url: exp.companyUrl })),
                ...{ class: "resume__exp-company-link" },
                target: "_blank",
                rel: "noreferrer",
            });
            /** @type {__VLS_StyleScopedClasses['resume__exp-company-link']} */ ;
            (exp.company);
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            (exp.company);
        }
        if (exp.position) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "resume__exp-position" },
            });
            /** @type {__VLS_StyleScopedClasses['resume__exp-position']} */ ;
            (exp.position);
        }
        if (exp.location) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "resume__exp-location" },
            });
            /** @type {__VLS_StyleScopedClasses['resume__exp-location']} */ ;
            (exp.location);
        }
        if (exp.skills.length) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "resume__exp-skills" },
            });
            /** @type {__VLS_StyleScopedClasses['resume__exp-skills']} */ ;
            for (const [skill] of __VLS_vFor((exp.skills))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    key: (`${exp.id}-${skill}`),
                    ...{ class: "resume__skill" },
                });
                /** @type {__VLS_StyleScopedClasses['resume__skill']} */ ;
                (skill);
                // @ts-ignore
                [t, t, data, data, data, data, formatDateRange, buildLinkHref,];
            }
        }
        if (exp.description) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "resume__exp-desc" },
            });
            /** @type {__VLS_StyleScopedClasses['resume__exp-desc']} */ ;
            (exp.description);
        }
        // @ts-ignore
        [];
    }
}
if (__VLS_ctx.data.education.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
        ...{ class: "resume__section" },
    });
    /** @type {__VLS_StyleScopedClasses['resume__section']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "resume__section-header" },
        'data-page-block': true,
        'data-page-block-kind': "heading",
    });
    /** @type {__VLS_StyleScopedClasses['resume__section-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
        ...{ class: "resume__section-title" },
    });
    /** @type {__VLS_StyleScopedClasses['resume__section-title']} */ ;
    (__VLS_ctx.t('preview.education'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div)({
        ...{ class: "resume__divider" },
    });
    /** @type {__VLS_StyleScopedClasses['resume__divider']} */ ;
    for (const [edu] of __VLS_vFor((__VLS_ctx.data.education))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (edu.id),
            ...{ class: "resume__edu" },
            'data-page-block': true,
            'data-page-block-kind': "item",
        });
        /** @type {__VLS_StyleScopedClasses['resume__edu']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "resume__edu-dates" },
        });
        /** @type {__VLS_StyleScopedClasses['resume__edu-dates']} */ ;
        (__VLS_ctx.formatDateRange(edu.fromMonth, edu.toMonth, edu.isCurrent));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "resume__edu-body" },
        });
        /** @type {__VLS_StyleScopedClasses['resume__edu-body']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "resume__edu-header" },
        });
        /** @type {__VLS_StyleScopedClasses['resume__edu-header']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "resume__edu-left" },
        });
        /** @type {__VLS_StyleScopedClasses['resume__edu-left']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "resume__edu-institution" },
        });
        /** @type {__VLS_StyleScopedClasses['resume__edu-institution']} */ ;
        (edu.institution);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "resume__edu-degree" },
        });
        /** @type {__VLS_StyleScopedClasses['resume__edu-degree']} */ ;
        ([edu.degree, edu.field].filter(Boolean).join(', '));
        // @ts-ignore
        [t, data, data, formatDateRange,];
    }
}
if (__VLS_ctx.data.skills.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
        ...{ class: "resume__section" },
    });
    /** @type {__VLS_StyleScopedClasses['resume__section']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "resume__section-header" },
        'data-page-block': true,
        'data-page-block-kind': "heading",
    });
    /** @type {__VLS_StyleScopedClasses['resume__section-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
        ...{ class: "resume__section-title" },
    });
    /** @type {__VLS_StyleScopedClasses['resume__section-title']} */ ;
    (__VLS_ctx.t('preview.skills'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div)({
        ...{ class: "resume__divider" },
    });
    /** @type {__VLS_StyleScopedClasses['resume__divider']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "resume__skills" },
        'data-page-block': true,
        'data-page-block-kind': "item",
    });
    /** @type {__VLS_StyleScopedClasses['resume__skills']} */ ;
    for (const [skill] of __VLS_vFor((__VLS_ctx.data.skills))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            key: (skill.id),
            ...{ class: "resume__skill" },
        });
        /** @type {__VLS_StyleScopedClasses['resume__skill']} */ ;
        (skill.name);
        // @ts-ignore
        [t, data, data,];
    }
}
if (__VLS_ctx.data.languages.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
        ...{ class: "resume__section" },
    });
    /** @type {__VLS_StyleScopedClasses['resume__section']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "resume__section-header" },
        'data-page-block': true,
        'data-page-block-kind': "heading",
    });
    /** @type {__VLS_StyleScopedClasses['resume__section-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
        ...{ class: "resume__section-title" },
    });
    /** @type {__VLS_StyleScopedClasses['resume__section-title']} */ ;
    (__VLS_ctx.t('preview.languages'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div)({
        ...{ class: "resume__divider" },
    });
    /** @type {__VLS_StyleScopedClasses['resume__divider']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "resume__langs" },
        'data-page-block': true,
        'data-page-block-kind': "item",
    });
    /** @type {__VLS_StyleScopedClasses['resume__langs']} */ ;
    for (const [lang] of __VLS_vFor((__VLS_ctx.data.languages))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            key: (lang.id),
            ...{ class: "resume__lang" },
        });
        /** @type {__VLS_StyleScopedClasses['resume__lang']} */ ;
        (lang.name);
        if (lang.proficiency) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "resume__lang-level" },
            });
            /** @type {__VLS_StyleScopedClasses['resume__lang-level']} */ ;
            (__VLS_ctx.proficiencyLabel(lang.proficiency));
        }
        // @ts-ignore
        [t, data, data, proficiencyLabel,];
    }
}
if (__VLS_ctx.projectEntries.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
        ...{ class: "resume__section" },
    });
    /** @type {__VLS_StyleScopedClasses['resume__section']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "resume__section-header" },
        'data-page-block': true,
        'data-page-block-kind': "heading",
    });
    /** @type {__VLS_StyleScopedClasses['resume__section-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
        ...{ class: "resume__section-title" },
    });
    /** @type {__VLS_StyleScopedClasses['resume__section-title']} */ ;
    (__VLS_ctx.t('preview.projectsOnly'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div)({
        ...{ class: "resume__divider" },
    });
    /** @type {__VLS_StyleScopedClasses['resume__divider']} */ ;
    for (const [project] of __VLS_vFor((__VLS_ctx.projectEntries))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (project.id),
            ...{ class: "resume__project" },
            'data-page-block': true,
            'data-page-block-kind': "item",
        });
        /** @type {__VLS_StyleScopedClasses['resume__project']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "resume__project-header" },
        });
        /** @type {__VLS_StyleScopedClasses['resume__project-header']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "resume__project-left" },
        });
        /** @type {__VLS_StyleScopedClasses['resume__project-left']} */ ;
        if (project.link) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
                href: (__VLS_ctx.buildLinkHref({ label: 'Link', url: project.link })),
                ...{ class: "resume__project-title resume__project-link" },
                target: "_blank",
                rel: "noreferrer",
            });
            /** @type {__VLS_StyleScopedClasses['resume__project-title']} */ ;
            /** @type {__VLS_StyleScopedClasses['resume__project-link']} */ ;
            (project.title);
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "resume__project-title" },
            });
            /** @type {__VLS_StyleScopedClasses['resume__project-title']} */ ;
            (project.title);
        }
        if (project.subtitle) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "resume__project-subtitle" },
            });
            /** @type {__VLS_StyleScopedClasses['resume__project-subtitle']} */ ;
            (project.subtitle);
        }
        if (project.description) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "resume__project-desc" },
            });
            /** @type {__VLS_StyleScopedClasses['resume__project-desc']} */ ;
            (project.description);
        }
        // @ts-ignore
        [t, buildLinkHref, projectEntries, projectEntries,];
    }
}
if (__VLS_ctx.certificationEntries.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
        ...{ class: "resume__section" },
    });
    /** @type {__VLS_StyleScopedClasses['resume__section']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "resume__section-header" },
        'data-page-block': true,
        'data-page-block-kind': "heading",
    });
    /** @type {__VLS_StyleScopedClasses['resume__section-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
        ...{ class: "resume__section-title" },
    });
    /** @type {__VLS_StyleScopedClasses['resume__section-title']} */ ;
    (__VLS_ctx.t('preview.certifications'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div)({
        ...{ class: "resume__divider" },
    });
    /** @type {__VLS_StyleScopedClasses['resume__divider']} */ ;
    for (const [cert] of __VLS_vFor((__VLS_ctx.certificationEntries))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (cert.id),
            ...{ class: "resume__project" },
            'data-page-block': true,
            'data-page-block-kind': "item",
        });
        /** @type {__VLS_StyleScopedClasses['resume__project']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "resume__project-header" },
        });
        /** @type {__VLS_StyleScopedClasses['resume__project-header']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "resume__project-left" },
        });
        /** @type {__VLS_StyleScopedClasses['resume__project-left']} */ ;
        if (cert.link) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
                href: (__VLS_ctx.buildLinkHref({ label: 'Link', url: cert.link })),
                ...{ class: "resume__project-title resume__project-link" },
                target: "_blank",
                rel: "noreferrer",
            });
            /** @type {__VLS_StyleScopedClasses['resume__project-title']} */ ;
            /** @type {__VLS_StyleScopedClasses['resume__project-link']} */ ;
            (cert.title);
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "resume__project-title" },
            });
            /** @type {__VLS_StyleScopedClasses['resume__project-title']} */ ;
            (cert.title);
        }
        if (cert.subtitle) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "resume__project-subtitle" },
            });
            /** @type {__VLS_StyleScopedClasses['resume__project-subtitle']} */ ;
            (cert.subtitle);
        }
        if (cert.issuedAt) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "resume__edu-dates" },
            });
            /** @type {__VLS_StyleScopedClasses['resume__edu-dates']} */ ;
            (__VLS_ctx.formatDateRange(cert.issuedAt, '', false));
        }
        if (cert.description) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "resume__project-desc" },
            });
            /** @type {__VLS_StyleScopedClasses['resume__project-desc']} */ ;
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
