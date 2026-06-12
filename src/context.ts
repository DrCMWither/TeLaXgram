import type { Env } from "./config/env";
import { DraftStore } from "./storage/draftStore";
import { TelegramClient } from "./telegram/client";
import { ConsoleLogger, type Logger } from "./utils/logger";

export interface AppContext {
  env: Env;
  bot: TelegramClient;
  drafts: DraftStore;
  logger: Logger;
  requestId: string;
}

export function createAppContext(env: Env, requestId: string): AppContext {
  const logger = new ConsoleLogger(requestId);
  return {
    env,
    logger,
    requestId,
    bot: new TelegramClient(env.BOT_TOKEN, logger),
    drafts: new DraftStore(env.DOCS)
  };
}
