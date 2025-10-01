import { normalizeProofreadResponse } from "../response-normalizer.ts";
import { GEMINI_MODEL_ID, GEMINI_TIMEOUT_MS, getClient } from "./client.ts";
import type { BuildPromptOptions } from "./prompt.ts";
import { buildProofreadPrompt } from "./prompt.ts";

const DEBUG_GEMINI_LOGS = process.env.DEBUG_GEMINI_LOGS === "true";

export async function generateProofread(options: BuildPromptOptions) {
  const ai = getClient();
  const prompt = buildProofreadPrompt(options);

  if (DEBUG_GEMINI_LOGS) {
    console.time("generateProofread:generateContent"); // 呼び出し時間を計測して遅延の発生箇所を把握する
  }

  try {
    const response = await withTimeout(
      ai.models.generateContent({
        model: GEMINI_MODEL_ID,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      }),
      GEMINI_TIMEOUT_MS
    );

    if (DEBUG_GEMINI_LOGS) {
      console.timeEnd("generateProofread:generateContent");

      console.log(
        "Gemini raw response:",
        JSON.stringify(response, null, 2) // 正規化前のレスポンスをまるごと確認する
      );
    }

    return normalizeProofreadResponse(response);
  } catch (error) {
    if (DEBUG_GEMINI_LOGS) {
      console.error("Gemini generateContent error:", error); // 例外内容を詳細に確認する
    }

    throw error; // 既存のエラーハンドリングに任せるため再スローする
  }
}

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const wrapped = new Promise<T>((resolve, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error("Gemini API の応答がタイムアウトしました。"));
    }, timeoutMs);

    promise.then(resolve).catch(reject);
  });

  try {
    return await wrapped; // Promise が完了するのを待つ
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId); // 成功でも失敗でもタイマーをきちんと解除する
    }
  }
}

export type { BuildPromptOptions };
