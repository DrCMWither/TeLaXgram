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
import { PLAIN_MESSAGE_LIMIT } from "../rich/limits";

export async function handleInlineQuery(ctx: AppContext, inlineQuery: InlineQuery): Promise<void> {
  const locale = localeFromTelegramLanguage(inlineQuery.from.language_code, ctx.env.DEFAULT_LOCALE);
  const source = await sourceFromInlineQuery(ctx, inlineQuery.query, inlineQuery.from.id, locale);
  const results = await buildInlineResults(source, locale);

  const answer = await ctx.bot.call("answerInlineQuery", {
    inline_query_id: inlineQuery.id,
    results,
    cache_time: 0,
    is_personal: true,
    button: {
      text: t(locale, "inline.syntaxButton"),
      start_parameter: "help"
    }
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
          limitChars(source.content, PLAIN_MESSAGE_LIMIT - 100)
        ].join("\n")
      )
    ]
  });

  if (!fallback.ok) {
    ctx.logger.error("answerInlineQuery fallback failed", fallback.error);
  }
}

async function sourceFromInlineQuery(
  ctx: AppContext,
  rawQuery: string,
  userId: number,
  locale: Locale
): Promise<RichSource | RichSourceError> {
  const query = rawQuery.trim();

  if (!query) {
    return {
      mode: "markdown",
      content: demoMarkdown(locale),
      title: t(locale, "inline.empty.title"),
      description: t(locale, "inline.empty.description")
    };
  }

  const ref = query.match(/^ref:([A-Za-z0-9_-]{6,64})$/i);
  if (ref) {
    const key = ref[1];
    if (!key) {
      return {
        error: t(locale, "inline.refBadFormat"),
        description: t(locale, "inline.refBadFormatDescription")
      };
    }
    const loaded = await ctx.drafts.get(key, userId, locale);
    if (!loaded.ok) {
      return {
        error: loaded.error.safeMessage,
        description: loaded.error.message
      };
    }
    return loaded.value;
  }

  return sourceFromText(query, locale);
}

async function buildInlineResults(
  source: RichSource | RichSourceError,
  locale: Locale
): Promise<InlineQueryResultArticle[]> {
  if (isRichSourceError(source)) {
    return [
      makePlainInlineResult(
        "err",
        t(locale, "inline.renderErrorTitle"),
        source.description ?? source.error,
        t(locale, "inline.renderErrorText", { reason: source.error })
      )
    ];
  }

  const baseId = await shortHash(`${source.mode}:${source.content}`, 32);
  return [
    makeRichInlineResult(`rich_${baseId}`, source),
    makePlainInlineResult(
      `plain_${baseId}`,
      t(locale, "inline.plainTitle"),
      t(locale, "inline.plainDescription"),
      source.content
    )
  ];
}

function makeRichInlineResult(id: string, src: RichSource): InlineQueryResultArticle {
  return {
    type: "article",
    id: id.slice(0, 64),
    title: src.title,
    description: src.description,
    input_message_content: {
      rich_message: inputRichMessage(src)
    }
  };
}
