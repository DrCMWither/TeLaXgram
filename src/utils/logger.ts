import { errorToLogObject } from "./errors";

export interface Logger {
  debug(message: string, data?: unknown): void;
  info(message: string, data?: unknown): void;
  warn(message: string, data?: unknown): void;
  error(message: string, error?: unknown, data?: unknown): void;
}

export class ConsoleLogger implements Logger {
  constructor(private readonly requestId: string) {}

  debug(message: string, data?: unknown): void {
    console.log(JSON.stringify({ level: "debug", requestId: this.requestId, message, data }));
  }

  info(message: string, data?: unknown): void {
    console.log(JSON.stringify({ level: "info", requestId: this.requestId, message, data }));
  }

  warn(message: string, data?: unknown): void {
    console.warn(JSON.stringify({ level: "warn", requestId: this.requestId, message, data }));
  }

  error(message: string, error?: unknown, data?: unknown): void {
    console.error(JSON.stringify({
      level: "error",
      requestId: this.requestId,
      message,
      error: errorToLogObject(error),
      data
    }));
  }
}

export function makeRequestId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
