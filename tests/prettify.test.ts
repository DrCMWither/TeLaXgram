import { describe, expect, it } from "vitest";
import { noticePlainText, noticeRichSource } from "../src/rich/notice";

describe("rich notice", () => {
  it("escapes HTML in facts", () => {
    const src = noticeRichSource({
      kind: "success",
      title: "Saved",
      facts: [
        {
          label: "Inline",
          value: "@bot ref:<bad>&\"",
          code: true,
        },
      ],
    });

    expect(src.mode).toBe("html");
    expect(src.content).toContain("ref:&lt;bad&gt;&amp;&quot;");
    expect(src.content).not.toContain("ref:<bad>");
  });

  it("has plain fallback", () => {
    const text = noticePlainText({
      kind: "success",
      title: "Saved",
      facts: [
        {
          label: "Ref",
          value: "ref:abc",
          code: true,
        },
      ],
    });

    expect(text).toContain("✅ Saved");
    expect(text).toContain("Ref: ref:abc");
  });
});