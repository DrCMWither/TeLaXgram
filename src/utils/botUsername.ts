const FALLBACK_BOT_MENTION = "@YourBot";

export function normalizeBotUsername(username?: string): string | undefined {
  const value = username?.trim();
  if (!value) return undefined;
  return value.startsWith("@") ? value.slice(1) : value;
}

export function botMention(username?: string): string {
  const normalized = normalizeBotUsername(username);
  return normalized ? `@${normalized}` : FALLBACK_BOT_MENTION;
}
