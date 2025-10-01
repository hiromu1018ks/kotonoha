import { FinishReason, type GenerateContentResponse } from "@google/genai"; //型の重複定義を避けるため型だけインポート
import { describe, expect, it } from "vitest"; // テストの土台を読み込む
import { normalizeProofreadResponse } from "@/lib/response-normalizer.ts"; // テスト対象関数を読み込む

const baseResponse = {
  // Geminiから返ってくるレスポンス構造のうち、今回使う部分だけを定義
  candidates: [
    {
      finishReason: FinishReason.STOP, // 応答が正常終了したことを示す
      content: {
        parts: [
          {
            text: JSON.stringify({
              correctedText: "修正後テキスト",
              summary: "概要です",
              details: "修正内容: A\n改善点: B\n注意点: C",
            }), // JSON文字列をパートとして渡す
          },
        ],
        role: "model",
      },
    },
  ],
} satisfies Partial<GenerateContentResponse>;

describe("normalizeProofreadResponse", () => {
  it("JSONを正しくパースし、サニタイズ済みのフィールドだけ返す", () => {
    const result = normalizeProofreadResponse(
      baseResponse as GenerateContentResponse
    ); //テスト用レスポンスを渡して実行

    expect(result.correctedText).toBe("修正後テキスト"); // JSONの値が反映されているか
    expect(result.summary).toBe("概要です"); // 同上
    expect(result.details).toContain("修正内容: A"); // パースされた詳細が含まれているか
    expect(result.warnings).toEqual([]); // 正常ケースでは警告が空配列のまま
  });

  it("JSON抽出に失敗した場合はフォールバックの結果と警告を返す", () => {
    const fallbackResponse = {
      candidates: [
        {
          finishReason: FinishReason.STOP,
          content: {
            parts: [
              {
                text: "これはJSONでありません。", // 故意にJSONでない文字列を与える
              },
            ],
            role: "model",
          },
        },
      ],
    } satisfies Partial<GenerateContentResponse>;

    const result = normalizeProofreadResponse(
      fallbackResponse as GenerateContentResponse
    ); // フォールバックを発生させる

    expect(result.correctedText).toBe("これはJSONでありません。"); // 生テキストがフォールバックとして整形される
    expect(result.summary).toContain("AI 応答を JSON として解釈できなかった"); // フォールバック用メッセージが含まれる
    expect(result.warnings.length).toBeGreaterThan(0); // 警告が追加されていることを確認
  });
});
