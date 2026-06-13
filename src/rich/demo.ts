import { DEFAULT_LOCALE, type Locale } from "../i18n";
import { botMention } from "../utils/botUsername";

export function demoMarkdown(locale: Locale = DEFAULT_LOCALE): string {
  if (locale === "en") {
    return String.raw`# TeLaXgram demo

Inline formula: $x^2 + y^2 = z^2$

| Metric | Value |
|:--|--:|
| Time | **42** <sup>s</sup> |
| Status | ==OK== |
| Formula | $E = mc^2$ |

$$
\int_{-\infty}^{+\infty} e^{-x^2}\,dx = \sqrt{\pi}
$$
`;
  }

  if (locale === "ja") {
    return String.raw`# TeLaXgram サンプル

インライン数式: $x^2 + y^2 = z^2$

| 項目 | 値 |
|:--|--:|
| 時間 | **42** <sup>s</sup> |
| 状態 | ==OK== |
| 数式 | $E = mc^2$ |

$$
\int_{-\infty}^{+\infty} e^{-x^2}\,dx = \sqrt{\pi}
$$
`;
  }

  return String.raw`# TeLaXgram 示例

Inline formula: $x^2 + y^2 = z^2$

| Metric | Value |
|:--|--:|
| Time | **42** <sup>s</sup> |
| Status | ==OK== |
| Formula | $E = mc^2$ |

$$
\int_{-\infty}^{+\infty} e^{-x^2}\,dx = \sqrt{\pi}
$$
`;
}

export const DEMO_MD = demoMarkdown(DEFAULT_LOCALE);

export function helpMarkdown(botUsername?: string, locale: Locale = DEFAULT_LOCALE): string {
  const bot = botMention(botUsername);
  const bt = "`";
  const cb = "```";

  if (locale === "en") {
    return String.raw`# TeLaXgram

Telegram inline rich text / table / LaTeX renderer.

## Inline

### Rich Markdown

${bt}${bot} md: # Title\NInline formula: $E=mc^2$${bt}


### Table

${bt}${bot} table: Key|Value; Time|**42** <sup>ms</sup>; Status|==OK==; Formula|$E=mc^2$${bt}

### Block formula

${bt}${bot} math: \int_0^1 x^2 dx = \frac{1}{3}${bt}

### Rich HTML

${bt}${bot} html: <table bordered striped><tr><th>A</th><th>B</th></tr><tr><td>$x$</td><td>1</td></tr></table><tg-math-block>E=mc^2</tg-math-block>${bt}

## Long text drafts

Send a private message to the bot:

${cb}markdown
/save md:
# Title

| A | B |
|---|---|
| $x$ | 1 |

$$
E = mc^2
$$
${cb}

Then use:

${bt}${bot} ref:<key>${bt}

## Direct private rendering

${cb}markdown
/render md:
# Title

| A | B |
|---|---|
| $x$ | 1 |
${cb}
`;
  }

  if (locale === "ja") {
    return String.raw`# TeLaXgram

Telegram inline のリッチテキスト / 表 / LaTeX レンダラー。

## Inline

### Rich Markdown

${bt}${bot} md: # タイトル\Nインライン数式: $E=mc^2$${bt}


### 表

${bt}${bot} table: 項目|値; Time|**42** <sup>ms</sup>; Status|==OK==; Formula|$E=mc^2$${bt}

### ブロック数式

${bt}${bot} math: \int_0^1 x^2 dx = \frac{1}{3}${bt}

### Rich HTML

${bt}${bot} html: <table bordered striped><tr><th>A</th><th>B</th></tr><tr><td>$x$</td><td>1</td></tr></table><tg-math-block>E=mc^2</tg-math-block>${bt}

## 長文の下書き

Bot にプライベートメッセージを送信：

${cb}markdown
/save md:
# タイトル

| A | B |
|---|---|
| $x$ | 1 |

$$
E = mc^2
$$
${cb}

保存後は以下を使用：

${bt}${bot} ref:<key>${bt}

## プライベートチャットで直接レンダリング

${cb}markdown
/render md:
# タイトル

| A | B |
|---|---|
| $x$ | 1 |
${cb}
`;
  }

  return String.raw`# TeLaXgram

Telegram inline 富文本 / 表格 / LaTeX 渲染器。

## Inline

###  富文本 MD

${bt}${bot} md: # 标题\NInline formula: $E=mc^2$${bt}


### 表格

${bt}${bot} table: 键|值; Time|**42** <sup>ms</sup>; Status|==OK==; Formula|$E=mc^2$${bt}

### 块公式

${bt}${bot} math: \int_0^1 x^2 dx = \frac{1}{3}${bt}

### Rich HTML

${bt}${bot} html: <table bordered striped><tr><th>A</th><th>B</th></tr><tr><td>$x$</td><td>1</td></tr></table><tg-math-block>E=mc^2</tg-math-block>${bt}

## 长文本草稿

私聊机器人：

${cb}markdown
/save md:
# 标题

| A | B |
|---|---|
| $x$ | 1 |

$$
E = mc^2
$$
${cb}

保存后使用

${bt}${bot} ref:<key>${bt}

## 私聊直接渲染

${cb}markdown
/render md:
# 标题

| A | B |
|---|---|
| $x$ | 1 |
${cb}
`;
}
