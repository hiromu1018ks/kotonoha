import { GoogleGenAI } from "@google/genai";

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

// eslint-disable-next-line @typescript-eslint/require-await
export async function generateProofreadResponse(prompt: string) {
  const ai = getClient();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    // TODO: prompt を Gemini 用の contents に組み立て、実際に呼び出す
    //  const response = await ai.models.generateContent({
    //   model:MODEL_ID,
    //   contents:prompt,
    //   signal:controller.signal
    //  })
    //  return response

    return { dummy: true }; // 今はダミーを返す
  } finally {
    clearTimeout(timeout);
  }
}
