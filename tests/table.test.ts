import { describe, expect, it } from "vitest";
import { compactTableToMarkdown } from "../src/rich/table";

describe("rich/table", () => {
  it("returns a default table for empty input", () => {
    expect(compactTableToMarkdown("")).toBe(
      "| A | B |\n|---|---|\n| $x$ | 1 |",
    );
  });

  it("converts semicolon-separated pipe rows into a markdown table", () => {
    expect(compactTableToMarkdown("A|B; x|1; y|2")).toBe(
      [
        "| A | B |",
        "| --- | --- |",
        "| x | 1 |",
        "| y | 2 |",
      ].join("\n"),
    );
  });

  it("supports newline-separated rows", () => {
    expect(compactTableToMarkdown("A|B\nx|1\ny|2")).toBe(
      [
        "| A | B |",
        "| --- | --- |",
        "| x | 1 |",
        "| y | 2 |",
      ].join("\n"),
    );
  });

  it("supports comma-separated rows when no pipe or tab is present", () => {
    expect(compactTableToMarkdown("A,B; x,1")).toBe(
      [
        "| A | B |",
        "| --- | --- |",
        "| x | 1 |",
      ].join("\n"),
    );
  });

  it("supports tab-separated rows when no pipe is present", () => {
    expect(compactTableToMarkdown("A\tB\nx\t1")).toBe(
      [
        "| A | B |",
        "| --- | --- |",
        "| x | 1 |",
      ].join("\n"),
    );
  });

  it("trims leading and trailing table pipes", () => {
    expect(compactTableToMarkdown("| A | B |\n| x | 1 |")).toBe(
      [
        "| A | B |",
        "| --- | --- |",
        "| x | 1 |",
      ].join("\n"),
    );
  });

  it("normalizes ragged rows by padding missing cells", () => {
    expect(compactTableToMarkdown("A|B|C; x|1; y")).toBe(
      [
        "| A | B | C |",
        "| --- | --- | --- |",
        "| x | 1 |  |",
        "| y |  |  |",
      ].join("\n"),
    );
  });
});