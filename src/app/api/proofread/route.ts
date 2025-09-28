import { NextResponse } from "next/server";
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
    // TODO: ここで Gemini API を呼び出し、レスポンスを正規化する

    // 現時点では仮のレスポンスを返す（フロントエンドの動作確認用）
    return NextResponse.json({
      correctedText: text,
      summary: `スタイル:${style} / レベル:${level}（ダミー応答）`,
      details: "Gemini API 接続前の仮データです。",
    });
  } catch (error) {
    console.error("Proofread API error:", error);

    return NextResponse.json(
      { error: "サーバー側で問題が発生しました。" },
      { status: 500 }
    );
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
