import { describe, expect, it } from "vitest";
import {
    compactOneLine,
    decodeInlineEscapes,
    limitChars,
} from "../src/utils/text";

describe("utils/text", () => {
    describe("decodeInlineEscapes", () => {
        it("decodes supported inline newline escapes", () => {
            expect(decodeInlineEscapes(String.raw`a\Nb⏎c\n-d`)).toBe(
                "a\nb\nc\n-d",
            );
        });

        it("does not break common LaTeX commands beginning with \\n", () => {
            const input = String.raw`\nabla + \neq + \nu`;
            expect(decodeInlineEscapes(input)).toBe(input);
        });

        it("decodes \\n only when it is not followed by a letter", () => {
            expect(decodeInlineEscapes(String.raw`a\n-b`)).toBe("a\n-b");
            expect(decodeInlineEscapes(String.raw`\name`)).toBe(String.raw`\name`);
        });
    });

    describe("limitChars", () => {
        it("keeps short strings unchanged", () => {
            expect(limitChars("abc", 10)).toBe("abc");
        });

        it("truncates and appends suffix within the limit", () => {
            expect(limitChars("abcdef", 4, "…")).toBe("abc…");
        });

        it("counts unicode code points instead of UTF-16 units", () => {
            expect(limitChars("😀😃😄", 2, "…")).toBe("😀…");
        });

        it("returns only suffix when maxChars is smaller than suffix length", () => {
            expect(limitChars("abcdef", 1, "...")).toBe("...");
        });
    });

    describe("compactOneLine", () => {
        it("collapses whitespace into one line", () => {
            expect(compactOneLine("  a\n b\t c  ", 120)).toBe("a b c");
        });

        it("truncates compacted text", () => {
            expect(compactOneLine("abcdef", 4)).toBe("abc…");
        });
    });
});