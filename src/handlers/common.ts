import type { AppContext } from "../context";
import { DEFAULT_LOCALE, t, type Locale } from "../i18n";
import { describeTelegramFailure } from "../telegram/client";
import type { InlineKeyboardMarkup, InlineQueryResultArticle, SendMessageParams } from "../telegram/types";
import { inputRichMessage } from "../rich/input";
import { PLAIN_MESSAGE_LIMIT } from "../rich/limits";
import type { RichSource } from "../rich/types";
import { limitChars } from "../utils/text";
import { noticePlainText, noticeRichSource, type RichNotice } from "../rich/notice";
export async function sendPlain(
  ctx: AppContext,
  chatId: number | string,
  text: string,
  extra?: Omit<SendMessageParams, "chat_id" | "text">
): Promise<void> {
  const result = await ctx.bot.call("sendMessage", {
    chat_id: chatId,
    text: limitChars(text, PLAIN_MESSAGE_LIMIT),
    ...(extra ?? {})
  });

  if (!result.ok) {
    ctx.logger.error("sendMessage failed", result.error);
  }
}

export async function sendRichOrFallback(
  ctx: AppContext,
  chatId: number | string,
  src: RichSource,
  locale: Locale = DEFAULT_LOCALE
): Promise<void> {
  const result = await ctx.bot.call("sendRichMessage", {
    chat_id: chatId,
    rich_message: inputRichMessage(src)
  });

  if (result.ok) return;

  ctx.logger.warn("sendRichMessage failed; falling back to plain text", result.error);

  await sendPlain(
    ctx,
    chatId,
    [
      t(locale, "rich.failure", { reason: describeTelegramFailure(result.error) }),
      "",
      t(locale, "rich.sourceLabel"),
      limitChars(src.content, PLAIN_MESSAGE_LIMIT - 100)
    ].join("\n")
  );
}

export async function sendRichSourceOrPlain(
  ctx: AppContext,
  chatId: number | string,
  src: RichSource,
  plainFallback: string,
  extra?: {
    reply_markup?: InlineKeyboardMarkup;
  },
): Promise<void> {
  const result = await ctx.bot.call("sendRichMessage", {
    chat_id: chatId,
    rich_message: inputRichMessage(src),
    ...(extra ?? {}),
  });

  if (result.ok) return;

  ctx.logger.warn(
    "sendRichMessage failed; falling back to provided plain text",
    result.error,
  );

  await sendPlain(ctx, chatId, plainFallback, extra);
}

export async function sendNotice(
  ctx: AppContext,
  chatId: number | string,
  notice: RichNotice,
  extra?: {
    reply_markup?: InlineKeyboardMarkup;
  },
): Promise<void> {
  const src = noticeRichSource(notice);

  const result = await ctx.bot.call("sendRichMessage", {
    chat_id: chatId,
    rich_message: inputRichMessage(src),
    ...(extra ?? {}),
  });

  if (result.ok) return;

  ctx.logger.warn("sendRichMessage notice failed; falling back to plain text", result.error);

  await sendPlain(ctx, chatId, noticePlainText(notice), extra);
}

export function makePlainInlineResult(
  id: string,
  title: string,
  description: string,
  text: string
): InlineQueryResultArticle {
  return {
    type: "article",
    id: id.slice(0, 64),
    title,
    description,
    input_message_content: {
      message_text: limitChars(text, PLAIN_MESSAGE_LIMIT),
      link_preview_options: { is_disabled: true }
    }
  };
}
