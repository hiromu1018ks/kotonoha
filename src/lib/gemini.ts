import { GoogleGenAI } from "@google/genai";
import {
  type BuildPromptOptions,
  buildProofreadPrompt,
} from "@/lib/prompts.ts";
import { normalizeProofreadResponse } from "@/lib/response-normalizer.ts";

const MODEL_ID = process.env.GEMINI_MODEL ?? "gemini-2.0-flash-lite";
const TIMEOUT_MS = Number(process.env.TIMEOUT_MS) || 60000;

let client: GoogleGenAI | null = null;

function getClient() {
  if (client) {
    return client;
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY が設定されていません。");
  }

  client = new GoogleGenAI({ apiKey });

  return client;
}

export async function generateProofread(options: BuildPromptOptions) {
  const ai = getClient();
  const prompt = buildProofreadPrompt(options);

  console.time("generateProofread:generateContent"); // 呼び出し時間を計測して遅延の発生箇所を把握する

  try {
    const response = await withTimeout(
      ai.models.generateContent({
        model: MODEL_ID,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      }),
      TIMEOUT_MS
    );

    console.timeEnd("generateProofread:generateContent");

    console.log(
      "Gemini raw response:",
      JSON.stringify(response, null, 2) // 正規化前のレスポンスをまるごと確認する
    );

    return normalizeProofreadResponse(response);
  } catch (error) {
    console.timeEnd("generateProofread:generateContent"); // エラー時も計測を終了しておく
    console.error("Gemini generateContent error:", error); // 例外内容を詳細に確認する

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
