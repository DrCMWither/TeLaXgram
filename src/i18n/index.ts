import { DEFAULT_LOCALE, messages, SUPPORTED_LOCALES, type I18nKey, type Locale } from "./locales";

export { DEFAULT_LOCALE, SUPPORTED_LOCALES, type I18nKey, type Locale };

export function normalizeLocale(input?: string | null): Locale {
  const raw = (input ?? "").trim().toLowerCase().replace("_", "-");

  if (!raw) return DEFAULT_LOCALE;
  if (raw === "zh" || raw.startsWith("zh-")) return "zh-CN";
  if (raw === "ja" || raw.startsWith("ja-")) return "ja";
  if (raw === "en" || raw.startsWith("en-")) return "en";

  return DEFAULT_LOCALE;
}

export function localeFromTelegramLanguage(languageCode?: string, fallback?: string): Locale {
  return normalizeLocale(languageCode ?? fallback);
}

export function t(
  locale: Locale,
  key: I18nKey,
  values: Record<string, string | number> = {}
): string {
  const template = messages[locale][key] ?? messages[DEFAULT_LOCALE][key];
  return template.replace(/\{([A-Za-z0-9_]+)\}/g, (full, name: string) => {
    const value = values[name];
    return value === undefined ? full : String(value);
  });
}
