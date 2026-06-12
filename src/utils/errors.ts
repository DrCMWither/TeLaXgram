export type AppErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "NOT_FOUND"
  | "CONFIG"
  | "STORAGE"
  | "TELEGRAM"
  | "NETWORK"
  | "INTERNAL";

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly status: number;
  readonly safeMessage: string;
  readonly details?: unknown;

  constructor(args: {
    code: AppErrorCode;
    message: string;
    safeMessage?: string;
    status?: number;
    details?: unknown;
    cause?: unknown;
  }) {
    super(args.message, { cause: args.cause });
    this.name = "AppError";
    this.code = args.code;
    this.status = args.status ?? defaultStatus(args.code);
    this.safeMessage = args.safeMessage ?? args.message;
    this.details = args.details;
  }
}

function defaultStatus(code: AppErrorCode): number {
  switch (code) {
    case "BAD_REQUEST": return 400;
    case "UNAUTHORIZED": return 403;
    case "NOT_FOUND": return 404;
    case "CONFIG": return 500;
    case "STORAGE": return 503;
    case "TELEGRAM": return 502;
    case "NETWORK": return 502;
    default: return 500;
  }
}

export function toAppError(error: unknown, fallback = "Internal error"): AppError {
  if (error instanceof AppError) return error;
  if (error instanceof Error) {
    return new AppError({
      code: "INTERNAL",
      message: error.message || fallback,
      safeMessage: fallback,
      cause: error
    });
  }
  return new AppError({
    code: "INTERNAL",
    message: String(error),
    safeMessage: fallback,
    details: error
  });
}

export function errorToLogObject(error: unknown): Record<string, unknown> {
  if (error instanceof AppError) {
    return {
      name: error.name,
      code: error.code,
      message: error.message,
      status: error.status,
      details: error.details
    };
  }

  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack
    };
  }

  return { value: String(error) };
}
