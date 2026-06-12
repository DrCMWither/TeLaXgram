import { TABLE_MAX_COLUMNS } from "./limits";

export function compactTableToMarkdown(rawBody: string): string {
  const body = rawBody.trim();

  if (!body) {
    return defaultTable();
  }

  const lines = body
    .split(/\r?\n|;/)
    .map((x) => x.trim())
    .filter(Boolean);

  if (lines.length === 0) return defaultTable();

  const rows = lines.map(splitTableRow);
  const maxCols = Math.min(
    TABLE_MAX_COLUMNS,
    Math.max(1, ...rows.map((row) => row.length))
  );

  const normalized = rows.map((row) => {
    const next = row.slice(0, maxCols);
    while (next.length < maxCols) next.push("");
    return next;
  });

  const first = normalized[0] ?? ["A", "B"];
  const header = first.map(escapeMarkdownTableCell);
  const separator = header.map(() => "---");

  const tableLines = [
    `| ${header.join(" | ")} |`,
    `| ${separator.join(" | ")} |`,
    ...normalized.slice(1).map((row) => `| ${row.map(escapeMarkdownTableCell).join(" | ")} |`)
  ];

  return tableLines.join("\n");
}

function splitTableRow(row: string): string[] {
  let parts: string[];

  if (row.includes("|")) {
    parts = row.split("|");
  } else if (row.includes("\t")) {
    parts = row.split("\t");
  } else {
    parts = row.split(",");
  }

  parts = parts.map((x) => x.trim());
  if (parts[0] === "") parts.shift();
  if (parts.length > 0 && parts[parts.length - 1] === "") parts.pop();

  return parts.length > 0 ? parts : [row.trim()];
}

function escapeMarkdownTableCell(cell: string): string {
  return cell.replace(/\|/g, "\\|").trim();
}

function defaultTable(): string {
  return "| A | B |\n|---|---|\n| $x$ | 1 |";
}
