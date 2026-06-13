import { DEFAULT_LOCALE, t, type I18nKey, type Locale } from "../i18n";
import {
  RICH_BLOCK_LIMIT,
  RICH_CHAR_LIMIT,
  RICH_MEDIA_LIMIT,
  RICH_NESTING_LIMIT,
  TABLE_MAX_COLUMNS,
} from "./limits";
import type { RichSource } from "./types";

export type RichLintLevel = "info" | "warn" | "error";
type I18nValues = Record<string, string | number>;

const ISSUE_I18N_KEYS = {
  "rich.empty": "lint.issue.rich.empty",
  "rich.tooLong": "lint.issue.rich.tooLong",
  "rich.nestingLimit": "lint.issue.rich.nestingLimit",
  "rich.mediaLimit": "lint.issue.rich.mediaLimit",
  "rich.tableColumnLimit": "lint.issue.rich.tableColumnLimit",
  "rich.blockLimitApprox": "lint.issue.rich.blockLimitApprox",

  "html.malformedTag": "lint.issue.html.malformedTag",
  "html.unsupportedTag": "lint.issue.html.unsupportedTag",
  "html.duplicateAttr": "lint.issue.html.duplicateAttr",
  "html.unsupportedAttr": "lint.issue.html.unsupportedAttr",
  "html.attrWithoutValue": "lint.issue.html.attrWithoutValue",
  "html.anchorWithoutTarget": "lint.issue.html.anchorWithoutTarget",
  "html.badHref": "lint.issue.html.badHref",
  "html.mediaMissingSrc": "lint.issue.html.mediaMissingSrc",
  "html.mediaBadSrc": "lint.issue.html.mediaBadSrc",
  "html.badEmojiId": "lint.issue.html.badEmojiId",
  "html.referenceMissingName": "lint.issue.html.referenceMissingName",
  "html.badTime": "lint.issue.html.badTime",
  "html.badNumberAttr": "lint.issue.html.badNumberAttr",
  "html.badIntegerAttr": "lint.issue.html.badIntegerAttr",
  "html.codeLanguageOutsidePre": "lint.issue.html.codeLanguageOutsidePre",
  "html.unmatchedClosingTag": "lint.issue.html.unmatchedClosingTag",
  "html.crossedTags": "lint.issue.html.crossedTags",
  "html.unclosedTag": "lint.issue.html.unclosedTag",
  "html.invalidEntity": "lint.issue.html.invalidEntity",
  "html.bareAmpersand": "lint.issue.html.bareAmpersand",

  "markdown.unclosedDisplayMath": "lint.issue.markdown.unclosedDisplayMath",

  "latex.empty": "lint.issue.latex.empty",
  "latex.trailingBackslash": "lint.issue.latex.trailingBackslash",
  "latex.unlikelyCommand": "lint.issue.latex.unlikelyCommand",
  "latex.unmatchedDelimiter": "lint.issue.latex.unmatchedDelimiter",
  "latex.mismatchedDelimiter": "lint.issue.latex.mismatchedDelimiter",
  "latex.unclosedDelimiter": "lint.issue.latex.unclosedDelimiter",
  "latex.endWithoutBegin": "lint.issue.latex.endWithoutBegin",
  "latex.environmentMismatch": "lint.issue.latex.environmentMismatch",
  "latex.beginWithoutEnd": "lint.issue.latex.beginWithoutEnd",
  "latex.rightWithoutLeft": "lint.issue.latex.rightWithoutLeft",
  "latex.leftWithoutRight": "lint.issue.latex.leftWithoutRight",
  "latex.missingScriptArgument": "lint.issue.latex.missingScriptArgument",
  "latex.commandArguments": "lint.issue.latex.commandArguments",
} as const satisfies Record<string, I18nKey>;

export type RichLintIssueCode = keyof typeof ISSUE_I18N_KEYS;

export interface RichLintIssue {
  level: RichLintLevel;
  code: RichLintIssueCode;
  params: I18nValues;
  index?: number;
}

export interface RichLintStats {
  chars: number;
  htmlTags: number;
  formulas: number;
  media: number;
  maxNesting: number;
  tableColumns: number;
  estimatedBlocks: number;
}

export interface RichLintResult {
  ok: boolean;
  errors: number;
  warnings: number;
  issues: RichLintIssue[];
  stats: RichLintStats;
}

interface HtmlTag {
  name: string;
  closing: boolean;
  selfClosing: boolean;
  attrs: ParsedHtmlAttrs;
  index: number;
  raw: string;
}

interface ParsedHtmlAttrs {
  byName: Map<string, HtmlAttr>;
  list: HtmlAttr[];
}

interface HtmlAttr {
  name: string;
  index: number;
  value?: string;
}

interface FormulaSnippet {
  source: string;
  index: number;
  kind: "html-inline" | "html-block" | "markdown-inline" | "markdown-block" | "markdown-fence";
}

const ALLOWED_HTML_TAGS = new Set([
  "a",
  "b",
  "strong",
  "i",
  "em",
  "u",
  "ins",
  "s",
  "strike",
  "del",
  "code",
  "mark",
  "sub",
  "sup",
  "tg-spoiler",
  "tg-reference",
  "tg-emoji",
  "img",
  "tg-time",
  "tg-math",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p",
  "pre",
  "footer",
  "hr",
  "ul",
  "ol",
  "li",
  "blockquote",
  "br",
  "cite",
  "aside",
  "video",
  "audio",
  "figure",
  "figcaption",
  "tg-map",
  "tg-collage",
  "tg-slideshow",
  "table",
  "caption",
  "tr",
  "th",
  "td",
  "details",
  "summary",
  "tg-math-block",
]);

const VOID_LIKE_HTML_TAGS = new Set(["br", "hr", "img", "tg-map"]);
const MEDIA_HTML_TAGS = new Set(["img", "video", "audio"]);
const BLOCKISH_HTML_TAGS = new Set([
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p",
  "pre",
  "footer",
  "hr",
  "ul",
  "ol",
  "li",
  "blockquote",
  "aside",
  "figure",
  "figcaption",
  "tg-map",
  "tg-collage",
  "tg-slideshow",
  "table",
  "caption",
  "tr",
  "details",
  "summary",
  "tg-math-block",
]);

const NAMED_HTML_ENTITIES = new Set([
  "lt",
  "gt",
  "amp",
  "quot",
  "apos",
  "nbsp",
  "hellip",
  "mdash",
  "ndash",
  "lsquo",
  "rsquo",
  "ldquo",
  "rdquo",
]);

const EMPTY_ATTRS = new Set<string>();
const BOOLEAN_ATTRS = new Set(["open", "bordered", "striped", "reversed", "tg-spoiler"]);
const TAG_ATTRS: Record<string, ReadonlySet<string>> = {
  a: new Set(["href", "name"]),
  code: new Set(["class"]),
  "tg-reference": new Set(["name"]),
  "tg-emoji": new Set(["emoji-id"]),
  img: new Set(["src", "alt", "tg-spoiler"]),
  "tg-time": new Set(["unix", "format"]),
  ol: new Set(["start", "type", "reversed"]),
  li: new Set(["value", "type"]),
  video: new Set(["src", "tg-spoiler"]),
  audio: new Set(["src", "tg-spoiler"]),
  "tg-map": new Set(["lat", "long", "zoom", "width", "height"]),
  table: new Set(["bordered", "striped"]),
  td: new Set(["colspan", "rowspan", "align", "valign"]),
  th: new Set(["colspan", "rowspan", "align", "valign"]),
  details: new Set(["open"]),
};

const LATEX_BRACED_ARGUMENT_COMMANDS: Record<string, number> = {
  frac: 2,
  dfrac: 2,
  tfrac: 2,
  binom: 2,
  sqrt: 1,
  overline: 1,
  underline: 1,
  overbrace: 1,
  underbrace: 1,
  vec: 1,
  hat: 1,
  bar: 1,
  tilde: 1,
  text: 1,
  textrm: 1,
  textbf: 1,
  textit: 1,
  mathrm: 1,
  mathbf: 1,
  mathit: 1,
  mathbb: 1,
  mathcal: 1,
  operatorname: 1,
};

const WHY_DO_YOU_WANT_TO_USE_IT = /\\(input|include|write|read|openout|catcode|def|gdef|edef|newcommand|renewcommand|usepackage)\b/g;

export function lintRichSource(src: RichSource): RichLintResult {
  const issues: RichLintIssue[] = [];
  const stats: RichLintStats = {
    chars: Array.from(src.content).length,
    htmlTags: 0,
    formulas: 0,
    media: 0,
    maxNesting: 0,
    tableColumns: 0,
    estimatedBlocks: 0,
  };

  if (!src.content.trim()) {
    addIssue(issues, "error", "rich.empty");
  }

  if (stats.chars > RICH_CHAR_LIMIT) {
    addIssue(issues, "error", "rich.tooLong", { chars: stats.chars, limit: RICH_CHAR_LIMIT });
  }

  const htmlLintInput = src.mode === "markdown" ? blankMarkdownCode(src.content) : src.content;
  lintHtmlSyntax(htmlLintInput, src.mode, issues, stats);

  const formulas = src.mode === "html" ? extractHtmlFormulas(src.content) : extractMarkdownFormulas(src.content, issues);
  for (const formula of formulas) {
    lintLatexFormula(formula, issues, stats);
  }

  if (stats.maxNesting > RICH_NESTING_LIMIT) {
    addIssue(issues, "error", "rich.nestingLimit", { depth: stats.maxNesting, limit: RICH_NESTING_LIMIT });
  }

  if (stats.media > RICH_MEDIA_LIMIT) {
    addIssue(issues, "error", "rich.mediaLimit", { media: stats.media, limit: RICH_MEDIA_LIMIT });
  }

  if (stats.tableColumns > TABLE_MAX_COLUMNS) {
    addIssue(issues, "error", "rich.tableColumnLimit", { columns: stats.tableColumns, limit: TABLE_MAX_COLUMNS });
  }

  if (stats.estimatedBlocks > RICH_BLOCK_LIMIT) {
    addIssue(issues, "warn", "rich.blockLimitApprox", { blocks: stats.estimatedBlocks, limit: RICH_BLOCK_LIMIT });
  }

  const counts = countIssueLevels(issues);

  return {
    ok: counts.errors === 0,
    errors: counts.errors,
    warnings: counts.warnings,
    issues,
    stats,
  };
}

export function formatLintResult(
  src: RichSource,
  result: RichLintResult,
  locale: Locale = DEFAULT_LOCALE,
): string {
  const lines = [
    t(locale, result.ok ? "lint.status.pass" : "lint.status.fail"),
    "",
    t(locale, "lint.output.mode", { mode: src.mode }),
    t(locale, "lint.output.stats", {
      chars: result.stats.chars,
      charLimit: RICH_CHAR_LIMIT,
      formulas: result.stats.formulas,
      htmlTags: result.stats.htmlTags,
      media: result.stats.media,
      maxNesting: result.stats.maxNesting,
    }),
    t(locale, "lint.output.summary", {
      errors: result.errors,
      warnings: result.warnings,
    }),
  ];

  if (result.issues.length === 0) {
    lines.push("", t(locale, "lint.output.noIssues"));
    return lines.join("\n");
  }

  lines.push("", t(locale, "lint.output.issues"));
  for (const issue of result.issues.slice(0, 24)) {
    const marker = issue.level === "error" ? "❌" : issue.level === "warn" ? "⚠️" : "ℹ️";
    const at = issue.index === undefined ? "" : t(locale, "lint.output.at", { index: issue.index });
    const message = t(locale, ISSUE_I18N_KEYS[issue.code], issue.params);
    lines.push(t(locale, "lint.output.issueLine", { marker, code: issue.code, at, message }));
  }

  if (result.issues.length > 24) {
    lines.push(t(locale, "lint.output.more", { count: result.issues.length - 24 }));
  }

  return lines.join("\n");
}

export function lintUsage(locale: Locale = DEFAULT_LOCALE): string {
  return [
    t(locale, "lint.usage.title"),
    "",
    t(locale, "lint.usage.md"),
    t(locale, "lint.usage.html"),
    t(locale, "lint.usage.math"),
  ].join("\n");
}

function lintHtmlSyntax(
  content: string,
  mode: RichSource["mode"],
  issues: RichLintIssue[],
  stats: RichLintStats,
): void {
  if (mode === "html") {
    lintHtmlEntities(content, issues);
  }

  const stack: Array<{ name: string; index: number }> = [];
  const tagRe = /<!--[\s\S]*?-->|<\/?[A-Za-z][A-Za-z0-9-]*(?:\s+[^<>]*?)?\/?\s*>|<[^>]*>/g;

  for (const match of content.matchAll(tagRe)) {
    const raw = match[0];
    const index = match.index ?? 0;

    if (raw.startsWith("<!--")) continue;

    const tag = parseHtmlTag(raw, index);
    if (!tag) {
      if (mode === "html") {
        addIssue(issues, "error", "html.malformedTag", { tag: raw.slice(0, 80) }, index);
      }
      continue;
    }

    stats.htmlTags += 1;

    if (!ALLOWED_HTML_TAGS.has(tag.name)) {
      addIssue(issues, "error", "html.unsupportedTag", { tag: tag.name }, index);
    }

    if (!tag.closing) {
      validateHtmlAttributes(tag, stack, issues, stats);
    }

    if (BLOCKISH_HTML_TAGS.has(tag.name) && !tag.closing) {
      stats.estimatedBlocks += 1;
    }

    if (tag.closing) {
      closeHtmlTag(tag, stack, issues);
      continue;
    }

    if (tag.selfClosing || VOID_LIKE_HTML_TAGS.has(tag.name)) {
      continue;
    }

    stack.push({ name: tag.name, index: tag.index });
    stats.maxNesting = Math.max(stats.maxNesting, stack.length);
  }

  for (let i = stack.length - 1; i >= 0; i -= 1) {
    const open = stack[i];
    if (!open) continue;
    addIssue(issues, "error", "html.unclosedTag", { tag: open.name }, open.index);
  }

  stats.tableColumns = Math.max(stats.tableColumns, maxHtmlTableColumns(content));
}

function parseHtmlTag(raw: string, index: number): HtmlTag | null {
  const match = raw.match(/^<\s*(\/?)\s*([A-Za-z][A-Za-z0-9-]*)([\s\S]*?)(\/?)\s*>$/);
  if (!match) return null;

  const closing = (match[1] ?? "") === "/";
  const name = (match[2] ?? "").toLowerCase();
  const attrText = match[3] ?? "";
  const selfClosing = !closing && ((match[4] ?? "") === "/" || VOID_LIKE_HTML_TAGS.has(name));
  const attrOffset = raw.match(/^<\s*\/?\s*[A-Za-z][A-Za-z0-9-]*/)?.[0].length ?? 0;

  return {
    name,
    closing,
    selfClosing,
    attrs: closing ? emptyParsedHtmlAttrs() : parseHtmlAttrs(attrText, index + attrOffset),
    index,
    raw,
  };
}

function emptyParsedHtmlAttrs(): ParsedHtmlAttrs {
  return { byName: new Map(), list: [] };
}

function parseHtmlAttrs(attrText: string, attrBaseIndex: number): ParsedHtmlAttrs {
  const byName = new Map<string, HtmlAttr>();
  const list: HtmlAttr[] = [];
  const attrRe = /([A-Za-z_:][A-Za-z0-9_:.-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

  for (const match of attrText.matchAll(attrRe)) {
    const name = (match[1] ?? "").toLowerCase();
    const value = match[2] ?? match[3] ?? match[4];
    const attr: HtmlAttr =
      value === undefined
        ? { name, index: attrBaseIndex + (match.index ?? 0) }
        : { name, index: attrBaseIndex + (match.index ?? 0), value };
    list.push(attr);
    if (!byName.has(name)) {
      byName.set(name, attr);
    }
  }

  return { byName, list };
}

function validateHtmlAttributes(
  tag: HtmlTag,
  stack: Array<{ name: string; index: number }>,
  issues: RichLintIssue[],
  stats: RichLintStats,
): void {
  const allowedAttrs = TAG_ATTRS[tag.name] ?? EMPTY_ATTRS;
  const seen = new Set<string>();

  for (const attr of tag.attrs.list) {
    if (seen.has(attr.name)) {
      addIssue(issues, "warn", "html.duplicateAttr", { tag: tag.name, attr: attr.name }, attr.index);
    }
    seen.add(attr.name);

    if (!allowedAttrs.has(attr.name)) {
      addIssue(issues, "warn", "html.unsupportedAttr", { tag: tag.name, attr: attr.name }, attr.index);
    }

    if (attr.value === undefined && !BOOLEAN_ATTRS.has(attr.name)) {
      addIssue(issues, "warn", "html.attrWithoutValue", { attr: attr.name }, attr.index);
    }
  }

  if (tag.name === "a") {
    const href = getAttr(tag, "href")?.value;
    const name = getAttr(tag, "name")?.value;
    if (!href && !name) {
      addIssue(issues, "warn", "html.anchorWithoutTarget", {}, tag.index);
    }
    if (href && !isSupportedHref(href)) {
      addIssue(issues, "error", "html.badHref", { href }, tag.index);
    }
  }

  if (MEDIA_HTML_TAGS.has(tag.name)) {
    stats.media += 1;
    const src = getAttr(tag, "src")?.value;
    if (!src) {
      addIssue(issues, "error", "html.mediaMissingSrc", { tag: tag.name }, tag.index);
    } else if (!(tag.name === "img" && isEmojiSrc(src)) && !isHttpUrl(src)) {
      addIssue(issues, "error", "html.mediaBadSrc", { src }, tag.index);
    }
  }

  if (tag.name === "tg-emoji") {
    const emojiId = getAttr(tag, "emoji-id")?.value;
    if (!emojiId || !/^\d+$/.test(emojiId)) {
      addIssue(issues, "error", "html.badEmojiId", {}, tag.index);
    }
  }

  if (tag.name === "tg-reference" && !getAttr(tag, "name")?.value) {
    addIssue(issues, "error", "html.referenceMissingName", {}, tag.index);
  }

  if (tag.name === "tg-time") {
    const unix = getAttr(tag, "unix")?.value;
    if (!unix || !/^-?\d+$/.test(unix)) {
      addIssue(issues, "error", "html.badTime", {}, tag.index);
    }
  }

  if (tag.name === "tg-map") {
    validateNumericAttr(tag, "lat", -90, 90, Number.isFinite, "html.badNumberAttr", issues);
    validateNumericAttr(tag, "long", -180, 180, Number.isFinite, "html.badNumberAttr", issues);
    validateNumericAttr(tag, "zoom", 13, 20, Number.isInteger, "html.badIntegerAttr", issues);
  }

  if (tag.name === "code" && getAttr(tag, "class")?.value) {
    const parent = stack[stack.length - 1]?.name;
    if (parent !== "pre") {
      addIssue(issues, "warn", "html.codeLanguageOutsidePre", {}, tag.index);
    }
  }
}

function closeHtmlTag(tag: HtmlTag, stack: Array<{ name: string; index: number }>, issues: RichLintIssue[]): void {
  let found = -1;
  for (let i = stack.length - 1; i >= 0; i -= 1) {
    if (stack[i]?.name === tag.name) {
      found = i;
      break;
    }
  }

  if (found === -1) {
    addIssue(issues, "error", "html.unmatchedClosingTag", { tag: tag.name }, tag.index);
    return;
  }

  if (found !== stack.length - 1) {
    const top = stack[stack.length - 1];
    const topName = top?.name ?? "unknown";
    addIssue(issues, "error", "html.crossedTags", { tag: tag.name, top: topName }, tag.index);
  }

  stack.splice(found, stack.length - found);
}

function lintHtmlEntities(content: string, issues: RichLintIssue[]): void {
  const entityRe = /&(#\d+|#x[0-9A-Fa-f]+|[A-Za-z][A-Za-z0-9]+);/g;
  for (const match of content.matchAll(entityRe)) {
    const body = match[1] ?? "";
    if (!body.startsWith("#") && !NAMED_HTML_ENTITIES.has(body)) {
      addIssue(issues, "error", "html.invalidEntity", { entity: body }, match.index ?? 0);
    }
  }

  const bareAmpRe = /&(?!#\d+;|#x[0-9A-Fa-f]+;|[A-Za-z][A-Za-z0-9]+;)/g;
  for (const match of content.matchAll(bareAmpRe)) {
    addIssue(issues, "warn", "html.bareAmpersand", {}, match.index ?? 0);
  }
}

function maxHtmlTableColumns(content: string): number {
  let maxColumns = 0;
  const rowRe = /<tr\b[^>]*>([\s\S]*?)<\/tr\s*>/gi;

  for (const rowMatch of content.matchAll(rowRe)) {
    const row = rowMatch[1] ?? "";
    let columns = 0;
    const cellRe = /<(?:td|th)\b([^>]*)>/gi;
    for (const cellMatch of row.matchAll(cellRe)) {
      const attrs = parseHtmlAttrs(cellMatch[1] ?? "", rowMatch.index ?? 0);
      const colspan = Number.parseInt(getParsedAttr(attrs, "colspan")?.value ?? "1", 10);
      columns += Number.isFinite(colspan) && colspan > 0 ? colspan : 1;
    }
    maxColumns = Math.max(maxColumns, columns);
  }

  return maxColumns;
}

function extractHtmlFormulas(content: string): FormulaSnippet[] {
  const formulas: FormulaSnippet[] = [];
  const inlineRe = /<tg-math(?:\s[^>]*)?>([\s\S]*?)<\/tg-math\s*>/gi;
  const blockRe = /<tg-math-block(?:\s[^>]*)?>([\s\S]*?)<\/tg-math-block\s*>/gi;

  for (const match of content.matchAll(inlineRe)) {
    const full = match[0];
    const source = match[1] ?? "";
    formulas.push({ source, index: (match.index ?? 0) + full.indexOf(source), kind: "html-inline" });
  }

  for (const match of content.matchAll(blockRe)) {
    const full = match[0];
    const source = match[1] ?? "";
    formulas.push({ source, index: (match.index ?? 0) + full.indexOf(source), kind: "html-block" });
  }

  return formulas;
}

function extractMarkdownFormulas(content: string, issues: RichLintIssue[]): FormulaSnippet[] {
  const formulas: FormulaSnippet[] = [];
  const blockMathRanges: Array<{ start: number; end: number }> = [];

  const work = content
    .replace(/```([A-Za-z0-9_-]*)[^\n]*\n([\s\S]*?)```/g, (full, lang: string | undefined, source: string | undefined, offset: number) => {
      const normalizedLang = (lang ?? "").toLowerCase();
      const formulaSource = source ?? "";
      if (normalizedLang === "math" || normalizedLang === "latex") {
        formulas.push({
          source: formulaSource,
          index: offset + full.indexOf(formulaSource),
          kind: "markdown-fence",
        });
      }
      return " ".repeat(full.length);
    })
    .replace(/`(?:\\.|[^`\\])*`/g, (match) => " ".repeat(match.length));

  let i = 0;
  while (i < work.length) {
    if (work.startsWith("$$", i) && !isEscaped(work, i)) {
      const end = findUnescapedToken(work, "$$", i + 2);
      if (end === -1) {
        addIssue(issues, "error", "markdown.unclosedDisplayMath", {}, i);
        i += 2;
        continue;
      }

      formulas.push({ source: content.slice(i + 2, end), index: i + 2, kind: "markdown-block" });
      blockMathRanges.push({ start: i, end: end + 2 });
      i = end + 2;
      continue;
    }

    i += 1;
  }

  i = 0;
  let blockRangeIndex = 0;
  while (i < work.length) {
    const blockRange = blockMathRanges[blockRangeIndex];
    if (blockRange && i >= blockRange.start) {
      if (i < blockRange.end) {
        i = blockRange.end;
      }
      blockRangeIndex += 1;
      continue;
    }

    if (work[i] === "$" && !work.startsWith("$$", i) && !isEscaped(work, i)) {
      const searchEnd = blockRange?.start ?? work.length;
      const end = findUnescapedSingleDollar(work, i + 1, searchEnd);
      if (end !== -1) {
        const source = content.slice(i + 1, end);
        if (source.trim()) {
          formulas.push({ source, index: i + 1, kind: "markdown-inline" });
        }
        i = end + 1;
        continue;
      }
    }

    i += 1;
  }

  return formulas;
}

function lintLatexFormula(formula: FormulaSnippet, issues: RichLintIssue[], stats: RichLintStats): void {
  stats.formulas += 1;
  const source = formula.source;
  const trimmed = source.trim();

  if (!trimmed) {
    addIssue(issues, "error", "latex.empty", { kind: formula.kind }, formula.index);
    return;
  }

  lintLatexDelimiters(source, formula.index, issues);
  lintLatexBeginEnd(source, formula.index, issues);
  lintLatexLeftRight(source, formula.index, issues);
  lintLatexScripts(source, formula.index, issues);
  lintLatexRequiredGroups(source, formula.index, issues);

  if (endsWithOddBackslash(source)) {
    addIssue(issues, "error", "latex.trailingBackslash", {}, formula.index + source.length - 1);
  }

  for (const match of source.matchAll(WHY_DO_YOU_WANT_TO_USE_IT)) {
    const command = match[1] ?? "";
    addIssue(issues, "warn", "latex.unlikelyCommand", { command }, formula.index + (match.index ?? 0));
  }
}

function lintLatexDelimiters(source: string, baseIndex: number, issues: RichLintIssue[]): void {
  const stack: Array<{ open: string; close: string; index: number; level: "error" | "warn" }> = [];
  const pairs: Record<string, { close: string; level: "error" | "warn" }> = {
    "{": { close: "}", level: "error" },
    "[": { close: "]", level: "warn" },
    "(": { close: ")", level: "warn" },
  };
  const closing = new Set(["}", "]", ")"]);

  for (let i = 0; i < source.length; i += 1) {
    const ch = source[i] ?? "";
    if (isEscaped(source, i)) continue;

    const pair = pairs[ch];
    if (pair) {
      stack.push({ open: ch, close: pair.close, index: baseIndex + i, level: pair.level });
      continue;
    }

    if (closing.has(ch)) {
      const top = stack[stack.length - 1];
      if (!top) {
        const level = ch === "}" ? "error" : "warn";
        addIssue(issues, level, "latex.unmatchedDelimiter", { delimiter: ch }, baseIndex + i);
        continue;
      }
      if (top.close !== ch) {
        const level = top.level === "error" || ch === "}" ? "error" : "warn";
        addIssue(issues, level, "latex.mismatchedDelimiter", { expected: top.close, found: ch }, baseIndex + i);
      }
      stack.pop();
    }
  }

  for (let i = stack.length - 1; i >= 0; i -= 1) {
    const item = stack[i];
    if (!item) continue;
    addIssue(issues, item.level, "latex.unclosedDelimiter", { delimiter: item.open }, item.index);
  }
}

function lintLatexBeginEnd(source: string, baseIndex: number, issues: RichLintIssue[]): void {
  const stack: Array<{ env: string; index: number }> = [];
  const envRe = /\\(begin|end)\s*\{([^{}]+)\}/g;

  for (const match of source.matchAll(envRe)) {
    const kind = match[1] ?? "";
    const env = match[2] ?? "";
    const index = baseIndex + (match.index ?? 0);

    if (kind === "begin") {
      stack.push({ env, index });
      continue;
    }

    const top = stack[stack.length - 1];
    if (!top) {
      addIssue(issues, "error", "latex.endWithoutBegin", { env }, index);
      continue;
    }
    if (top.env !== env) {
      addIssue(issues, "error", "latex.environmentMismatch", { expectedEnv: top.env, gotEnv: env }, index);
    }
    stack.pop();
  }

  for (let i = stack.length - 1; i >= 0; i -= 1) {
    const item = stack[i];
    if (!item) continue;
    addIssue(issues, "error", "latex.beginWithoutEnd", { env: item.env }, item.index);
  }
}

function lintLatexLeftRight(source: string, baseIndex: number, issues: RichLintIssue[]): void {
  const stack: number[] = [];
  const re = /\\(left|right)\b/g;

  for (const match of source.matchAll(re)) {
    const kind = match[1] ?? "";
    const index = baseIndex + (match.index ?? 0);
    if (kind === "left") {
      stack.push(index);
    } else if (stack.length === 0) {
      addIssue(issues, "error", "latex.rightWithoutLeft", {}, index);
    } else {
      stack.pop();
    }
  }

  for (let i = stack.length - 1; i >= 0; i -= 1) {
    const index = stack[i];
    if (index === undefined) continue;
    addIssue(issues, "error", "latex.leftWithoutRight", {}, index);
  }
}

function lintLatexScripts(source: string, baseIndex: number, issues: RichLintIssue[]): void {
  for (let i = 0; i < source.length; i += 1) {
    const ch = source[i];
    if ((ch !== "^" && ch !== "_") || isEscaped(source, i)) continue;

    const next = skipSpaces(source, i + 1);
    const nextChar = source[next];
    if (nextChar === undefined || nextChar === "^" || nextChar === "_" || nextChar === "}" || nextChar === "&") {
      addIssue(issues, "error", "latex.missingScriptArgument", { token: ch }, baseIndex + i);
    }
  }
}

function lintLatexRequiredGroups(source: string, baseIndex: number, issues: RichLintIssue[]): void {
  const commandRe = /\\([A-Za-z]+)\*?/g;

  for (const match of source.matchAll(commandRe)) {
    const command = match[1] ?? "";
    const expected = LATEX_BRACED_ARGUMENT_COMMANDS[command];
    if (expected === undefined) continue;

    let pos = (match.index ?? 0) + (match[0]?.length ?? 0);
    if (command === "sqrt") {
      pos = skipOptionalBracketGroup(source, pos);
    }

    let ok = true;
    for (let n = 0; n < expected; n += 1) {
      pos = skipSpaces(source, pos);
      if (source[pos] !== "{") {
        ok = false;
        break;
      }
      const end = findBalancedGroup(source, pos, "{", "}");
      if (end === -1) {
        ok = false;
        break;
      }
      pos = end + 1;
    }

    if (!ok) {
      addIssue(issues, "warn", "latex.commandArguments", { command, expected }, baseIndex + (match.index ?? 0));
    }
  }
}

function validateNumericAttr(
  tag: HtmlTag,
  name: string,
  min: number,
  max: number,
  isValidNumber: (value: number) => boolean,
  code: Extract<RichLintIssueCode, "html.badNumberAttr" | "html.badIntegerAttr">,
  issues: RichLintIssue[],
): void {
  const attr = getAttr(tag, name);
  const value = attr?.value;
  const number = value === undefined ? Number.NaN : Number(value);
  if (!isValidNumber(number) || number < min || number > max) {
    addIssue(issues, "error", code, { tag: tag.name, attr: name, min, max }, attr?.index ?? tag.index);
  }
}

function getAttr(tag: HtmlTag, name: string): HtmlAttr | undefined {
  return getParsedAttr(tag.attrs, name);
}

function getParsedAttr(attrs: ParsedHtmlAttrs, name: string): HtmlAttr | undefined {
  return attrs.byName.get(name);
}

function isSupportedHref(value: string): boolean {
  return (
    /^#[A-Za-z0-9_.:-]+$/.test(value) ||
    /^https?:\/\//i.test(value) ||
    /^mailto:[^\s]+$/i.test(value) ||
    /^tel:[+0-9().\-\s]+$/i.test(value) ||
    /^tg:\/\/user\?id=\d+$/.test(value)
  );
}

function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

function isEmojiSrc(value: string): boolean {
  return /^tg:\/\/emoji\?id=\d+$/.test(value);
}

function countIssueLevels(issues: RichLintIssue[]): { errors: number; warnings: number } {
  let errors = 0;
  let warnings = 0;

  for (const issue of issues) {
    if (issue.level === "error") errors += 1;
    if (issue.level === "warn") warnings += 1;
  }

  return { errors, warnings };
}

function addIssue(
  issues: RichLintIssue[],
  level: RichLintLevel,
  code: RichLintIssueCode,
  params: I18nValues = {},
  index?: number,
): void {
  const issue: RichLintIssue = { level, code, params };
  if (index !== undefined) issue.index = index;
  issues.push(issue);
}

function blankMarkdownCode(input: string): string {
  return input
    .replace(/```[\s\S]*?```/g, (match) => " ".repeat(match.length))
    .replace(/`(?:\\.|[^`\\])*`/g, (match) => " ".repeat(match.length));
}

function findUnescapedToken(input: string, token: string, start: number): number {
  let index = input.indexOf(token, start);
  while (index !== -1) {
    if (!isEscaped(input, index)) return index;
    index = input.indexOf(token, index + token.length);
  }
  return -1;
}

function findUnescapedSingleDollar(input: string, start: number, end = input.length): number {
  for (let i = start; i < end; i += 1) {
    if (input[i] === "$" && !input.startsWith("$$", i) && !isEscaped(input, i)) return i;
  }
  return -1;
}

function isEscaped(input: string, index: number): boolean {
  return hasOddBackslashRunEndingAt(input, index - 1);
}

function endsWithOddBackslash(input: string): boolean {
  return hasOddBackslashRunEndingAt(input, input.length - 1);
}

function hasOddBackslashRunEndingAt(input: string, endInclusive: number): boolean {
  let count = 0;
  for (let i = endInclusive; i >= 0 && input[i] === "\\"; i -= 1) {
    count += 1;
  }
  return count % 2 === 1;
}

function skipSpaces(input: string, start: number): number {
  let i = start;
  while (i < input.length && /\s/.test(input[i] ?? "")) i += 1;
  return i;
}

function skipOptionalBracketGroup(input: string, start: number): number {
  const pos = skipSpaces(input, start);
  if (input[pos] !== "[") return start;
  const end = findBalancedGroup(input, pos, "[", "]");
  return end === -1 ? start : end + 1;
}

function findBalancedGroup(input: string, start: number, open: string, close: string): number {
  let depth = 0;
  for (let i = start; i < input.length; i += 1) {
    const ch = input[i];
    if (ch === undefined || isEscaped(input, i)) continue;
    if (ch === open) depth += 1;
    if (ch === close) {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return -1;
}
