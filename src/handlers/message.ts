import type { AppContext } from "../context";
import { localeFromTelegramLanguage, t, type Locale } from "../i18n";
import { sendNotice, sendPlain, sendRichOrFallback, sendRichSourceOrPlain } from "./common";
import { demoMarkdown, helpMarkdown } from "../rich/demo";
import { DOC_TTL_SECONDS } from "../rich/limits";
import { formatLintResult, formatLintResultRichSource, lintRichSource, lintUsage } from "../rich/lint";
import { sourceFromText } from "../rich/parser";
import type { Message } from "../telegram/types";
import { botMention, normalizeBotUsername } from "../utils/botUsername";
import { sendStart } from "./start";

interface Command {
  name: string;
  args: string;
  target?: string;
}

export async function handleTextMessage(ctx: AppContext, message: Message): Promise<void> {
  const text = message.text ?? "";
  const chatId = message.chat.id;
  const command = parseCommand(text, ctx.env.BOT_USERNAME);
  const locale = localeFromTelegramLanguage(message.from?.language_code, ctx.env.DEFAULT_LOCALE);

  if (!command) return;

  switch (command.name) {
    case "start":
      await sendStart(ctx, chatId, locale);
      return;
    case "help":
      await sendRichOrFallback(ctx, chatId, {
        mode: "markdown",
        content: helpMarkdown(ctx.env.BOT_USERNAME, locale),
        title: t(locale, "command.help.title"),
        description: t(locale, "command.help.description"),
      }, locale);
      return;

    case "demo":
      await sendRichOrFallback(ctx, chatId, {
        mode: "markdown",
        content: demoMarkdown(locale),
        title: t(locale, "command.demo.title"),
        description: t(locale, "command.demo.description"),
      }, locale);
      return;

    case "lint":
      await lintNow(ctx, message, command.args, locale);
      return;
    case "render":
      await renderNow(ctx, message, command.args, locale);
      return;

    case "save":
      await saveDraft(ctx, message, command.args, locale);
      return;

    default:
      await sendPlain(ctx, chatId, t(locale, "command.unknown"));
  }
}

async function renderNow(
  ctx: AppContext,
  message: Message,
  args: string,
  locale: Locale
): Promise<void> {
  const src = sourceFromText(args.trim() || demoMarkdown(locale), locale);
  await sendRichOrFallback(ctx, message.chat.id, src, locale);
}

async function lintNow(
  ctx: AppContext,
  message: Message,
  args: string,
  locale: Locale
): Promise<void> {
  const input = args.trimStart();

  if (!input) {
    await sendPlain(ctx, message.chat.id, lintUsage(locale));
    return;
  }

  const src = sourceFromText(input, locale);
  const result = lintRichSource(src);
  await sendRichSourceOrPlain(
    ctx,
    message.chat.id,
    formatLintResultRichSource(src, result, locale),
    formatLintResult(src, result, locale),
  );
}

async function saveDraft(
  ctx: AppContext,
  message: Message,
  args: string,
  locale: Locale
): Promise<void> {
  const chatId = message.chat.id;
  const userId = message.from?.id;

  if (!userId) {
    await sendPlain(ctx, chatId, t(locale, "save.noSender"));
    return;
  }

  const input = args.trimStart();
  if (!input) {
    await sendPlain(ctx, chatId, t(locale, "save.usage"));
    return;
  }

  const src = sourceFromText(input, locale);
  const saved = await ctx.drafts.put(userId, src, locale);

  if (!saved.ok) {
    await sendPlain(ctx, chatId, saved.error.safeMessage);
    return;
  }

  const bot = botMention(ctx.env.BOT_USERNAME);
  const days = Math.round(DOC_TTL_SECONDS / 86400);
  const query = saved.value.query;

  await sendNotice(ctx, chatId, {
    kind: "success",
    title: t(locale, "save.saved"),
    paragraphs: [
      t(locale, "save.expires", { days }),
    ],
    facts: [
      {
        label: t(locale, "save.notice.inlineLabel"),
        value: `${bot} ${query}`,
        code: true,
      },
      {
        label: t(locale, "save.notice.refLabel"),
        value: query,
        code: true,
      },
    ],
  }, {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: t(locale, "save.insertButton"),
            switch_inline_query: query,
          },
        ],
      ],
    },
  });
}

function parseCommand(text: string, ownBotUsername?: string): Command | null {
  const match = text.match(/^\/([A-Za-z0-9_]+)(?:@([A-Za-z0-9_]+))?(?:\s|$)/);
  if (!match) return null;

  const name = (match[1] ?? "").toLowerCase();
  const target = match[2];
  const own = normalizeBotUsername(ownBotUsername);

  if (target) {
    if (!own) return null;
    if (target.toLowerCase() !== own.toLowerCase()) return null;
  }

  return {
    name,
    ...(target ? { target } : {}),
    args: text.slice(match[0].length),
  };
}
