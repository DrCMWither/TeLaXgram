export function escapeHtml(input: unknown): string {
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function htmlInline(input: unknown): string {
  return escapeHtml(input).replace(/\n/g, "<br>");
}

export function htmlCode(input: unknown): string {
  return `<code>${escapeHtml(input)}</code>`;
}

export function htmlPre(input: unknown): string {
  return `<pre><code>${escapeHtml(input)}</code></pre>`;
}