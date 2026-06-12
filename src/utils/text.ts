export function limitChars(input: string, maxChars: number, suffix = "\n\n…[truncated]"): string {
  const chars = Array.from(input);
  if (chars.length <= maxChars) return input;

  const suffixLen = Array.from(suffix).length;
  return chars.slice(0, Math.max(0, maxChars - suffixLen)).join("") + suffix;
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
