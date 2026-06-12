import type { AppContext } from "../context";
import {
  localeFromTelegramLanguage,
  t,
  type I18nKey,
  type Locale,
} from "../i18n";
import type {
  AnswerCallbackQueryParams,
  CallbackQuery,
  EditMessageTextParams,
  InlineKeyboardButton,
  InlineKeyboardMarkup,
} from "../telegram/types";
import { sendPlain } from "./common";

const START_CALLBACK_PREFIX = "tlx:start:";

const START_PAGES = [
  {
    title: "start.page.intro.title",
    body: "start.page.intro.body",
  },
  {
    title: "start.page.formats.title",
    body: "start.page.formats.body",
  },
  {
    title: "start.page.drafts.title",
    body: "start.page.drafts.body",
  },
  {
    title: "start.page.commands.title",
    body: "start.page.commands.body",
  },
] as const satisfies readonly {
  title: I18nKey;
  body: I18nKey;
}[];

export async function sendStart(
  ctx: AppContext,
  chatId: number | string,
  locale: Locale,
): Promise<void> {
  const page = 0;
  const bot = botMention(ctx.env.BOT_USERNAME);

  await sendPlain(ctx, chatId, renderStartPage(page, locale, bot), {
    link_preview_options: { is_disabled: true },
    reply_markup: startKeyboard(page, locale),
  });
}

export async function handleStartCallback(
  ctx: AppContext,
  query: CallbackQuery,
): Promise<boolean> {
  const data = query.data;
  if (!data?.startsWith(START_CALLBACK_PREFIX)) return false;

  const locale = localeFromTelegramLanguage(
    query.from.language_code,
    ctx.env.DEFAULT_LOCALE,
  );

  const rawPage = data.slice(START_CALLBACK_PREFIX.length);
  const requestedPage = Number(rawPage);

  if (!Number.isInteger(requestedPage)) {
    await answerCallback(ctx, query.id, t(locale, "start.error.badPage"));
    return true;
  }

  const message = query.message;
  if (!message) {
    await answerCallback(ctx, query.id, t(locale, "start.error.messageGone"));
    return true;
  }

  await answerCallback(ctx, query.id);

  const page = clampPage(requestedPage, START_PAGES.length);
  const bot = botMention(ctx.env.BOT_USERNAME);

  const payload: EditMessageTextParams = {
    chat_id: message.chat.id,
    message_id: message.message_id,
    text: renderStartPage(page, locale, bot),
    link_preview_options: { is_disabled: true },
    reply_markup: startKeyboard(page, locale),
  };

  const result = await ctx.bot.call("editMessageText", payload);
  if (!result.ok) {
    ctx.logger.warn("editMessageText failed for /start pager", {
      error: result.error,
      callback_query_id: query.id,
      page,
    });
  }

  return true;
}

function renderStartPage(
  page: number,
  locale: Locale,
  bot: string,
): string {
  const safePage = clampPage(page, START_PAGES.length);
  const item = START_PAGES[safePage] ?? START_PAGES[0]!;

  return [
    t(locale, item.title),
    "",
    t(locale, item.body, { bot }),
    "",
    t(locale, "start.pageCounter", {
      page: safePage + 1,
      total: START_PAGES.length,
    }),
  ].join("\n");
}

function startKeyboard(
  page: number,
  locale: Locale,
): InlineKeyboardMarkup {
  const safePage = clampPage(page, START_PAGES.length);
  const rows: InlineKeyboardButton[][] = [];
  const nav: InlineKeyboardButton[] = [];

  if (safePage > 0) {
    nav.push({
      text: t(locale, "start.nav.prev"),
      callback_data: startCallbackData(safePage - 1),
    });
  }

  if (safePage < START_PAGES.length - 1) {
    nav.push({
      text: t(locale, "start.nav.next"),
      callback_data: startCallbackData(safePage + 1),
    });
  }

  if (nav.length > 0) rows.push(nav);

  rows.push([
    {
      text: t(locale, "start.button.tryInline"),
      switch_inline_query_current_chat: "",
    },
  ]);

  rows.push([
    {
      text: t(locale, "start.button.demo"),
      switch_inline_query_current_chat: t(locale, "start.inlineDemoQuery"),
    },
  ]);

  return { inline_keyboard: rows };
}

async function answerCallback(
  ctx: AppContext,
  callbackQueryId: string,
  text?: string,
): Promise<void> {
  const payload: AnswerCallbackQueryParams = {
    callback_query_id: callbackQueryId,
  };

  if (text) payload.text = text;

  const result = await ctx.bot.call<boolean>("answerCallbackQuery", payload);
  if (!result.ok) {
    ctx.logger.warn("answerCallbackQuery failed", {
      error: result.error,
      callback_query_id: callbackQueryId,
    });
  }
}

function startCallbackData(page: number): string {
  return `${START_CALLBACK_PREFIX}${page}`;
}

function clampPage(page: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(Math.max(Math.trunc(page), 0), total - 1);
}

function botMention(botUsername?: string): string {
  return botUsername ? `@${botUsername}` : "@YourBot";
}