import { GoogleGenAI } from "@google/genai";
import {
  type BuildPromptOptions,
  buildProofreadPrompt,
} from "@/lib/prompts.ts";
import { normalizeProofreadResponse } from "@/lib/response-normalizer.ts";

const MODEL_ID = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

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

  const response = await withTimeout(
    ai.models.generateContent({
      model: MODEL_ID,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    }),
    10_000
  );

  return normalizeProofreadResponse(response);
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
