import type { ProofreadDetails } from "@/types/proofread";

/**
 * Gemini APIからの詳細テキストを3つのセクションにパースする
 * マークダウン形式や箇条書き形式に対応
 */
export function parseProofreadDetails(detailsText: string): ProofreadDetails {
  const sectionPatterns = {
    corrections:
      /(?:修正内容|修正|corrections?|変更点)[:：]?\s*(.*?)(?=(?:改善点|improvements?|注意点|notes?|$))/is,
    improvements:
      /(?:改善点|改善|improvements?)[:：]?\s*(.*?)(?=(?:注意点|notes?|修正内容|corrections?|$))/is,
    notes:
      /(?:注意点|注意|notes?)[:：]?\s*(.*?)(?=(?:修正内容|corrections?|改善点|improvements?|$))/is,
  };

  try {
    const corrections = extractSection(
      detailsText,
      sectionPatterns.corrections
    );
    const improvements = extractSection(
      detailsText,
      sectionPatterns.improvements
    );
    const notes = extractSection(detailsText, sectionPatterns.notes);

    if (!corrections && !improvements && !notes) {
      return {
        corrections: "",
        improvements: "",
        notes: "",
        fallbackText: detailsText.trim(),
      };
    }

    return {
      corrections: cleanSection(corrections),
      improvements: cleanSection(improvements),
      notes: cleanSection(notes),
    };
  } catch {
    // パースエラー時はフォールバック
    return {
      corrections: "",
      improvements: "",
      notes: "",
      fallbackText: detailsText.trim(),
    };
  }
}

/**
 * 正規表現でセクションを抽出
 */
function extractSection(text: string, pattern: RegExp): string {
  const match = text.match(pattern);

  return match?.[1]?.trim() || "";
}

/**
 * セクションテキストをクリーンアップ
 * - 先頭の記号や空行を除去
 * - マークダウンの見出し記号を除去
 */
function cleanSection(text: string): string {
  return text
    .replace(/^[#\-*\s]+/, "") // 先頭の見出し記号や箇条書き記号を除去
    .replace(/\n\s*\n/g, "\n") // 連続する空行を単一の改行に
    .trim();
}
