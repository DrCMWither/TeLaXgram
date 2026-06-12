import { describe, expect, it } from "vitest";
import { makeDocKey, shortHash } from "../src/utils/hash";

describe("utils/hash", () => {
  it("creates deterministic short hashes for the same input", async () => {
    const a = await shortHash("hello", 16);
    const b = await shortHash("hello", 16);

    expect(a).toBe(b);
    expect(a).toHaveLength(16);
  });

  it("uses URL-safe base64 characters", async () => {
    const value = await shortHash("hello", 32);

    expect(value).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(value).not.toContain("+");
    expect(value).not.toContain("/");
    expect(value).not.toContain("=");
  });

  it("respects requested output length", async () => {
    expect(await shortHash("hello", 8)).toHaveLength(8);
    expect(await shortHash("hello", 22)).toHaveLength(22);
  });

  it("creates document keys with the expected length and alphabet", async () => {
    const key = await makeDocKey(123, "# Title");

    expect(key).toHaveLength(22);
    expect(key).toMatch(/^[A-Za-z0-9_-]+$/);
  });
});