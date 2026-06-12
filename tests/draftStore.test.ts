import { describe, expect, it } from "vitest";
import { DOC_TTL_SECONDS } from "../src/rich/limits";
import type { RichSource } from "../src/rich/types";
import { DraftStore } from "../src/storage/draftStore";

class MemoryKv {
  readonly values = new Map<string, string>();
  lastExpirationTtl?: number;

  async put(
    key: string,
    value: string,
    options?: { expirationTtl?: number },
  ): Promise<void> {
    this.values.set(key, value);
    this.lastExpirationTtl = options?.expirationTtl;
  }

  async get(key: string, type?: "json"): Promise<unknown | string | null> {
    const value = this.values.get(key);
    if (value === undefined) return null;

    if (type === "json") {
      return JSON.parse(value) as unknown;
    }

    return value;
  }
}

const markdownSource: RichSource = {
  mode: "markdown",
  content: "# Title",
  title: "Title",
  description: "Description",
};

describe("storage/DraftStore", () => {
  it("reports unavailable when KV is not bound", () => {
    const store = new DraftStore();

    expect(store.available).toBe(false);
  });

  it("returns a CONFIG error when saving without KV", async () => {
    const store = new DraftStore();

    const result = await store.put(1, markdownSource, "en");

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected put to fail");

    expect(result.error.code).toBe("CONFIG");
    expect(result.error.safeMessage).toBe(
      "DOCS KV is not bound, so long text drafts cannot be saved.",
    );
  });

  it("stores a draft and returns a ref query", async () => {
    const kv = new MemoryKv();
    const store = new DraftStore(kv as unknown as KVNamespace);

    const result = await store.put(42, markdownSource, "en");

    expect(result.ok).toBe(true);
    if (!result.ok) throw result.error;

    expect(result.value.key).toHaveLength(22);
    expect(result.value.query).toBe(`ref:${result.value.key}`);
    expect(kv.lastExpirationTtl).toBe(DOC_TTL_SECONDS);
    expect(kv.values.has(result.value.key)).toBe(true);
  });

  it("loads an owned draft", async () => {
    const kv = new MemoryKv();
    const store = new DraftStore(kv as unknown as KVNamespace);

    const saved = await store.put(42, markdownSource, "en");
    if (!saved.ok) throw saved.error;

    const loaded = await store.get(saved.value.key, 42, "en");

    expect(loaded.ok).toBe(true);
    if (!loaded.ok) throw loaded.error;

    expect(loaded.value.mode).toBe("markdown");
    expect(loaded.value.content).toBe("# Title");
    expect(loaded.value.title).toBe(`Draft ref:${saved.value.key}`);
    expect(loaded.value.description).toBe("Render as Rich Markdown");
  });

  it("rejects drafts owned by another user", async () => {
    const kv = new MemoryKv();
    const store = new DraftStore(kv as unknown as KVNamespace);

    const saved = await store.put(42, markdownSource, "en");
    if (!saved.ok) throw saved.error;

    const denied = await store.get(saved.value.key, 7, "en");

    expect(denied.ok).toBe(false);
    if (denied.ok) throw new Error("expected get to fail");

    expect(denied.error.code).toBe("UNAUTHORIZED");
    expect(denied.error.safeMessage).toBe(
      "This draft does not belong to the current user.",
    );
  });

  it("returns NOT_FOUND for missing drafts", async () => {
    const kv = new MemoryKv();
    const store = new DraftStore(kv as unknown as KVNamespace);

    const missing = await store.get("missing", 42, "en");

    expect(missing.ok).toBe(false);
    if (missing.ok) throw new Error("expected get to fail");

    expect(missing.error.code).toBe("NOT_FOUND");
    expect(missing.error.safeMessage).toBe(
      "The draft does not exist or has expired.",
    );
  });
});