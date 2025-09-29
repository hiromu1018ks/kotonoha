import { FinishReason, type GenerateContentResponse } from "@google/genai";
import { sanitizeHtml } from "@/lib/sanitize.ts";
import {
  type ProofreadResponse,
  proofreadResponseSchema,
} from "@/lib/validation/proofread.ts";

const MAX_CORRECTED_TEXT_LENGTH = 10_000; // 校正後の文章を 1 万文字までに制限する
const MAX_SUMMARY_LENGTH = 400; // 概要は 400 文字までに制限する
const MAX_DETAILS_LENGTH = 4_000; // 詳細は 4000 文字までに制限する

export interface NormalizedProofreadResult extends ProofreadResponse {
  warnings: string[];
  rawText: string;
}

export function normalizeProofreadResponse(
  response: GenerateContentResponse
): NormalizedProofreadResult {
  const warnings: string[] = [];
  const rawText = extractCandidateText(response);

  if (!rawText) {
    throw new Error("Gemini レスポンスからテキストを取得できませんでした。");
  }

  const parsed = extractJsonPayload(rawText, warnings);
  const payload = parsed ?? buildFallbackPayload(rawText, warnings);
  const sanitized = sanitizePayload(payload);

  return {
    ...sanitized,
    warnings,
    rawText,
  };
}

function extractCandidateText(
  response: GenerateContentResponse
): string | null {
  if (response.promptFeedback?.blockReason) {
    throw new Error(
      `Gemini がリクエストを拒否しました: ${response.promptFeedback.blockReason}`
    );
  }

  const candidate = response.candidates?.[0];

  if (!candidate) return null;

  if (candidate.finishReason && candidate.finishReason !== FinishReason.STOP) {
    throw new Error(`Gemini 応答が途中終了しました: ${candidate.finishReason}`);
  }

  const parts = candidate.content?.parts ?? [];
  const texts = parts
    .map((part) => ("text" in part ? part.text : undefined))
    .filter((value): value is string => Boolean(value));

  if (texts.length === 0) return null;

  return texts.join("\n").trim();
}

function extractJsonPayload(
  rawText: string,
  warnings: string[]
): ProofreadResponse | null {
  const jsonBlock = detectJsonBlock(rawText);

  if (!jsonBlock) {
    warnings.push("JSON 形式のブロックが見つかりませんでした。");

    return null;
  }

  const firstParse = safeParse(jsonBlock);

  if (firstParse.success) {
    return validatePayload(firstParse.data, warnings);
  }

  warnings.push("JSON パースに失敗したため簡易修正を試みます。");

  const repaired = jsonBlock
    .replace(/（/g, "(") // 全角括弧を半角に変換する
    .replace(/）/g, ")") // 同上
    .replace(/[“”]/g, '"') // 全角ダブルクォートを半角にする
    .replace(/：/g, ":") // 全角コロンを半角にする
    .replace(/，/g, ",") // 全角カンマを半角にする
    .replace(/,\s*([}\]])/g, "$1"); // JSON では禁止されている末尾カンマを削る

  const secondParse = safeParse(repaired);

  if (secondParse.success) {
    warnings.push("JSON の簡易修正に成功しました。");

    return validatePayload(secondParse.data, warnings);
  }

  warnings.push("JSON の修復にも失敗しました。");

  return null;
}

function detectJsonBlock(rawText: string): string | null {
  const fenced = rawText.match(/```json\s*([\s\S]*?)```/i);

  if (fenced?.[1]) {
    return fenced[1].trim();
  }

  const inline = rawText.match(/\{[\s\S]+}/);

  if (inline?.[0]) {
    return inline[0].trim();
  }

  return null;
}

function safeParse(
  value: string
): { success: true; data: unknown } | { success: false } {
  try {
    return { success: true, data: JSON.parse(value) };
  } catch {
    return { success: false };
  }
}

function validatePayload(
  data: unknown,
  warnings: string[]
): ProofreadResponse | null {
  const result = proofreadResponseSchema.safeParse(data);

  if (!result.success) {
    warnings.push("Zod スキーマ検証に失敗しました。");

    return null;
  }

  return result.data;
}

function buildFallbackPayload(
  rawText: string,
  warnings: string[]
): ProofreadResponse {
  warnings.push("フォールバックの校正結果を生成しました。");

  return {
    correctedText: rawText,
    summary:
      "AI 応答を JSON として解釈できなかったため、元の文章を表示しています。",
    details: rawText,
  };
}

function sanitizePayload(payload: ProofreadResponse): ProofreadResponse {
  return {
    correctedText: truncate(
      sanitizeHtml(payload.correctedText),
      MAX_CORRECTED_TEXT_LENGTH
    ),
    summary: truncate(sanitizeHtml(payload.summary), MAX_SUMMARY_LENGTH), // 概要のサニタイズと制限
    details: truncate(sanitizeHtml(payload.details), MAX_DETAILS_LENGTH), // 詳細のサニタイズと制限
  };
}

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1)}…`; // 長すぎる場合は末尾に … を付けて切り詰める
}
