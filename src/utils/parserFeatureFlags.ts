export interface ParserFeatureFlags {
  enableAboutFallbackInference: boolean
  enableExplicitSectionOverrides: boolean
  enableContextualSectionBoosts: boolean
  enableLooseSkillsContinuation: boolean
  enableLooseLanguagesContinuation: boolean
  enableLooseProjectsContinuation: boolean
  enableHeaderAnnotationLinks: boolean
}

export const DEFAULT_PARSER_FEATURE_FLAGS: ParserFeatureFlags = {
  enableAboutFallbackInference: true,
  enableExplicitSectionOverrides: true,
  enableContextualSectionBoosts: true,
  enableLooseSkillsContinuation: true,
  enableLooseLanguagesContinuation: true,
  enableLooseProjectsContinuation: true,
  enableHeaderAnnotationLinks: true,
}

const STORAGE_KEY = 'resumetor:parser-feature-flags'

export function resolveParserFeatureFlags(
  overrides: Partial<ParserFeatureFlags> = {},
): ParserFeatureFlags {
  const stored = readStoredParserFeatureFlags()

  return {
    ...DEFAULT_PARSER_FEATURE_FLAGS,
    ...stored,
    ...overrides,
  }
}

function readStoredParserFeatureFlags(): Partial<ParserFeatureFlags> {
  if (typeof window === 'undefined') {
    return {}
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}

    const parsed = JSON.parse(raw) as Record<string, unknown>
    const result: Partial<ParserFeatureFlags> = {}

    for (const key of Object.keys(DEFAULT_PARSER_FEATURE_FLAGS) as Array<keyof ParserFeatureFlags>) {
      if (typeof parsed[key] === 'boolean') {
        result[key] = parsed[key]
      }
    }

    return result
  } catch {
    return {}
  }
}
