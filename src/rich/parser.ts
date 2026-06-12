import { DEFAULT_LOCALE, t, type Locale } from "../i18n";
import { decodeInlineEscapes } from "../utils/text";
import type { RichSource } from "./types";
import { compactTableToMarkdown } from "./table";

export function sourceFromText(rawInput: string, locale: Locale = DEFAULT_LOCALE): RichSource {
  const text = decodeInlineEscapes(rawInput).trim();

  const html = text.match(/^(?:html|rich-html)\s*:\s*([\s\S]*)$/i);
  if (html) {
    return {
      mode: "html",
      content: html[1]?.trim() ?? "",
      title: t(locale, "parser.html.title"),
      description: t(locale, "parser.html.description")
    };
  }

  const md = text.match(/^(?:md|markdown|rich-md)\s*:\s*([\s\S]*)$/i);
  if (md) {
    return {
      mode: "markdown",
      content: md[1]?.trim() ?? "",
      title: t(locale, "parser.markdown.title"),
      description: t(locale, "parser.markdown.description")
    };
  }

  const table = text.match(/^(?:table|tbl)\s*:\s*([\s\S]*)$/i);
  if (table) {
    return {
      mode: "markdown",
      content: compactTableToMarkdown(table[1] ?? ""),
      title: t(locale, "parser.table.title"),
      description: t(locale, "parser.table.description")
    };
  }

  const mathBlock = text.match(/^(?:math|latex|eq)\s*:\s*([\s\S]*)$/i);
  const latexDisplay = text.match(/^\\\[([\s\S]*)\\\]$/);
  if (mathBlock || latexDisplay) {
    const expr = (mathBlock?.[1] ?? latexDisplay?.[1] ?? "").trim();
    return {
      mode: "markdown",
      content: `$$\n${expr}\n$$`,
      title: t(locale, "parser.mathBlock.title"),
      description: t(locale, "parser.mathBlock.description")
    };
  }

  const inlineMath = text.match(/^(?:imath|inline-math)\s*:\s*([\s\S]*)$/i);
  const latexInline = text.match(/^\\\(([\s\S]*)\\\)$/);
  if (inlineMath || latexInline) {
    const expr = (inlineMath?.[1] ?? latexInline?.[1] ?? "").trim();
    return {
      mode: "markdown",
      content: `$${expr}$`,
      title: t(locale, "parser.inlineMath.title"),
      description: t(locale, "parser.inlineMath.description")
    };
  }

  return {
    mode: "markdown",
    content: text,
    title: t(locale, "parser.default.title"),
    description: t(locale, "parser.default.description")
  };
}