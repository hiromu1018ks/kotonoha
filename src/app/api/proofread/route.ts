import { NextResponse } from "next/server";
import { generateProofread } from "@/lib/gemini.ts";
import { proofreadRequestSchema } from "@/lib/validation/proofread.ts";

export async function POST(req: Request) {
  try {
    const json: unknown = await req.json();

    const parsed = proofreadRequestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "リクエスト内容が正しくありません。",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { text, style, level } = parsed.data;
    const result = await generateProofread({ text, style, level });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Proofread API error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "サーバー側で問題が発生しました。";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export function OPTIONS() {
  return NextResponse.json(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
