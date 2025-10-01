import { GoogleGenAI } from "@google/genai";

const MODEL_ID = process.env.GEMINI_MODEL ?? "gemini-2.0-flash-lite";
const TIMEOUT_MS = Number(process.env.TIMEOUT_MS) || 60000;

let client: GoogleGenAI | null = null;

export function getClient() {
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

export const GEMINI_MODEL_ID = MODEL_ID;
export const GEMINI_TIMEOUT_MS = TIMEOUT_MS;
