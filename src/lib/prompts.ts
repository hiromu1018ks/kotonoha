import type { ProofreadRequest } from "./validation/proofread";

const STYLE_INSTRUCTIONS = {
  business: "敬語を正しく保ち、簡潔で信頼感のある表現を重視してください。",
  casual: "親しみやすい口調で、読者との距離を縮める表現を意識してください。",
  academic: "論理性と正確性を最優先し、専門用語の使い方に注意してください。",
  report: "客観的で事実に基づく記述を心掛け、明確な結論を導いてください。",
} as const;

const LEVEL_INSTRUCTIONS = {
  basic: ["誤字脱字の修正", "文法エラーの修正"],
  standard: ["basic の内容", "より自然な日本語表現への改善"],
  advanced: [
    "standard の内容",
    "文章構造の最適化（意味が変わらない範囲で）",
    "敬語表現の粒度調整",
  ],
} as const;

export interface BuildPromptOptions extends ProofreadRequest {
  customPrompt?: string;
}

export function buildProofreadPrompt({
  text,
  style,
  level,
  customPrompt,
}: BuildPromptOptions): string {
  const styleInstruction =
    STYLE_INSTRUCTIONS[style] ?? STYLE_INSTRUCTIONS.business;
  const levelInstruction =
    LEVEL_INSTRUCTIONS[level] ?? LEVEL_INSTRUCTIONS.standard;

  const basePrompt = [
    "あなたは日本語の校正・校閲の専門家です。以下の文章を適切に校正してください。",
    "",
    `文体: ${style}`,
    styleInstruction,
    "",
    `校正レベル: ${level}`,
    ...levelInstruction.map((item) => `- ${item}`),
    "",
    "必ず以下の JSON 形式で回答してください:",
    "{",
    '  "correctedText": "校正後の文章",',
    '  "summary": "修正概要（1-2行）",',
    '  "details": "詳細な修正理由と改善ポイント"',
    "}",
  ];

  if (customPrompt?.trim()) {
    basePrompt.push("", "追加の指示（ユーザー指定）:", customPrompt.trim());
  }

  basePrompt.push("", "対象文章:", text);

  return basePrompt.join("\n");
}
