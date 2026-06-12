import { checkEnv, type Env } from "./config/env";
import { createAppContext } from "./context";
import { errorResponse, json, text } from "./http/responses";
import { localeFromTelegramLanguage, t } from "./i18n";
import { assertWebhookSecret, readJsonBody } from "./http/security";
import { dispatchUpdate } from "./handlers/updateRouter";
import type { Update } from "./telegram/types";
import { AppError } from "./utils/errors";
import { makeRequestId } from "./utils/logger";

export async function handleRequest(
  request: Request,
  env: Env,
  executionCtx: ExecutionContext
): Promise<Response> {
  const url = new URL(request.url);
  const requestId = makeRequestId();

  if (request.method === "GET" && url.pathname === "/") {
    const envCheck = checkEnv(env);
    return json({
      ok: envCheck.ok,
      name: "TeLaXgram",
      version: "0.1.0",
      webhook: "/webhook",
      default_locale: localeFromTelegramLanguage(undefined, env.DEFAULT_LOCALE),
      missing: envCheck.missing,
      warnings: envCheck.warnings
    }, envCheck.ok ? 200 : 500);
  }

  if (url.pathname !== "/webhook") {
    return text("Not Found", 404);
  }

  if (request.method !== "POST") {
    return text("Method Not Allowed", 405);
  }

  try {
    const envCheck = checkEnv(env);
    if (!envCheck.ok) {
      throw new AppError({
        code: "CONFIG",
        message: `Missing required env: ${envCheck.missing.join(", ")}`,
        safeMessage: t(localeFromTelegramLanguage(undefined, env.DEFAULT_LOCALE), "app.missingEnvSafe")
      });
    }

    assertWebhookSecret(request, env);
    const update = await readJsonBody<Update>(request);
    const ctx = createAppContext(env, requestId);

    executionCtx.waitUntil(
      dispatchUpdate(ctx, update).catch((error) => {
        ctx.logger.error("Unhandled update processing error", error, { update_id: update.update_id });
      })
    );

    return text("OK");
  } catch (error) {
    return errorResponse(error);
  }
}
