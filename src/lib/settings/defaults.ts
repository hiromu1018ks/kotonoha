export const DEFAULT_SETTINGS = {
  style: "business" as const,
  level: "standard" as const,
  customPrompt: "",
} as const;

export const STYLE_OPTIONS = [
  { value: "business", label: "ビジネス文書（デフォルト）" },
  { value: "casual", label: "カジュアル" },
  { value: "academic", label: "学術的" },
  { value: "report", label: "報告書" },
] as const;

export const LEVEL_OPTIONS = [
  { value: "basic", label: "基本（誤字脱字・文法）" },
  { value: "standard", label: "標準（表現改善含む）" },
  { value: "advanced", label: "高度（構造最適化含む）" },
] as const;

export const STORAGE_KEY = "textCorrectorSettings";

export type SettingsStyle = (typeof STYLE_OPTIONS)[number]["value"];
export type SettingsLevel = (typeof LEVEL_OPTIONS)[number]["value"];

export interface Settings {
  style: SettingsStyle;
  level: SettingsLevel;
  customPrompt: string;
}
