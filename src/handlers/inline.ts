import type { AppContext } from "../context";
import { localeFromTelegramLanguage, t, type Locale } from "../i18n";
import { makePlainInlineResult } from "./common";
import { demoMarkdown } from "../rich/demo";
import { inputRichMessage } from "../rich/input";
import { sourceFromText } from "../rich/parser";
import type { RichSource, RichSourceError } from "../rich/types";
import { isRichSourceError } from "../rich/types";
import type { InlineQuery, InlineQueryResultArticle } from "../telegram/types";
import { describeTelegramFailure } from "../telegram/client";
import { shortHash } from "../utils/hash";
import { limitChars } from "../utils/text";
import { noticeRichSource } from "../rich/notice";

import {
  formatLintResult,
  formatLintResultRichSource,
  lintRichSource,
  type RichLintResult,
} from "../rich/lint";
import {
  PLAIN_MESSAGE_LIMIT,
  TELEGRAM_INLINE_QUERY_LIMIT,
  TELEGRAM_INLINE_QUERY_WARN_AT,
} from "../rich/limits";

interface InlineBuildOptions {
  lint: boolean;
  rawQuery: string;
}

interface ParsedInlineQueryFlags {
  query: string;
  lint: boolean;
}

export async function handleInlineQuery(ctx: AppContext, inlineQuery: InlineQuery): Promise<void> {
  const locale = localeFromTelegramLanguage(inlineQuery.from.language_code, ctx.env.DEFAULT_LOCALE);
  const parsedQuery = parseInlineLintFlags(inlineQuery.query);

  const source = await sourceFromInlineQuery(
    ctx,
    parsedQuery.query,
    inlineQuery.from.id,
    locale,
  );

  const results = await buildInlineResults(source, locale, {
    lint: parsedQuery.lint,
    rawQuery: inlineQuery.query,
  });

  const answer = await ctx.bot.call("answerInlineQuery", {
    inline_query_id: inlineQuery.id,
    results,
    cache_time: 0,
    is_personal: true,
    button: {
      text: t(locale, "inline.syntaxButton"),
      start_parameter: "help",
    },
  });

  if (answer.ok) return;

  if (isRichSourceError(source)) {
    ctx.logger.warn("answerInlineQuery failed for render error result", answer.error);
    return;
  }

  // Most commonly triggered by Telegram rejecting malformed HTML/Markdown.
  ctx.logger.warn("answerInlineQuery failed; retrying with a plain fallback", answer.error);

  const reason = describeTelegramFailure(answer.error);
  const fallback = await ctx.bot.call("answerInlineQuery", {
    inline_query_id: inlineQuery.id,
    cache_time: 0,
    is_personal: true,
    results: [
      makePlainInlineResult(
        "fallback",
        t(locale, "inline.fallbackTitle"),
        t(locale, "inline.fallbackDescription", { reason }),
        [
          t(locale, "inline.fallbackText", { reason }),
          "",
          t(locale, "inline.sourceLabel"),
          limitChars(source.content, PLAIN_MESSAGE_LIMIT - 100),
        ].join("\n"),
      ),
    ],
  });

  if (!fallback.ok) {
    ctx.logger.error("answerInlineQuery fallback failed", fallback.error);
  }
}

async function sourceFromInlineQuery(
  ctx: AppContext,
  rawQuery: string,
  userId: number,
  locale: Locale,
): Promise<RichSource | RichSourceError> {
  const query = rawQuery.trim();

  if (!query) {
    return {
      mode: "markdown",
      content: demoMarkdown(locale),
      title: t(locale, "inline.empty.title"),
      description: t(locale, "inline.empty.description"),
    };
  }

  const ref = query.match(/^ref:([A-Za-z0-9_-]{6,64})$/i);
  if (ref) {
    const key = ref[1];

    if (!key) {
      return {
        error: t(locale, "inline.refBadFormat"),
        description: t(locale, "inline.refBadFormatDescription"),
      };
    }

    const loaded = await ctx.drafts.get(key, userId, locale);

    if (!loaded.ok) {
      return {
        error: loaded.error.safeMessage,
        description: loaded.error.message,
      };
    }

    return loaded.value;
  }

  return sourceFromText(query, locale);
}

async function buildInlineResults(
  source: RichSource | RichSourceError,
  locale: Locale,
  options: InlineBuildOptions = { lint: true, rawQuery: "" },
): Promise<InlineQueryResultArticle[]> {
  const limitWarningResults = await buildInlineQueryLimitResults(options.rawQuery, locale);

  if (isRichSourceError(source)) {
    return [
      ...limitWarningResults,
      makePlainInlineResult(
        "err",
        t(locale, "inline.renderErrorTitle"),
        source.description ?? source.error,
        t(locale, "inline.renderErrorText", { reason: source.error }),
      ),
    ];
  }

  const baseId = await shortHash(
    `${source.mode}:${source.content}:${options.lint ? "lint" : "nolint"}:${options.rawQuery}`,
    32,
  );

  if (!options.lint) {
    return [
      makeRichInlineResult(`rich_${baseId}`, source),
      makePlainInlineResult(
        `plain_${baseId}`,
        t(locale, "inline.plainTitle"),
        t(locale, "inline.plainDescription"),
        source.content,
      ),
    ];
  }

  const lint = lintRichSource(source);

  if (!lint.ok) {
    return [
      ...limitWarningResults,
      makeLintInlineResult(`lint_${baseId}`, source, lint, locale),
      makePlainInlineResult(
        `plain_${baseId}`,
        t(locale, "inline.plainTitle"),
        t(locale, "inline.plainDescription"),
        source.content,
      ),
    ];
  }

  const results: InlineQueryResultArticle[] = [
    ...limitWarningResults,
    makeRichInlineResult(`rich_${baseId}`, source, {
      title: lint.warnings > 0 ? `⚠️ ${source.title}` : `✅ ${source.title}`,
      description: inlineLintDescription(source, lint, locale),
    }),
  ];

  if (lint.warnings > 0) {
    results.push(makeLintInlineResult(`lint_${baseId}`, source, lint, locale));
  }

  results.push(
    makePlainInlineResult(
      `plain_${baseId}`,
      t(locale, "inline.plainTitle"),
      t(locale, "inline.plainDescription"),
      source.content,
    ),
  );

  return results;
}

function makeRichInlineResult(
  id: string,
  src: RichSource,
  override?: {
    title?: string;
    description?: string;
  },
): InlineQueryResultArticle {
  return {
    type: "article",
    id: id.slice(0, 64),
    title: limitInlineText(override?.title ?? src.title, 80) ?? src.title ?? "",
    description: limitInlineText(override?.description ?? src.description, 160) ?? "",
    input_message_content: {
      rich_message: inputRichMessage(src),
    },
  };
}

function makeLintInlineResult(
  id: string,
  src: RichSource,
  result: RichLintResult,
  locale: Locale,
): InlineQueryResultArticle {
  const title = result.ok
    ? result.warnings > 0
      ? `⚠️ ${t(locale, "command.lint.title")}`
      : t(locale, "lint.status.pass")
    : t(locale, "lint.status.fail");

  const lintSrc = formatLintResultRichSource(src, result, locale);

  return makeRichInlineResult(id, lintSrc, {
    title,
    description: inlineLintSummary(result, locale),
  });
}

async function buildInlineQueryLimitResults(
  rawQuery: string,
  locale: Locale,
): Promise<InlineQueryResultArticle[]> {
  if (!isNearTelegramInlineQueryLimit(rawQuery)) {
    return [];
  }

  const id = await shortHash(`inline-limit:${rawQuery}`, 32);

  return [
    makeInlineQueryLimitResult(`limit_${id}`, rawQuery, locale),
  ];
}

function makeInlineQueryLimitResult(
  id: string,
  query: string,
  locale: Locale,
): InlineQueryResultArticle {
  const src = noticeRichSource({
    kind: "warning",
    title: t(locale, "inline.lint.truncatedTitle"),
    description: t(locale, "inline.lint.truncatedDescription"),
    paragraphs: [
      t(locale, "inline.lint.truncatedBody"),
      t(locale, "inline.lint.truncatedDescription"),
    ],
    facts: [
      {
        label: t(locale, "inline.lint.lengthLabel"),
        value: `${inlineQueryLength(query)} / ${TELEGRAM_INLINE_QUERY_LIMIT}`,
        code: true,
      },
      {
        label: "Use",
        value: "/save md:",
        code: true,
      },
    ],
  });

  return makeRichInlineResult(id, src, {
    title: t(locale, "inline.lint.truncatedTitle"),
    description: t(locale, "inline.lint.truncatedDescription"),
  });
}

function inlineLintDescription(
  src: RichSource,
  result: RichLintResult,
  locale: Locale,
): string {
  const summary = inlineLintSummary(result, locale);
  const description = src.description ? `${summary} · ${src.description}` : summary;
  return limitInlineText(description, 160) ?? summary;
}

function inlineLintSummary(result: RichLintResult, locale: Locale): string {
  return t(locale, "lint.output.summary", {
    errors: result.errors,
    warnings: result.warnings,
  });
}

function limitInlineText(value: string | undefined, maxChars: number): string | undefined {
  if (value === undefined) return undefined;
  return limitChars(value, maxChars, "…");
}

export function parseInlineLintFlags(rawQuery: string): ParsedInlineQueryFlags {
  let query = rawQuery.trim();
  let lint = true;

  while (true) {
    const leading = query.match(/^(-nolint|--nolint)(?:\s+|$)/i);
    if (!leading) break;

    lint = false;
    query = query.slice(leading[0].length).trimStart();
  }

  const trailing = query.match(/(?:^|\s)(-nolint|--nolint)\s*$/i);
  if (trailing && trailing.index !== undefined) {
    lint = false;
    query = query.slice(0, trailing.index).trimEnd();
  }

  return { query, lint };
}

export function inlineQueryLength(query: string): number {
  return Array.from(query).length;
}

export function isNearTelegramInlineQueryLimit(query: string): boolean {
  return inlineQueryLength(query) >= TELEGRAM_INLINE_QUERY_WARN_AT;
}