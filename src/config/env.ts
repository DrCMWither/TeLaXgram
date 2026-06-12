export interface Env {
  BOT_TOKEN: string;
  WEBHOOK_SECRET: string;
  BOT_USERNAME?: string;
  DEFAULT_LOCALE?: string;
  DOCS?: KVNamespace;
}

export interface EnvCheck {
  ok: boolean;
  missing: string[];
  warnings: string[];
}

export function checkEnv(env: Env): EnvCheck {
  const missing: string[] = [];
  const warnings: string[] = [];

  if (!env.BOT_TOKEN) missing.push("BOT_TOKEN");
  if (!env.WEBHOOK_SECRET) missing.push("WEBHOOK_SECRET");
  if (!env.BOT_USERNAME) warnings.push("BOT_USERNAME is not set; help text will use @YourBot.");
  if (!env.DEFAULT_LOCALE) warnings.push("DEFAULT_LOCALE is not set; zh-CN will be used as fallback locale.");
  if (!env.DOCS) warnings.push("DOCS KV binding is not set; /save and ref:<key> will be disabled.");

  return {
    ok: missing.length === 0,
    missing,
    warnings
  };
}
