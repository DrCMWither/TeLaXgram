import { handleRequest } from "./app";
import type { Env } from "./config/env";

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return handleRequest(request, env, ctx);
  }
} satisfies ExportedHandler<Env>;
