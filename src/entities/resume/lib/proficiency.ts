import type { LanguageProficiency } from "@/types/resume";

export const PROFICIENCY_ORDER: LanguageProficiency[] = [
  "Native",
  "Fluent",
  "Advanced",
  "Intermediate",
  "Basic",
];

export function proficiencyLabel(
  value: LanguageProficiency,
  t: (key: string) => string,
): string {
  return t(`proficiency.${value}`);
}

export function proficiencyOptions(t: (key: string) => string) {
  return PROFICIENCY_ORDER.map((value) => ({
    value,
    label: proficiencyLabel(value, t),
  }));
}
