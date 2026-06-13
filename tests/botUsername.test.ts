import { describe, expect, it } from "vitest";
import { botMention, normalizeBotUsername } from "../src/utils/botUsername";

describe("utils/botUsername", () => {
  it("normalizes optional at signs", () => {
    expect(normalizeBotUsername("TeLaXgramBot")).toBe("TeLaXgramBot");
    expect(normalizeBotUsername("@TeLaXgramBot")).toBe("TeLaXgramBot");
  });

  it("returns undefined for empty input", () => {
    expect(normalizeBotUsername(undefined)).toBeUndefined();
    expect(normalizeBotUsername("   ")).toBeUndefined();
  });

  it("builds a display mention", () => {
    expect(botMention("TeLaXgramBot")).toBe("@TeLaXgramBot");
    expect(botMention("@TeLaXgramBot")).toBe("@TeLaXgramBot");
    expect(botMention(undefined)).toBe("@YourBot");
  });
});
