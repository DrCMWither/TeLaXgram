export interface TelegramApiSuccess<T> {
  ok: true;
  result: T;
}

export interface TelegramApiFailure {
  ok: false;
  error_code?: number;
  description?: string;
  parameters?: {
    retry_after?: number;
    migrate_to_chat_id?: number;
  };
}

export type TelegramApiResponse<T> = TelegramApiSuccess<T> | TelegramApiFailure;

export interface User {
  id: number;
  is_bot?: boolean;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export interface Chat {
  id: number | string;
  type: "private" | "group" | "supergroup" | "channel" | string;
  title?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
}

export interface Message {
  message_id: number;
  from?: User;
  chat: Chat;
  date?: number;
  text?: string;
}

export interface InlineQuery {
  id: string;
  from: User;
  query: string;
  offset: string;
  chat_type?: string;
}

export interface Update {
  update_id: number;
  message?: Message;
  inline_query?: InlineQuery;
}

export interface InputRichMessage {
  html?: string;
  markdown?: string;
  is_rtl?: boolean;
  skip_entity_detection?: boolean;
}

export interface InputRichMessageContent {
  rich_message: InputRichMessage;
}

export interface InputTextMessageContent {
  message_text: string;
  parse_mode?: string;
  link_preview_options?: {
    is_disabled?: boolean;
  };
}

export interface InlineKeyboardButton {
  text: string;
  url?: string;
  callback_data?: string;
  switch_inline_query?: string;
  switch_inline_query_current_chat?: string;
}

export interface InlineKeyboardMarkup {
  inline_keyboard: InlineKeyboardButton[][];
}

export interface InlineQueryResultsButton {
  text: string;
  start_parameter?: string;
  web_app?: { url: string };
}

export interface InlineQueryResultArticle {
  type: "article";
  id: string;
  title: string;
  description?: string;
  input_message_content: InputRichMessageContent | InputTextMessageContent;
  reply_markup?: InlineKeyboardMarkup;
}

export interface AnswerInlineQueryParams {
  inline_query_id: string;
  results: InlineQueryResultArticle[];
  cache_time?: number;
  is_personal?: boolean;
  next_offset?: string;
  button?: InlineQueryResultsButton;
}

export interface SendMessageParams {
  chat_id: number | string;
  text: string;
  reply_markup?: InlineKeyboardMarkup;
  link_preview_options?: {
    is_disabled?: boolean;
  };
}

export interface SendRichMessageParams {
  chat_id: number | string;
  rich_message: InputRichMessage;
  reply_markup?: InlineKeyboardMarkup;
}

export interface SentMessage {
  message_id: number;
  chat: Chat;
  date?: number;
  text?: string;
}
