export type TranslationDictionary = {
  [key: string]: string | string[] | TranslationDictionary;
};

export type TranslationParams = Record<string, string | number>;
