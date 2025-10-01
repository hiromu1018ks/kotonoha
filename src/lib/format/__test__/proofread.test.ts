import { describe, expect, it } from "vitest";
import { parseProofreadDetails } from "../proofread.ts";

describe("parseProofreadDetails", () => {
  it("整形済みの3セクションを正しく取り出す", () => {
    const input = [
      "修正内容: 誤字を直しました。",
      "改善点: 読みやすい語順に調整しました。",
      "注意点: 敬語の使い方に注意してください。",
    ].join("\n");

    const result = parseProofreadDetails(input);

    expect(result.corrections).toBe("誤字を直しました。");
    expect(result.improvements).toBe("読みやすい語順に調整しました。"); // 改善点が抽出できたか
    expect(result.notes).toBe("敬語の使い方に注意してください。"); // 注意点が抽出できたか
    expect(result.fallbackText).toBeUndefined(); // 正常抽出ではフォールバックが不要なことを確認
  });

  it("セクション名が欠けている場合はフォールバック表示になる", () => {
    const input = "これは解析できない形式です。";

    const result = parseProofreadDetails(input);

    expect(result.corrections).toBe("");
    expect(result.improvements).toBe("");
    expect(result.notes).toBe("");
    expect(result.fallbackText).toBe("これは解析できない形式です。");
  });
});
