# Kotonoha

個人利用を想定した日本語文章校正アプリです。Next.js 15 (App Router) と Gemini API を組み合わせ、ブラウザ上で文章入力から校正結果の確認・適用までを完結できます。

## 目次
- [主な機能](#主な機能)
- [技術スタック](#技術スタック)
- [セットアップ](#セットアップ)
- [環境変数](#環境変数)
- [使い方](#使い方)
- [テストと品質チェック](#テストと品質チェック)
- [デプロイ](#デプロイ)
- [トラブルシューティング](#トラブルシューティング)

## 主な機能
- 校正前テキストの入力と文字数カウンター表示
- Gemini API による文章校正（文体・校正レベル・カスタムプロンプトを指定可能）
- 校正結果の要約表示と詳細モーダル表示
- 校正結果のコピー／入力欄への適用
- 設定モーダルでのスタイル・レベル保存（Zustand + localStorage 永続化）
- 校正処理中のローディング表示・キャンセル機能

## 技術スタック
- Next.js 15 / React 19
- TypeScript / Tailwind CSS v4 / shadcn/ui
- Zustand （設定状態管理）
- Gemini API クライアント `@google/genai`
- Vitest + ESLint (Next.js core-web-vitals) + Prettier

## セットアップ
```bash
pnpm install
cp .env.example .env.local # まだ無い場合は作成して環境変数を設定
pnpm dev
```

- 開発サーバー: http://localhost:3000
- `DEBUG_GEMINI_LOGS=true pnpm dev` で詳細ログを有効化できます。

## 環境変数
| 変数名 | 必須 | デフォルト | 説明 |
| ------ | ---- | ---------- | ---- |
| `GEMINI_API_KEY` | ◯ | なし | Gemini API キー。サーバー側でのみ利用します。 |
| `GEMINI_MODEL` | △ | `gemini-2.0-flash-lite` | 使用するモデル ID。必要に応じて変更してください。 |
| `TIMEOUT_MS` | △ | `60000` | Gemini API 呼び出しのタイムアウト（ミリ秒）。 |
| `DEBUG_GEMINI_LOGS` | △ | `false` | `true` のときだけ API 応答内容など詳細ログを出力します。 |
| `ALLOWED_ORIGIN` | △ | 空文字 | CORS を許可するオリジン。空の場合は同一オリジンのみ許可。 |

## 使い方
1. 左カラムに校正したい文章を入力します（Ctrl/Cmd + Enter で校正実行）。
2. 中央の「文章を校正」ボタンを押すと Gemini API にリクエストを送信します。
3. 右カラムに校正後の文章と概要が表示されます。「詳細な校正理由を見る」でモーダルを開き、修正理由・改善点・注意点を確認できます。
4. 「校正結果を適用」で校正後の文章を入力欄へ反映できます。
5. 設定モーダルでは文体・校正レベル・カスタムプロンプトを変更して保存できます。

## テストと品質チェック
```bash
pnpm lint         # ESLint (Next.js 推奨設定)
pnpm test         # Vitest (--run)
pnpm test:watch   # ファイル変更を監視しながらテスト
pnpm build        # 本番ビルド検証
```

- 主要ユーティリティ (`parseProofreadDetails`, `normalizeProofreadResponse`) にユニットテストを追加しています。
- 変更時は `pnpm lint` と `pnpm build` を通してからデプロイすると安心です。

## デプロイ
- Vercel などにデプロイする際は、Production/Preview 環境に上記の環境変数を設定してください。
- 本番では `DEBUG_GEMINI_LOGS` を設定しない（または `false`）ことで、校正対象テキストがログに残るのを防げます。
- CORS を制限したい場合は `ALLOWED_ORIGIN` にデプロイ先のドメイン（例: `https://your-app.vercel.app`）を指定してください。

## トラブルシューティング
- **Gemini API がタイムアウトする**: `TIMEOUT_MS` を延長、またはネットワーク状態を確認してください。
- **API キー未設定エラー**: `.env.local` に `GEMINI_API_KEY` が設定されているか確認してください。
- **ビルドや lint が失敗する**: `pnpm install` で依存を再インストールし、`pnpm lint --fix` を試してください。

---
将来の自分が迷わないよう、運用ルールやスクリーンショットを随時追加するとさらに便利になります。
