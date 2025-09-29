# レスポンス処理・正規化ガイド (Phase 3.4)

このドキュメントは `/api/proofread` が返す Gemini 応答をどのように整形しているかを初学者向けに整理したものです。実際に触れながら読み進めると理解しやすい構成にしています。

---

## 1. 実装ファイル一覧

| 役割                    | ファイル                         | 主な内容                                                                               |
| ----------------------- | -------------------------------- | -------------------------------------------------------------------------------------- |
| サニタイズ共通処理      | `src/lib/sanitize.ts`            | DOMPurify を初期化し、HTML 文字列を安全化する関数 `sanitizeHtml` を提供                |
| 正規化ロジック本体      | `src/lib/response-normalizer.ts` | Gemini の生レスポンスを安全な JSON に整える。フォールバックや警告生成を担当            |
| Gemini 呼び出しラッパー | `src/lib/gemini.ts`              | プロンプト生成 → API 呼び出し → 正規化までを 1 つの関数 `generateProofread` にまとめる |
| API ルート              | `src/app/api/proofread/route.ts` | リクエストを検証し、`generateProofread` を呼んで結果をレスポンスとして返す             |

---

## 2. 全体フローを図で把握する

```
ブラウザからの POST
        │
        ▼
 ┌──────────────────────┐
 │ route.ts (POST ハンドラー) │
 └──────────┬──────────┘
            │ リクエスト検証 (Zod)
            ▼
 ┌──────────────────────┐
 │ gemini.ts            │
 │ ・プロンプト生成     │
 │ ・Gemini API 呼び出し │
 │ ・タイムアウト制御   │
 └──────────┬──────────┘
            │ Gemini 生レスポンス
            ▼
 ┌──────────────────────┐
 │ response-normalizer.ts │
 │ 1. テキスト抽出        │
 │ 2. JSON 抽出・修復     │
 │ 3. Zod 検証            │
 │ 4. フォールバック生成  │
 │ 5. サニタイズ・文字数制限 │
 │ 6. warnings/rawText 付与 │
 └──────────┬──────────┘
            │ 正規化済みレスポンス
            ▼
 ブラウザに JSON で返却
```

---

## 3. `response-normalizer.ts` の分解

### 3.1 エントリポイント

以下は実際の実装（コメント付き）です。コメントを追いながら処理の流れを確認してみてください。

````ts
import { FinishReason } from "@google/genai"; // 応答が途中終了していないか判定するための定数を使う
import type { GenerateContentResponse } from "@google/genai"; // Gemini のレスポンス型を取り込む
import { sanitizeHtml } from "@/lib/sanitize.ts"; // 先ほど作ったサニタイズ関数を使う
import type { ProofreadResponse } from "@/lib/validation/proofread.ts"; // 校正結果の型を再利用する
import { proofreadResponseSchema } from "@/lib/validation/proofread.ts"; // Zod スキーマで構造チェックを行う

const MAX_CORRECTED_TEXT_LENGTH = 10_000; // 校正後の文章を 1 万文字までに制限する
const MAX_SUMMARY_LENGTH = 400; // 概要は 400 文字までに制限する
const MAX_DETAILS_LENGTH = 4_000; // 詳細は 4000 文字までに制限する

export interface NormalizedProofreadResult extends ProofreadResponse {
  warnings: string[]; // パースで問題があった場合に警告文を貯める
  rawText: string; // 元の応答テキストを保持し、デバッグや UI 表示に利用する
}

export function normalizeProofreadResponse(
  response: GenerateContentResponse
): NormalizedProofreadResult {
  const warnings: string[] = []; // 作業中の注意をここに貯めていく
  const rawText = extractCandidateText(response); // 応答からテキスト部分だけを取り出す

  if (!rawText) {
    throw new Error("Gemini レスポンスからテキストを取得できませんでした。"); // テキストが無い場合は処理できないのでエラーにする
  }

  const parsed = extractJsonPayload(rawText, warnings); // JSON 抽出とパースを試みる
  const payload = parsed ?? buildFallbackPayload(rawText, warnings); // パースできなければフォールバックの JSON を組み立てる
  const sanitized = sanitizePayload(payload); // すべてのフィールドをサニタイズしつつ文字数制限を適用する

  return {
    ...sanitized, // 校正済みのテキストや概要・詳細を展開する
    warnings, // フロント側で注意を表示できるように渡す
    rawText, // 元のテキストをそのまま保持する
  };
}

function extractCandidateText(
  response: GenerateContentResponse
): string | null {
  if (response.promptFeedback?.blockReason) {
    throw new Error(
      `Gemini がリクエストを拒否しました: ${response.promptFeedback.blockReason}`
    ); // セーフティで止められたら理由付きでエラーにする
  }

  const candidate = response.candidates?.[0]; // 最初の候補のみ処理する（公式サンプルと同じ考え方）
  if (!candidate) {
    return null; // 候補が無いならテキストは取得できない
  }

  if (candidate.finishReason && candidate.finishReason !== FinishReason.STOP) {
    throw new Error(`Gemini 応答が途中終了しました: ${candidate.finishReason}`); // 途中終了ならエラーとして扱う
  }

  const parts = candidate.content?.parts ?? []; // パーツ配列を安全に取り出す
  const texts = parts
    .map((part) => ("text" in part ? part.text : undefined)) // text フィールドがあるパーツのみ取り出す
    .filter((value): value is string => Boolean(value)); // undefined を除外しつつ型を絞り込む

  if (texts.length === 0) {
    return null; // テキストパーツが一つも無いなら取得失敗
  }

  return texts.join("\n").trim(); // 複数パーツを改行でつないで戻り値にする
}

function extractJsonPayload(
  rawText: string,
  warnings: string[]
): ProofreadResponse | null {
  const jsonBlock = detectJsonBlock(rawText); // ```json``` ブロックまたは {} を探す

  if (!jsonBlock) {
    warnings.push("JSON 形式のブロックが見つかりませんでした。"); // 予告通りの JSON 形式になっていないことを警告する
    return null; // パースは諦めてフォールバックへ進む
  }

  const firstParse = safeParse(jsonBlock); // まずはそのまま JSON.parse を試す
  if (firstParse.success) {
    return validatePayload(firstParse.data, warnings); // Zod で検証し、整っていれば返す
  }

  warnings.push("JSON パースに失敗したため簡易修正を試みます。"); // 失敗したのでリカバリーを試す旨を記録
  const repaired = jsonBlock
    .replace(/（/g, "(") // 全角括弧を半角に変換する
    .replace(/）/g, ")") // 同上
    .replace(/[“”]/g, '"') // 全角ダブルクォートを半角にする
    .replace(/：/g, ":") // 全角コロンを半角にする
    .replace(/，/g, ",") // 全角カンマを半角にする
    .replace(/,\s*([}\]])/g, "$1"); // JSON では禁止されている末尾カンマを削る

  const secondParse = safeParse(repaired); // 修正後でもう一度 JSON.parse を試す
  if (secondParse.success) {
    warnings.push("JSON の簡易修正に成功しました。"); // 修正がうまく行ったことを記録
    return validatePayload(secondParse.data, warnings); // 改めて Zod で検証する
  }

  warnings.push("JSON の修復にも失敗しました。"); // それでもダメならフォールバックに任せる
  return null;
}

function detectJsonBlock(rawText: string): string | null {
  const fenced = rawText.match(/```json\s*([\s\S]*?)```/i); // ```json ... ``` を探す
  if (fenced?.[1]) {
    return fenced[1].trim(); // コードフェンス内をトリムして返す
  }

  const inline = rawText.match(/\{[\s\S]+}/); // そうでなければ最初に出現する {} を探す
  if (inline?.[0]) {
    return inline[0].trim(); // 見つかった場合はトリムして返す
  }

  return null; // JSON ブロックが見つからなかった
}

function safeParse(
  value: string
): { success: true; data: unknown } | { success: false } {
  try {
    return { success: true, data: JSON.parse(value) }; // JSON.parse に成功したらデータ付きで返す
  } catch {
    return { success: false }; // 例外が出たら失敗とみなす
  }
}

function validatePayload(
  data: unknown,
  warnings: string[]
): ProofreadResponse | null {
  const result = proofreadResponseSchema.safeParse(data); // 必須フィールドが揃っているか Zod で検証する

  if (!result.success) {
    warnings.push("Zod スキーマ検証に失敗しました。"); // スキーマに合わなかった場合は警告のみ付けてフォールバックへ
    return null;
  }

  return result.data; // 正常な JSON と判断できたらデータを返す
}

function buildFallbackPayload(
  rawText: string,
  warnings: string[]
): ProofreadResponse {
  warnings.push("フォールバックの校正結果を生成しました。"); // フォールバックを使ったことを記録する

  return {
    correctedText: rawText, // 本文は元のテキストをそのまま返す
    summary:
      "AI 応答を JSON として解釈できなかったため、元の文章を表示しています。", // ユーザー向け説明
    details: rawText, // 詳細欄にも元テキストを入れておく
  };
}

function sanitizePayload(payload: ProofreadResponse): ProofreadResponse {
  return {
    correctedText: truncate(
      sanitizeHtml(payload.correctedText),
      MAX_CORRECTED_TEXT_LENGTH
    ), // 本文のサニタイズと文字数制限
    summary: truncate(sanitizeHtml(payload.summary), MAX_SUMMARY_LENGTH), // 概要のサニタイズと制限
    details: truncate(sanitizeHtml(payload.details), MAX_DETAILS_LENGTH), // 詳細のサニタイズと制限
  };
}

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value; // 充分短ければそのまま返す
  }

  return `${value.slice(0, maxLength - 1)}…`; // 長すぎる場合は末尾に … を付けて切り詰める
}
````

コードの読み方のコツ：

1. **上から下へ処理が流れ進む構造**を意識しながら読む。特に `normalizeProofreadResponse` → 各ヘルパーの順に追うと理解しやすいです。
2. `warnings` へのメッセージ追加箇所を追っておくと、どのケースでフォールバックが使われたかが分かるようになります。

### 3.2 主なヘルパー関数

| 関数                           | 役割                                                                               | 補足                                                            |
| ------------------------------ | ---------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `extractCandidateText`         | Gemini 応答の最初の候補からテキストパーツを取り出す                                | `FinishReason` や `promptFeedback` をチェックして異常終了を検出 |
| `extractJsonPayload`           | テキストから JSON ブロックを抽出し、`safeParse` でパース。失敗時に簡易修復を試みる | 修復成功/失敗は `warnings` に記録                               |
| `validatePayload`              | Zod スキーマ（`proofreadResponseSchema`）で必須フィールドを検証                    | 欠落時は `warnings` に理由を追加                                |
| `buildFallbackPayload`         | JSON 抽出に失敗したときの保険。元テキストをそのまま返す                            | `warnings` にフォールバック利用を記録                           |
| `sanitizePayload` / `truncate` | DOMPurify でサニタイズし、最大文字数を越えた部分をカット                           | 末尾に `…` を付けて超過を示す                                   |

### 3.3 `warnings` の用途

- パース失敗 / 修復成功 / Zod 検証失敗 / フォールバック使用など、結果を使う側が判断材料にできる情報を詰める。
- UI ではバナー表示や「フォールバックを使用しました」のような注意喚起に利用できる。

---

## 4. `sanitize.ts` のシンプルな役割

```ts
import DOMPurify from "isomorphic-dompurify"; // ブラウザでも Node でも動く DOMPurify を読み込む

DOMPurify.setConfig({
  USE_PROFILES: { html: true }, // HTML 用の標準プロファイルでサニタイズする設定を適用
});

export function sanitizeHtml(value: string): string {
  return DOMPurify.sanitize(value); // 渡された文字列を安全な HTML に変換して返す
}
```

- グローバルに一度だけ DOMPurify を設定し、どこからでも同じサニタイズポリシーを使えるようにする。
- 将来、許可するタグや属性を増やしたい場合は `setConfig` の引数を更新すればよい。

---

## 5. `gemini.ts` での呼び出し手順

1. `buildProofreadPrompt` で prose（文章）に必要な指示文を組み立て。
2. 10 秒以内にレスポンスが来なかった場合は `withTimeout` が `Gemini API の応答がタイムアウトしました。` を投げる。
3. 正常応答は `normalizeProofreadResponse` に渡す。
4. ここで投げた例外は `route.ts` で捕捉し、`500` レスポンスに変換される。

タイムアウト値はハードコーディングされているので、必要であれば環境変数化して調整できるようにするのも一案です。

---

## 6. ありがちな質問 Q&A

### Q1. なぜ JSON をフォールバックする必要があるの？

- Gemini が Markdown や文章混じりの答えを返すことがあるため。完全な JSON でなくてもアプリが落ちないようにする保険です。

### Q2. `rawText` は何に使える？

- デバッグやログ出力に使えます。UI で「正規化前のテキストを確認」ボタンを用意するなど、ユーザーに原文を見せる用途にも使えます。

### Q3. DOMPurify をサーバーで使うメリットは？

- API から返す段階で HTML を安全化できるので、クライアント側の実装がシンプルになり、XSS のリスク低減にもつながります。

### Q4. warnings をどう処理すればいい？

- UI 上で注意バナーを表示したり、ログへ出力して監視したりできます。フォールバックが頻発する場合はプロンプトを見直す判断材料になります。

---

## 7. 実践チェックリスト

□ POST `/api/proofread` が `correctedText` / `summary` / `details` を返すことを確認した

□ `warnings` にメッセージが入った場合の UI 表示を検討している

□ フォールバック時もアプリが落ちずに動作することを確認した

□ `sanitizeHtml` を利用している箇所を把握し、表示側での二重サニタイズを避けたい場合は調整した

---

## 8. 今後の拡張アイデア

- **ログ強化**: フォールバック回数やタイムアウトの頻度を記録し、安定運用に役立てる。
- **警告の分類**: warnings を「情報」「注意」「エラー」などレベル分けして UI に反映する。
- **JSON 修復ロジックの充実**: `extractJsonPayload` の修復パターンを増やす、JSON5 ライブラリで緩やかにパースするなど。
- **文字数制限の調整**: 今は定数だが、環境変数や設定画面で変更できるようにすると柔軟性が高まる。

---

### 参考

- `docs/tasks.md` 3.4 レスポンス処理・正規化
- `docs/design.md` 6. 出力フォーマットとフォールバック
- DOMPurify 公式ドキュメント: https://github.com/cure53/DOMPurify
