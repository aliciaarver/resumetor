export const DEFAULT_PARSER_FEATURE_FLAGS = {
    enableAboutFallbackInference: true,
    enableExplicitSectionOverrides: true,
    enableContextualSectionBoosts: true,
    enableLooseSkillsContinuation: true,
    enableLooseLanguagesContinuation: true,
    enableLooseProjectsContinuation: true,
    enableHeaderAnnotationLinks: true,
};
const STORAGE_KEY = 'resumetor:parser-feature-flags';
export function resolveParserFeatureFlags(overrides = {}) {
    const stored = readStoredParserFeatureFlags();
    return {
        ...DEFAULT_PARSER_FEATURE_FLAGS,
        ...stored,
        ...overrides,
    };
}
function readStoredParserFeatureFlags() {
    if (typeof window === 'undefined') {
        return {};
    }
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw)
            return {};
        const parsed = JSON.parse(raw);
        const result = {};
        for (const key of Object.keys(DEFAULT_PARSER_FEATURE_FLAGS)) {
            if (typeof parsed[key] === 'boolean') {
                result[key] = parsed[key];
            }
        }
        return result;
    }
    catch {
        return {};
    }
}
