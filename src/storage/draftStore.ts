import { DEFAULT_LOCALE, t, type Locale } from "../i18n";
import { AppError } from "../utils/errors";
import { makeDocKey } from "../utils/hash";
import { err, ok, type Result } from "../utils/result";
import { limitChars } from "../utils/text";
import { DOC_TTL_SECONDS, RICH_CHAR_LIMIT } from "../rich/limits";
import type { RichMode, RichSource } from "../rich/types";

export interface StoredDoc {
  user_id: number;
  mode: RichMode;
  content: string;
  created_at: number;
}

export interface SavedDraft {
  key: string;
  query: string;
}

export class DraftStore {
  constructor(private readonly kv?: KVNamespace) { }

  get available(): boolean {
    return Boolean(this.kv);
  }

  async put(
    userId: number,
    source: RichSource,
    locale: Locale = DEFAULT_LOCALE
  ): Promise<Result<SavedDraft, AppError>> {
    if (!this.kv) {
      return err(new AppError({
        code: "CONFIG",
        message: "DOCS KV binding is missing",
        safeMessage: t(locale, "draft.kvMissingSave")
      }));
    }

    const content = limitChars(source.content, RICH_CHAR_LIMIT);
    const key = await makeDocKey(userId, content);

    const doc: StoredDoc = {
      user_id: userId,
      mode: source.mode,
      content,
      created_at: Date.now()
    };

    try {
      await this.kv.put(key, JSON.stringify(doc), { expirationTtl: DOC_TTL_SECONDS });
    } catch (error) {
      return err(new AppError({
        code: "STORAGE",
        message: "Failed to write draft to KV",
        safeMessage: t(locale, "draft.saveFailed"),
        cause: error
      }));
    }

    return ok({ key, query: `ref:${key}` });
  }

  async get(
    key: string,
    userId?: number,
    locale: Locale = DEFAULT_LOCALE
  ): Promise<Result<RichSource, AppError>> {
    if (!this.kv) {
      return err(new AppError({
        code: "CONFIG",
        message: "DOCS KV binding is missing",
        safeMessage: t(locale, "draft.kvMissingRead")
      }));
    }

    let doc: StoredDoc | null;
    try {
      doc = await this.kv.get<StoredDoc>(key, "json");
    } catch (error) {
      return err(new AppError({
        code: "STORAGE",
        message: "Failed to read draft from KV",
        safeMessage: t(locale, "draft.readFailed"),
        cause: error
      }));
    }

    if (!doc) {
      return err(new AppError({
        code: "NOT_FOUND",
        message: `Draft ${key} was not found`,
        safeMessage: t(locale, "draft.notFound")
      }));
    }

    if (userId !== undefined && doc.user_id !== userId) {
      return err(new AppError({
        code: "UNAUTHORIZED",
        message: `Draft ${key} is owned by another user`,
        safeMessage: t(locale, "draft.unauthorized")
      }));
    }

    return ok({
      mode: doc.mode,
      content: doc.content,
      title: t(locale, "draft.loadedTitle", { key }),
      description: doc.mode === "html"
        ? t(locale, "draft.loadedHtmlDescription")
        : t(locale, "draft.loadedMarkdownDescription")
    });
  }
}
