const zh = {
  "app.missingEnvSafe": "Worker 缺少必要环境变量。",

  "command.help.title": "TeLaXgram 帮助",
  "command.help.description": "Rich inline bot help",
  "command.demo.title": "TeLaXgram 示例",
  "command.demo.description": "Table and LaTeX demo",
  "command.unknown": "未知命令。使用 /help 查看语法。",

  "save.noSender": "无法识别发送者，不能保存草稿。",
  "save.usage": "用法：\n\n/save md:\n# 标题\n\n| A | B |\n|---|---|\n| $x$ | 1 |",
  "save.saved": "已保存为富文本草稿。",
  "save.inlineUsage": "inline 用法：{bot} {query}",
  "save.expires": "草稿将在 {days} 天后过期。",
  "save.insertButton": "插入这段富文本",

  "inline.syntaxButton": "TeLaXgram 语法说明",
  "inline.empty.title": "示例：表格 + LaTeX",
  "inline.empty.description": "发送 TeLaXgram 富文本消息示例",
  "inline.refBadFormat": "ref 格式错误",
  "inline.refBadFormatDescription": "应使用 ref:<key>",
  "inline.renderErrorTitle": "无法渲染",
  "inline.renderErrorText": "无法渲染：{reason}",
  "inline.fallbackTitle": "富文本解析失败",
  "inline.fallbackDescription": "{reason}",
  "inline.fallbackText": "富文本解析失败：{reason}",
  "inline.sourceLabel": "源码：",
  "inline.plainTitle": "仅发送源码",
  "inline.plainDescription": "不解析富文本",

  "parser.html.title": "渲染为富文本 HTML",
  "parser.html.description": "支持 <table>、<tg-math-block> 等 Telegram Rich HTML",
  "parser.markdown.title": "渲染为富文本 Markdown",
  "parser.markdown.description": "支持表格、标题、列表、LaTeX 公式",
  "parser.table.title": "快速表格",
  "parser.table.description": "table: A|B; x|1; y|2",
  "parser.mathBlock.title": "块 LaTeX 公式",
  "parser.mathBlock.description": "以 Telegram 富文本 Markdown 数学块渲染",
  "parser.inlineMath.title": "行 LaTeX 公式",
  "parser.inlineMath.description": "以 Telegram 富文本 Markdown 行公式渲染",
  "parser.default.title": "渲染为富文本 Markdown",
  "parser.default.description": "默认解析为 Telegram 富文本 Markdown",

  "rich.failure": "富文本渲染失败：{reason}",
  "rich.sourceLabel": "源码：",

  "draft.kvMissingSave": "未绑定 DOCS KV，无法保存长文本草稿。",
  "draft.kvMissingRead": "未绑定 DOCS KV，无法读取长文本草稿。",
  "draft.saveFailed": "保存草稿失败，请稍后重试。",
  "draft.readFailed": "读取草稿失败，请稍后重试。",
  "draft.notFound": "草稿不存在或已经过期。",
  "draft.unauthorized": "这份草稿不属于当前用户。",
  "draft.loadedTitle": "草稿 ref:{key}",
  "draft.loadedHtmlDescription": "以 Rich HTML 渲染",
  "draft.loadedMarkdownDescription": "以 Rich Markdown 渲染",

  "start.nav.prev": "‹ 上一页",
  "start.nav.next": "下一页 ›",
  "start.button.tryInline": "在当前聊天试用 inline",
  "start.button.demo": "插入示例 query",
  "start.error.badPage": "页码无效。",
  "start.error.messageGone": "这条消息已经无法更新。",
  "start.pageCounter": "第 {page} / {total} 页",
  "start.inlineDemoQuery": "table: Key|Value; Speed|**42** ^{ms}; Status|==ready==; Formula|$E=mc^2$",

  "start.page.intro.title": "TeLaXgram",
  "start.page.intro.body": "把 Telegram inline 输入转换成富文本、表格和 LaTeX。\n\n最常用方式：\n{bot} md: # 标题\\NInline formula: $E=mc^2$\n\n在任意聊天输入机器人名即可使用 inline mode。",

  "start.page.formats.title": "输入格式",
  "start.page.formats.body": "md: Rich Markdown\nhtml: Rich HTML\ntable: A|B; x|1\nmath: \\int_0^1 x^2 dx\nimath: E=mc^2\n\n不写前缀时默认按 Markdown 渲染。",

  "start.page.drafts.title": "长文本草稿",
  "start.page.drafts.body": "私聊机器人发送：\n\n/save md:\n# 标题\n| A | B |\n\n保存后会返回 ref:<key>。\n之后在 inline mode 用 {bot} ref:<key> 调用。",

  "start.page.commands.title": "常用命令",
  "start.page.commands.body": "/render <source>：在私聊中直接渲染。\n/save <source>：保存长文本草稿。\n/help：发送完整语法说明。\n\n下面的按钮可以直接打开 inline 输入。",

  "callback.unsupported": "暂不支持这个按钮。",
} as const;

export const SUPPORTED_LOCALES = ["zh-CN", "en", "ja"] as const;
export type Locale = typeof SUPPORTED_LOCALES[number];
export type I18nKey = keyof typeof zh;
export const DEFAULT_LOCALE: Locale = "zh-CN";

export const messages: Record<Locale, Record<I18nKey, string>> = {
  "zh-CN": zh,
  en: {
    "app.missingEnvSafe": "The Worker is missing required environment variables.",

    "command.help.title": "TeLaXgram Help",
    "command.help.description": "Rich inline bot help",
    "command.demo.title": "TeLaXgram Demo",
    "command.demo.description": "Table and LaTeX demo",
    "command.unknown": "Unknown command. Use /help to see the syntax.",

    "save.noSender": "Cannot identify the sender, so the draft cannot be saved.",
    "save.usage": "Usage:\n\n/save md:\n# Title\n\n| A | B |\n|---|---|\n| $x$ | 1 |",
    "save.saved": "Saved as a rich text draft.",
    "save.inlineUsage": "Inline usage: {bot} {query}",
    "save.expires": "The draft will expire in {days} days.",
    "save.insertButton": "Insert this rich text",

    "inline.syntaxButton": "TeLaXgram syntax",
    "inline.empty.title": "Example: table + LaTeX",
    "inline.empty.description": "Send a TeLaXgram rich text message example",
    "inline.refBadFormat": "Invalid ref format",
    "inline.refBadFormatDescription": "Use ref:<key>",
    "inline.renderErrorTitle": "Cannot render",
    "inline.renderErrorText": "Cannot render: {reason}",
    "inline.fallbackTitle": "Rich text parsing failed",
    "inline.fallbackDescription": "{reason}",
    "inline.fallbackText": "Rich text parsing failed: {reason}",
    "inline.sourceLabel": "Source:",
    "inline.plainTitle": "Send source only",
    "inline.plainDescription": "Do not parse rich text",

    "parser.html.title": "Render as Rich HTML",
    "parser.html.description": "Supports Telegram Rich HTML such as <table> and <tg-math-block>",
    "parser.markdown.title": "Render as Rich Markdown",
    "parser.markdown.description": "Supports tables, headings, lists, and LaTeX formulas",
    "parser.table.title": "Quick table",
    "parser.table.description": "table: A|B; x|1; y|2",
    "parser.mathBlock.title": "Block LaTeX formula",
    "parser.mathBlock.description": "Render as a Telegram Rich Markdown math block",
    "parser.inlineMath.title": "Inline LaTeX formula",
    "parser.inlineMath.description": "Render as Telegram Rich Markdown inline math",
    "parser.default.title": "Render as Rich Markdown",
    "parser.default.description": "Parsed as Telegram Rich Markdown by default",

    "rich.failure": "Rich text rendering failed: {reason}",
    "rich.sourceLabel": "Source:",

    "draft.kvMissingSave": "DOCS KV is not bound, so long text drafts cannot be saved.",
    "draft.kvMissingRead": "DOCS KV is not bound, so long text drafts cannot be read.",
    "draft.saveFailed": "Failed to save the draft. Please try again later.",
    "draft.readFailed": "Failed to read the draft. Please try again later.",
    "draft.notFound": "The draft does not exist or has expired.",
    "draft.unauthorized": "This draft does not belong to the current user.",
    "draft.loadedTitle": "Draft ref:{key}",
    "draft.loadedHtmlDescription": "Render as Rich HTML",
    "draft.loadedMarkdownDescription": "Render as Rich Markdown",

    "start.nav.prev": "‹ Prev",
    "start.nav.next": "Next ›",
    "start.button.tryInline": "Try inline here",
    "start.button.demo": "Insert demo query",
    "start.error.badPage": "Invalid page.",
    "start.error.messageGone": "This message can no longer be updated.",
    "start.pageCounter": "Page {page}/{total}",
    "start.inlineDemoQuery": "table: Key|Value; Speed|**42** ^{ms}; Status|==ready==; Formula|$E=mc^2$",

    "start.page.intro.title": "TeLaXgram",
    "start.page.intro.body": "Turn Telegram inline input into rich text, tables, and LaTeX.\n\nMost common usage:\n{bot} md: # Title\\NInline formula: $E=mc^2$\n\nType the bot username in any chat to use inline mode.",

    "start.page.formats.title": "Input formats",
    "start.page.formats.body": "md: Rich Markdown\nhtml: Rich HTML\ntable: A|B; x|1\nmath: \\int_0^1 x^2 dx\nimath: E=mc^2\n\nWithout a prefix, input is parsed as Markdown.",

    "start.page.drafts.title": "Long drafts",
    "start.page.drafts.body": "Send this to the bot in private:\n\n/save md:\n# Title\n| A | B |\n\nAfter saving, the bot returns ref:<key>.\nThen use {bot} ref:<key> in inline mode.",

    "start.page.commands.title": "Commands",
    "start.page.commands.body": "/render <source>: render directly in private chat.\n/save <source>: save a long draft.\n/help: send the full syntax guide.\n\nUse the buttons below to open inline mode.",

    "callback.unsupported": "Unsupported button.",
  },
  ja: {
    "app.missingEnvSafe": "Worker に必要な環境変数がありません。",

    "command.help.title": "TeLaXgram ヘルプ",
    "command.help.description": "Rich inline bot help",
    "command.demo.title": "TeLaXgram サンプル",
    "command.demo.description": "Table and LaTeX demo",
    "command.unknown": "不明なコマンドです。/help で構文を確認してください。",

    "save.noSender": "送信者を識別できないため、下書きを保存できません。",
    "save.usage": "使い方：\n\n/save md:\n# タイトル\n\n| A | B |\n|---|---|\n| $x$ | 1 |",
    "save.saved": "リッチテキストの下書きとして保存しました。",
    "save.inlineUsage": "inline での使い方：{bot} {query}",
    "save.expires": "下書きは {days} 日後に期限切れになります。",
    "save.insertButton": "このリッチテキストを挿入",

    "inline.syntaxButton": "TeLaXgram 構文説明",
    "inline.empty.title": "例：表 + LaTeX",
    "inline.empty.description": "TeLaXgram のリッチテキストメッセージ例を送信",
    "inline.refBadFormat": "ref の形式が正しくありません",
    "inline.refBadFormatDescription": "ref:<key> を使用してください",
    "inline.renderErrorTitle": "レンダリングできません",
    "inline.renderErrorText": "レンダリングできません：{reason}",
    "inline.fallbackTitle": "リッチテキストの解析に失敗しました",
    "inline.fallbackDescription": "{reason}",
    "inline.fallbackText": "リッチテキストの解析に失敗しました：{reason}",
    "inline.sourceLabel": "ソース：",
    "inline.plainTitle": "ソースだけを送信",
    "inline.plainDescription": "リッチテキストとして解析しない",

    "parser.html.title": "Rich HTML としてレンダリング",
    "parser.html.description": "<table>、<tg-math-block> などの Telegram Rich HTML に対応",
    "parser.markdown.title": "Rich Markdown としてレンダリング",
    "parser.markdown.description": "表、見出し、リスト、LaTeX 数式に対応",
    "parser.table.title": "クイック表",
    "parser.table.description": "table: A|B; x|1; y|2",
    "parser.mathBlock.title": "ブロック LaTeX 数式",
    "parser.mathBlock.description": "Telegram Rich Markdown の数式ブロックとしてレンダリング",
    "parser.inlineMath.title": "インライン LaTeX 数式",
    "parser.inlineMath.description": "Telegram Rich Markdown のインライン数式としてレンダリング",
    "parser.default.title": "Rich Markdown としてレンダリング",
    "parser.default.description": "既定で Telegram Rich Markdown として解析",

    "rich.failure": "リッチテキストのレンダリングに失敗しました：{reason}",
    "rich.sourceLabel": "ソース：",

    "draft.kvMissingSave": "DOCS KV がバインドされていないため、長文の下書きを保存できません。",
    "draft.kvMissingRead": "DOCS KV がバインドされていないため、長文の下書きを読み取れません。",
    "draft.saveFailed": "下書きの保存に失敗しました。後でもう一度お試しください。",
    "draft.readFailed": "下書きの読み取りに失敗しました。後でもう一度お試しください。",
    "draft.notFound": "下書きが存在しないか、期限切れです。",
    "draft.unauthorized": "この下書きは現在のユーザーのものではありません。",
    "draft.loadedTitle": "下書き ref:{key}",
    "draft.loadedHtmlDescription": "Rich HTML としてレンダリング",
    "draft.loadedMarkdownDescription": "Rich Markdown としてレンダリング",

    "start.nav.prev": "‹ 前へ",
    "start.nav.next": "次へ ›",
    "start.button.tryInline": "このチャットで inline を試す",
    "start.button.demo": "サンプル query を挿入",
    "start.error.badPage": "ページ番号が正しくありません。",
    "start.error.messageGone": "このメッセージは更新できません。",
    "start.pageCounter": "{page}/{total} ページ",
    "start.inlineDemoQuery": "table: Key|Value; Speed|**42** ^{ms}; Status|==ready==; Formula|$E=mc^2$",

    "start.page.intro.title": "TeLaXgram",
    "start.page.intro.body": "Telegram inline 入力をリッチテキスト、表、LaTeX に変換します。\n\n基本的な使い方：\n{bot} md: # タイトル\\Nインライン数式: $E=mc^2$\n\n任意のチャットで Bot 名を入力すると inline mode を使えます。",

    "start.page.formats.title": "入力形式",
    "start.page.formats.body": "md: Rich Markdown\nhtml: Rich HTML\ntable: A|B; x|1\nmath: \\int_0^1 x^2 dx\nimath: E=mc^2\n\nprefix なしの場合は Markdown として解析します。",

    "start.page.drafts.title": "長文下書き",
    "start.page.drafts.body": "Bot との private chat に送信：\n\n/save md:\n# タイトル\n| A | B |\n\n保存後、ref:<key> が返されます。\nその後 inline mode で {bot} ref:<key> を使います。",

    "start.page.commands.title": "コマンド",
    "start.page.commands.body": "/render <source>: private chat で直接レンダリング。\n/save <source>: 長文下書きを保存。\n/help: 完全な構文説明を送信。\n\n下のボタンから inline mode を開けます。",

    "callback.unsupported": "未対応のボタンです。",
  }
};
