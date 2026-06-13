import type { RichSource } from "./types";
import { escapeHtml, htmlCode, htmlInline, htmlPre } from "./escape";

export type NoticeKind = "success" | "warning" | "error" | "info";

export interface NoticeFact {
  label: string;
  value: string | number;
  code?: boolean;
}

export interface RichNotice {
  kind: NoticeKind;
  title: string;
  description?: string;
  paragraphs?: string[];
  facts?: NoticeFact[];
  detailsTitle?: string;
  details?: string;
}

const NOTICE_ICONS: Record<NoticeKind, string> = {
  success: "✅",
  warning: "⚠️",
  error: "❌",
  info: "ℹ️",
};

export function noticeRichSource(notice: RichNotice): RichSource {
  const icon = NOTICE_ICONS[notice.kind];
  const lines: string[] = [];

  lines.push(`<h4>${escapeHtml(icon)} ${escapeHtml(notice.title)}</h4>`);

  for (const paragraph of notice.paragraphs ?? []) {
    lines.push(`<p>${htmlInline(paragraph)}</p>`);
  }

  if (notice.facts?.length) {
    lines.push("<table bordered>");

    for (const fact of notice.facts) {
      const value = fact.code ? htmlCode(fact.value) : htmlInline(fact.value);

      lines.push(
        `<tr><th>${escapeHtml(fact.label)}</th><td>${value}</td></tr>`,
      );
    }

    lines.push("</table>");
  }

  if (notice.details !== undefined) {
    lines.push("<details>");
    lines.push(
      `<summary>${escapeHtml(notice.detailsTitle ?? "Details")}</summary>`,
    );
    lines.push(htmlPre(notice.details));
    lines.push("</details>");
  }

  return {
    mode: "html",
    title: `${icon} ${notice.title}`,
    description: notice.description ?? notice.paragraphs?.[0] ?? notice.title,
    content: lines.join("\n"),
  };
}

export function noticePlainText(notice: RichNotice): string {
  const icon = NOTICE_ICONS[notice.kind];
  const lines = [`${icon} ${notice.title}`];

  for (const paragraph of notice.paragraphs ?? []) {
    lines.push("", paragraph);
  }

  if (notice.facts?.length) {
    lines.push("");

    for (const fact of notice.facts) {
      lines.push(`${fact.label}: ${fact.value}`);
    }
  }

  if (notice.details !== undefined) {
    lines.push("", notice.detailsTitle ?? "Details", notice.details);
  }

  return lines.join("\n");
}