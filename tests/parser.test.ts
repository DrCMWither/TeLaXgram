import { describe, expect, it } from "vitest";
import { sourceFromText } from "../src/rich/parser";

describe("rich/parser", () => {
    it("parses html prefix", () => {
        const source = sourceFromText("html: <b>Hello</b>", "en");

        expect(source.mode).toBe("html");
        expect(source.content).toBe("<b>Hello</b>");
        expect(source.title).toBe("Render as Rich HTML");
    });

    it("parses rich-html alias case-insensitively", () => {
        const source = sourceFromText("RICH-HTML: <i>Hello</i>", "en");

        expect(source.mode).toBe("html");
        expect(source.content).toBe("<i>Hello</i>");
    });

    it("parses markdown prefixes", () => {
        const source = sourceFromText(String.raw`md: # Title\NBody`, "en");

        expect(source.mode).toBe("markdown");
        expect(source.content).toBe("# Title\nBody");
        expect(source.title).toBe("Render as Rich Markdown");
    });

    it("parses table prefix into markdown table", () => {
        const source = sourceFromText("table: A|B; x|1", "en");

        expect(source.mode).toBe("markdown");
        expect(source.content).toBe(
            [
                "| A | B |",
                "| --- | --- |",
                "| x | 1 |",
            ].join("\n"),
        );
    });

    it("parses block math prefixes", () => {
        const source = sourceFromText(String.raw`math: \int_0^1 x^2 dx`, "en");

        expect(source.mode).toBe("markdown");
        expect(source.content).toBe(
            ["$$", String.raw`\int_0^1 x^2 dx`, "$$"].join("\n"),
        );
    });

    it("parses inline math prefixes", () => {
        const source = sourceFromText("imath: E=mc^2", "en");

        expect(source.mode).toBe("markdown");
        expect(source.content).toBe("$E=mc^2$");
    });

    it("uses markdown mode by default", () => {
        const source = sourceFromText("plain **markdown**", "en");

        expect(source.mode).toBe("markdown");
        expect(source.content).toBe("plain **markdown**");
        expect(source.title).toBe("Render as Rich Markdown");
    });

    it("trims decoded input", () => {
        const source = sourceFromText(String.raw`  md: hello\N  `, "en");

        expect(source.mode).toBe("markdown");
        expect(source.content).toBe("hello");
    });
});