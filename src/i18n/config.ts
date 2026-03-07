export const locales = ["fr", "es", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "fr";

export function isValidLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}
