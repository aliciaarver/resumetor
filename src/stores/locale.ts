import { computed, watch } from "vue";
import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import type { Locale } from "@/types/i18n";
import type { LanguageProficiency } from "@/types/resume";
import { ru, en } from "@/shared/i18n";
import type { TranslationDictionary, TranslationParams } from "@/shared/i18n";
import { proficiencyOptions, proficiencyLabel } from "@/entities/resume/lib/proficiency";
import { socialLinkOptions, socialLinkLabel } from "@/entities/resume/lib/socialLinkLabels";

const AVAILABLE_LOCALES: Locale[] = ["ru", "en"];

const messages: Record<Locale, TranslationDictionary> = { ru, en };

function detectDefaultLocale(): Locale {
  if (typeof navigator === "undefined") {
    return "en";
  }

  return navigator.language.toLowerCase().startsWith("ru") ? "ru" : "en";
}

function resolveMessage(locale: Locale, key: string): string {
  let current: string | string[] | TranslationDictionary = messages[locale];

  for (const segment of key.split(".")) {
    if (typeof current !== "object" || Array.isArray(current)) {
      return key;
    }

    const next = current[segment] as
      | string
      | string[]
      | TranslationDictionary
      | undefined;
    if (!next) {
      return key;
    }

    current = next;
  }

  return typeof current === "string" ? current : key;
}

function interpolate(template: string, params?: TranslationParams): string {
  if (!params) {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    String(params[key] ?? `{${key}}`),
  );
}

export const useLocaleStore = defineStore("locale", () => {
  const locale = useLocalStorage<Locale>(
    "resumetor:locale",
    detectDefaultLocale(),
  );

  function t(key: string, params?: TranslationParams): string {
    return interpolate(resolveMessage(locale.value, key), params);
  }

  function setLocale(nextLocale: Locale) {
    locale.value = nextLocale;
  }

  watch(
    locale,
    (value) => {
      if (typeof document !== "undefined") {
        document.documentElement.lang = value;
      }
    },
    { immediate: true },
  );

  return {
    locale,
    locales: AVAILABLE_LOCALES,
    proficiencyOptions: computed(() => proficiencyOptions(t)),
    socialLinkOptions: computed(() => socialLinkOptions(t)),
    t,
    setLocale,
    proficiencyLabel: (value: LanguageProficiency) => proficiencyLabel(value, t),
    socialLinkLabel: (value: string) => socialLinkLabel(value, t),
  };
});
