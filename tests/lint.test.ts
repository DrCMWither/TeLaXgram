import { describe, expect, it } from "vitest";
import { formatLintResult, lintRichSource } from "../src/rich/lint";
import type { RichSource } from "../src/rich/types";

function src(mode: RichSource["mode"], content: string): RichSource {
  return { mode, content, title: "test", description: "test" };
}

function codes(result: ReturnType<typeof lintRichSource>): string[] {
  return result.issues.map((issue) => issue.code);
}

describe("rich lint i18n", () => {
  it("keeps issues structured", () => {
    const result = lintRichSource(src("html", "<section>x</section>"));

    expect(result.ok).toBe(false);
    expect(codes(result)).toContain("html.unsupportedTag");
    expect(result.issues[0]?.params).toEqual({ tag: "section" });
  });

  it("formats issue in zh-CN", () => {
    const source = src("html", "<section>x</section>");
    const result = lintRichSource(source);
    const text = formatLintResult(source, result, "zh-CN");

    expect(text).toContain("Telegram 富文本 HTML 不支持 <section> 标签。");
  });

  it("formats issue in en", () => {
    const source = src("html", "<section>x</section>");
    const result = lintRichSource(source);
    const text = formatLintResult(source, result, "en");

    expect(text).toContain("Unsupported Telegram Rich HTML tag <section>.");
  });

  it("formats issue in ja", () => {
    const source = src("html", "<section>x</section>");
    const result = lintRichSource(source);
    const text = formatLintResult(source, result, "ja");

    expect(text).toContain("Telegram Rich HTML は <section> タグに対応していません。");
  });

  it("formats latex params through i18n", () => {
    const source = src("markdown", "$\\frac12$");
    const result = lintRichSource(source);
    const text = formatLintResult(source, result, "zh-CN");

    expect(codes(result)).toContain("latex.commandArguments");
    expect(text).toContain("命令 \\frac 通常需要 2 个花括号参数。");
  });
});