import type { InputRichMessage } from "../telegram/types";
import { limitChars } from "../utils/text";
import { RICH_CHAR_LIMIT } from "./limits";
import type { RichSource } from "./types";

export function inputRichMessage(src: RichSource): InputRichMessage {
  const content = limitChars(src.content, RICH_CHAR_LIMIT);
  const base: InputRichMessage = {};

  if (src.mode === "html") {
    base.html = content;
  } else {
    base.markdown = content;
  }

  if (src.isRtl !== undefined) base.is_rtl = src.isRtl;
  if (src.skipEntityDetection !== undefined) base.skip_entity_detection = src.skipEntityDetection;

  return base;
}
