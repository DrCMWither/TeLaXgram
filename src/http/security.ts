import type { Env } from "../config/env";
import { AppError } from "../utils/errors";

export function assertWebhookSecret(request: Request, env: Env): void {
  const expected = env.WEBHOOK_SECRET;
  const actual = request.headers.get("X-Telegram-Bot-Api-Secret-Token");

  if (!expected) {
    throw new AppError({
      code: "CONFIG",
      message: "WEBHOOK_SECRET is missing",
      safeMessage: "Worker 缺少 WEBHOOK_SECRET。"
    });
  }

  if (actual !== expected) {
    throw new AppError({
      code: "UNAUTHORIZED",
      message: "Invalid Telegram webhook secret token",
      safeMessage: "Forbidden"
    });
  }
}

export async function readJsonBody<T>(request: Request): Promise<T> {
  try {
    return await request.json() as T;
  } catch (error) {
    throw new AppError({
      code: "BAD_REQUEST",
      message: "Request body is not valid JSON",
      safeMessage: "请求体不是合法 JSON。",
      cause: error
    });
  }
}
