export type RichMode = "markdown" | "html";

export interface RichSource {
  mode: RichMode;
  content: string;
  title: string;
  description: string;
  skipEntityDetection?: boolean;
  isRtl?: boolean;
}

export interface RichSourceError {
  error: string;
  description?: string;
}

export function isRichSourceError(value: RichSource | RichSourceError): value is RichSourceError {
  return "error" in value;
}
