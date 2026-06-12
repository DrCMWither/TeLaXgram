import { describe, expect, it } from "vitest";
import {
  localeFromTelegramLanguage,
  normalizeLocale,
  t,
} from "../src/i18n";

describe("i18n", () => {
  describe("normalizeLocale", () => {
    it("normalizes Chinese variants to zh-CN", () => {
      expect(normalizeLocale("zh")).toBe("zh-CN");
      expect(normalizeLocale("zh-Hans")).toBe("zh-CN");
      expect(normalizeLocale("zh_TW")).toBe("zh-CN");
    });

    it("normalizes Japanese and English variants", () => {
      expect(normalizeLocale("ja-JP")).toBe("ja");
      expect(normalizeLocale("en-US")).toBe("en");
    });

    it("falls back to default locale for unknown or empty input", () => {
      expect(normalizeLocale("fr-FR")).toBe("zh-CN");
      expect(normalizeLocale("")).toBe("zh-CN");
      expect(normalizeLocale(null)).toBe("zh-CN");
    });
  });

  describe("localeFromTelegramLanguage", () => {
    it("uses Telegram language code first", () => {
      expect(localeFromTelegramLanguage("en-US", "ja")).toBe("en");
    });

    it("uses fallback when Telegram language code is absent", () => {
      expect(localeFromTelegramLanguage(undefined, "ja")).toBe("ja");
    });
  });

  describe("t", () => {
    it("interpolates values", () => {
      expect(
        t("en", "save.inlineUsage", {
          bot: "@telaxgram_bot",
          query: "ref:abc",
        }),
      ).toBe("Inline usage: @telaxgram_bot ref:abc");
    });

    it("keeps unknown placeholders unchanged", () => {
      expect(t("en", "save.inlineUsage")).toBe(
        "Inline usage: {bot} {query}",
      );
    });
  });
});