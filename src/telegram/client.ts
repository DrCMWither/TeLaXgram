import type { Logger } from "../utils/logger";
import type { TelegramApiResponse } from "./types";

export type TelegramFailureKind = "config" | "network" | "http" | "json" | "telegram";

export interface TelegramFailure {
  kind: TelegramFailureKind;
  message: string;
  method: string;
  status?: number | undefined;
  errorCode?: number | undefined;
  retryAfter?: number | undefined;
  raw?: unknown;
}

export type TelegramCallResult<T> =
  | { ok: true; result: T; status: number }
  | { ok: false; error: TelegramFailure; status?: number };

export interface TelegramClientOptions {
  timeoutMs?: number;
  maxRetries?: number;
}

export class TelegramClient {
  private readonly timeoutMs: number;
  private readonly maxRetries: number;

  constructor(
    private readonly token: string,
    private readonly logger: Logger,
    options: TelegramClientOptions = {}
  ) {
    this.timeoutMs = options.timeoutMs ?? 8000;
    this.maxRetries = options.maxRetries ?? 1;
  }

  async call<T>(method: string, payload: unknown): Promise<TelegramCallResult<T>> {
    if (!this.token) {
      return {
        ok: false,
        error: {
          kind: "config",
          method,
          message: "BOT_TOKEN is missing"
        }
      };
    }

    let last: TelegramCallResult<T> | undefined;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      const result = await this.callOnce<T>(method, payload);
      if (result.ok) return result;

      last = result;
      if (!isRetryable(result.error) || attempt >= this.maxRetries) break;

      const delayMs = retryDelayMs(result.error, attempt);
      this.logger.warn("Telegram request will be retried", {
        method,
        attempt,
        delayMs,
        error: result.error
      });
      await sleep(delayMs);
    }

    return last ?? {
      ok: false,
      error: {
        kind: "network",
        method,
        message: "Telegram request failed before execution"
      }
    };
  }

  private async callOnce<T>(method: string, payload: unknown): Promise<TelegramCallResult<T>> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort("timeout"), this.timeoutMs);

    let response: Response;
    try {
      response = await fetch(`https://api.telegram.org/bot${this.token}/${method}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
    } catch (error) {
      clearTimeout(timer);
      return {
        ok: false,
        error: {
          kind: "network",
          method,
          message: error instanceof Error ? error.message : String(error),
          raw: error
        }
      };
    } finally {
      clearTimeout(timer);
    }

    let raw: unknown;
    try {
      raw = await response.json();
    } catch (error) {
      return {
        ok: false,
        status: response.status,
        error: {
          kind: "json",
          method,
          status: response.status,
          message: `Telegram returned non-JSON response with HTTP ${response.status}`,
          raw: error
        }
      };
    }

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: {
          kind: "http",
          method,
          status: response.status,
          message: readTelegramDescription(raw) ?? `Telegram returned HTTP ${response.status}`,
          errorCode: readTelegramErrorCode(raw),
          retryAfter: readTelegramRetryAfter(raw),
          raw
        }
      };
    }

    const data = raw as TelegramApiResponse<T>;
    if (!data.ok) {
      return {
        ok: false,
        status: response.status,
        error: {
          kind: "telegram",
          method,
          status: response.status,
          message: data.description ?? "Telegram API returned ok=false",
          errorCode: data.error_code,
          retryAfter: data.parameters?.retry_after,
          raw: data
        }
      };
    }

    return {
      ok: true,
      status: response.status,
      result: data.result
    };
  }
}

export function describeTelegramFailure(error: TelegramFailure): string {
  const prefix = error.errorCode ? `Telegram ${error.errorCode}` : `Telegram ${error.kind}`;
  return `${prefix}: ${error.message}`;
}

function readTelegramDescription(raw: unknown): string | undefined {
  if (typeof raw === "object" && raw && "description" in raw) {
    const value = (raw as { description?: unknown }).description;
    return typeof value === "string" ? value : undefined;
  }
  return undefined;
}

function readTelegramErrorCode(raw: unknown): number | undefined {
  if (typeof raw === "object" && raw && "error_code" in raw) {
    const value = (raw as { error_code?: unknown }).error_code;
    return typeof value === "number" ? value : undefined;
  }
  return undefined;
}

function readTelegramRetryAfter(raw: unknown): number | undefined {
  if (typeof raw === "object" && raw && "parameters" in raw) {
    const params = (raw as { parameters?: { retry_after?: unknown } }).parameters;
    return typeof params?.retry_after === "number" ? params.retry_after : undefined;
  }
  return undefined;
}

function isRetryable(error: TelegramFailure): boolean {
  if (error.kind === "network" || error.kind === "json") return true;
  if (error.kind === "http" && error.status && error.status >= 500) return true;
  if (error.errorCode === 429) return true;
  return false;
}

function retryDelayMs(error: TelegramFailure, attempt: number): number {
  if (typeof error.retryAfter === "number" && error.retryAfter > 0) {
    return Math.min(error.retryAfter * 1000, 5000);
  }
  return Math.min(250 * 2 ** attempt + Math.floor(Math.random() * 100), 2000);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
