import type { AppContext } from "../context";
import { localeFromTelegramLanguage, t } from "../i18n";
import type {
  AnswerCallbackQueryParams,
  CallbackQuery,
} from "../telegram/types";
import { handleStartCallback } from "./start";

export async function handleCallbackQuery(
  ctx: AppContext,
  query: CallbackQuery,
): Promise<void> {
  if (await handleStartCallback(ctx, query)) return;

  const locale = localeFromTelegramLanguage(
    query.from.language_code,
    ctx.env.DEFAULT_LOCALE,
  );

  const payload: AnswerCallbackQueryParams = {
    callback_query_id: query.id,
    text: t(locale, "callback.unsupported"),
  };

  const result = await ctx.bot.call<boolean>("answerCallbackQuery", payload);
  if (!result.ok) {
    ctx.logger.warn("answerCallbackQuery failed for unsupported callback", {
      error: result.error,
      callback_query_id: query.id,
      data: query.data,
    });
  }
}