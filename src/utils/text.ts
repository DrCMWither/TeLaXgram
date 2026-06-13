export function limitChars(input: string, maxChars: number, suffix = "\n\n…[truncated]"): string {
  if (maxChars <= 0) return "";

  const chars = Array.from(input);
  if (chars.length <= maxChars) return input;

  const suffixChars = Array.from(suffix);
  if (suffixChars.length >= maxChars) {
    return suffixChars.slice(0, maxChars).join("");
  }

  return chars.slice(0, maxChars - suffixChars.length).join("") + suffix;
}

export function decodeInlineEscapes(input: string): string {
  return input
    .replace(/\\N/g, "\n")
    .replace(/⏎/g, "\n")
    // Avoid breaking LaTeX commands like \nabla, \neq, \nu.
    .replace(/\\n(?![A-Za-z])/g, "\n");
}

export function compactOneLine(input: string, maxChars = 120): string {
  const compact = input.replace(/\s+/g, " ").trim();
  return limitChars(compact, maxChars, "…");
}
