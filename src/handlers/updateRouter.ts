import type { AppContext } from "../context";
import type { Update } from "../telegram/types";
import { handleInlineQuery } from "./inline";
import { handleTextMessage } from "./message";

export async function dispatchUpdate(ctx: AppContext, update: Update): Promise<void> {
  if (update.inline_query) {
    await handleInlineQuery(ctx, update.inline_query);
    return;
  }

  if (update.message?.text) {
    await handleTextMessage(ctx, update.message);
    return;
  }

  ctx.logger.debug("Ignored unsupported update", { update_id: update.update_id });
}
