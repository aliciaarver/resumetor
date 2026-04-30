/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed } from 'vue';
import { useLocaleStore } from '@/stores/locale';
const props = defineProps();
const localeStore = useLocaleStore();
const { t } = localeStore;
const changedDiffBlocks = computed(() => props.review?.diff?.blocks.filter((block) => block.changed) ?? []);
function confidenceLabel(value) {
    return t(`review.confidence${value.charAt(0).toUpperCase()}${value.slice(1)}`);
}
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
if (__VLS_ctx.review) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
        ...{ class: "review" },
    });
    /** @type {__VLS_StyleScopedClasses['review']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "review__header" },
    });
    /** @type {__VLS_StyleScopedClasses['review__header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
        ...{ class: "review__title" },
    });
    /** @type {__VLS_StyleScopedClasses['review__title']} */ ;
    (__VLS_ctx.t('review.title'));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "review__list" },
    });
    /** @type {__VLS_StyleScopedClasses['review__list']} */ ;
    for (const [block] of __VLS_vFor((__VLS_ctx.review.blocks))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.article, __VLS_intrinsics.article)({
            key: (block.key),
            ...{ class: "review__item" },
            ...{ class: (`review__item--${block.confidence}`) },
        });
        /** @type {__VLS_StyleScopedClasses['review__item']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "review__row" },
        });
        /** @type {__VLS_StyleScopedClasses['review__row']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "review__meta" },
        });
        /** @type {__VLS_StyleScopedClasses['review__meta']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({
            ...{ class: "review__label" },
        });
        /** @type {__VLS_StyleScopedClasses['review__label']} */ ;
        (block.label);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "review__status" },
            ...{ class: (block.imported ? 'review__status--ok' : 'review__status--hold') },
        });
        /** @type {__VLS_StyleScopedClasses['review__status']} */ ;
        (block.imported ? __VLS_ctx.t('review.imported') : __VLS_ctx.t('review.heldBack'));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "review__badges" },
        });
        /** @type {__VLS_StyleScopedClasses['review__badges']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "review__badge" },
        });
        /** @type {__VLS_StyleScopedClasses['review__badge']} */ ;
        (__VLS_ctx.t('review.confidence'));
        (__VLS_ctx.confidenceLabel(block.confidence));
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "review__badge" },
        });
        /** @type {__VLS_StyleScopedClasses['review__badge']} */ ;
        (Math.round(block.score * 100));
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "review__note" },
        });
        /** @type {__VLS_StyleScopedClasses['review__note']} */ ;
        (block.note);
        if (block.rawText && !block.imported) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.details, __VLS_intrinsics.details)({
                ...{ class: "review__details" },
            });
            /** @type {__VLS_StyleScopedClasses['review__details']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.summary, __VLS_intrinsics.summary)({});
            (__VLS_ctx.t('review.rawText'));
            __VLS_asFunctionalElement1(__VLS_intrinsics.pre, __VLS_intrinsics.pre)({
                ...{ class: "review__raw" },
            });
            /** @type {__VLS_StyleScopedClasses['review__raw']} */ ;
            (block.rawText);
        }
        // @ts-ignore
        [review, review, t, t, t, t, t, confidenceLabel,];
    }
    if (__VLS_ctx.review.diff && __VLS_ctx.review.diff.totalChanges > 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
            ...{ class: "review__diff" },
        });
        /** @type {__VLS_StyleScopedClasses['review__diff']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "review__header" },
        });
        /** @type {__VLS_StyleScopedClasses['review__header']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({
            ...{ class: "review__subtitle" },
        });
        /** @type {__VLS_StyleScopedClasses['review__subtitle']} */ ;
        (__VLS_ctx.t('review.diffTitle'));
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "review__badge" },
        });
        /** @type {__VLS_StyleScopedClasses['review__badge']} */ ;
        (__VLS_ctx.t('review.diffChanged', { count: __VLS_ctx.review.diff.totalChanges }));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "review__list" },
        });
        /** @type {__VLS_StyleScopedClasses['review__list']} */ ;
        for (const [block] of __VLS_vFor((__VLS_ctx.changedDiffBlocks))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.article, __VLS_intrinsics.article)({
                key: (`diff-${block.key}`),
                ...{ class: "review__item review__item--diff" },
            });
            /** @type {__VLS_StyleScopedClasses['review__item']} */ ;
            /** @type {__VLS_StyleScopedClasses['review__item--diff']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "review__row" },
            });
            /** @type {__VLS_StyleScopedClasses['review__row']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "review__meta" },
            });
            /** @type {__VLS_StyleScopedClasses['review__meta']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({
                ...{ class: "review__label" },
            });
            /** @type {__VLS_StyleScopedClasses['review__label']} */ ;
            (__VLS_ctx.t(`review.${block.key}`));
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "review__badges" },
            });
            /** @type {__VLS_StyleScopedClasses['review__badges']} */ ;
            if (block.addedCount) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "review__badge" },
                });
                /** @type {__VLS_StyleScopedClasses['review__badge']} */ ;
                (__VLS_ctx.t('review.diffAdded', { count: block.addedCount }));
            }
            if (block.removedCount) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "review__badge" },
                });
                /** @type {__VLS_StyleScopedClasses['review__badge']} */ ;
                (__VLS_ctx.t('review.diffRemoved', { count: block.removedCount }));
            }
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "review__badge" },
            });
            /** @type {__VLS_StyleScopedClasses['review__badge']} */ ;
            (__VLS_ctx.t('review.diffChanged', { count: block.changeCount }));
            // @ts-ignore
            [review, review, review, t, t, t, t, t, t, changedDiffBlocks,];
        }
    }
    if (__VLS_ctx.review.hasWarnings && __VLS_ctx.review.rawText.trim()) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.details, __VLS_intrinsics.details)({
            ...{ class: "review__details review__details--full" },
        });
        /** @type {__VLS_StyleScopedClasses['review__details']} */ ;
        /** @type {__VLS_StyleScopedClasses['review__details--full']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.summary, __VLS_intrinsics.summary)({});
        (__VLS_ctx.t('review.fullRawText'));
        __VLS_asFunctionalElement1(__VLS_intrinsics.pre, __VLS_intrinsics.pre)({
            ...{ class: "review__raw review__raw--full" },
        });
        /** @type {__VLS_StyleScopedClasses['review__raw']} */ ;
        /** @type {__VLS_StyleScopedClasses['review__raw--full']} */ ;
        (__VLS_ctx.review.rawText);
    }
}
// @ts-ignore
[review, review, review, t,];
const __VLS_export = (await import('vue')).defineComponent({
    __typeProps: {},
});
export default {};
