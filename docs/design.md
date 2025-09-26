# 文章校正 Web アプリ — 完全設計ドキュメント（修正版）

## 1. 目的

職場で LLM へ直接アクセスできない環境を想定し、Gemini API をサーバー経由で呼び出す日本語文章校正 Web アプリを Next.js で実装する。フロントは提供済みの HTML/CSS/JS をベースに React 化する。

---

## 2. 前提（提供 UI の扱い）

- 既存 HTML の ID・DOM 構造（`inputText`, `resultArea`, `correctBtn` 等）を採用する。
- ダミー校正ロジックは実際のネットワーク呼び出しに置換する。
- UI の見た目・レイアウトは維持し、React コンポーネント化に留める。

---

## 3. 全体アーキテクチャ

- **フロント**: Next.js 15（TypeScript）、Tailwind CSS v4、shadcn/ui（必要時）
- **API 層**: Next.js API Routes（`/api/proofread`）、サーバーサイドから Gemini API を呼び出す
- **状態管理**: React state（シンプル用途）、Zustand（設定・プロンプト管理）
- **ログ/監視**: Sentry 等。ただしユーザー文章は記録しない
- **データ保存**: MVP は保存なし。プロンプトテンプレートは localStorage 利用。将来的に暗号化ストレージを検討

フロー:
ユーザー → ブラウザ → Next.js → `/api/proofread` → Gemini API

---

## 4. フロント設計（Next.js 移行方針）

### 4.1 ページ & コンポーネント

- **EditorPanel**: 入力テキスト、文字数カウンター。Ctrl/Cmd+Enter で校正実行
- **ControlPanel**: 校正実行・適用ボタン、ローディング表示
- **ResultPanel**: 校正結果、概要表示、「詳細理由」ボタン
- **SettingsModal**: 文体・レベル・プロンプト設定を localStorage 保存
- **ReasonModal**: 校正理由を安全に表示（サニタイズ必須）

### 4.2 DOM とレスポンシブ

- 現行: PC/モバイルで別 DOM
- 移行後: 単一コンポーネントでレスポンシブ制御
- React state に統一し、DOM 直操作は排除
- 切替は CSS クラス（例: `hidden lg:block`）で行う

### 4.3 通信処理

- `/api/proofread` へ POST（`text`, `style`, `level`）
- タイムアウト: `AbortController` で 10 秒
- エラーハンドリング: 400/401/429/500 に応じ簡潔な UI 表示
- 必須フィールド: `correctedText`, `summary`, `details`

### 4.4 XSS 対策

- `innerHTML` 直挿入禁止
- 必ず DOMPurify でサニタイズ
- Markdown 利用時は変換後もサニタイズ

---

## 5. API 設計（Next.js API Route）

### 5.1 エンドポイント

`POST /api/proofread`

### 5.2 リクエスト

```json
{
  "text": "校正対象の文章",
  "style": "business",
  "level": "standard"
}
```

### 5.3 レスポンス

```json
{
  "correctedText": "校正後の文章",
  "summary": "修正概要",
  "details": "詳細な修正理由"
}
```

### 5.4 エラー

- 400: 不正リクエスト（欠如・超過）
- 401/403: API キー未設定
- 408/504: タイムアウト
- 429: レート制限
- 500: 内部エラー

返却は短く:
`{ "error": "校正に失敗しました。後でもう一度お試しください。" }`

### 5.5 実装上の注意

- API キーは `process.env` から取得。未設定時は 500
- ユーザー文章をログに残さない
- Gemini 呼び出しはサーバーのみ
- JSON 応答の正規化とフォールバック必須

---

## 6. プロンプト設計

出力は必ず JSON。フィールドは `correctedText`, `summary`, `details`。
level=advanced の場合は構造最適化も指示。

応答が JSON でない場合はパース失敗時にプレーンテキストを格納し、summary に注意書きを残す。

---

## 7. セキュリティ & プライバシー

- API キーは Secrets Manager で管理（開発時のみ `.env.local`）
- データは保存しない
- XSS: DOMPurify を徹底
- CSRF: 同一オリジン前提。必要に応じて CSRF トークン導入
- 通信は HTTPS 必須

---

## 8. パフォーマンス要件

- 1000 文字を 5 秒以内に校正
- フロント・サーバー両方でタイムアウト（10 秒）
- UI はローディング表示、キャンセル可能
- レート制限時は再試行案内

---

## 9. テスト計画

- **ユニット**: `normalizeGeminiResponse`、`buildPrompt`
- **結合**: MSW モックで `/api/proofread`
- **E2E**: Playwright で主要フロー（入力 → 校正 → 適用 → 詳細確認）
- **セキュリティ**: XSS 注入・API キー露出検証

---

## 10. デプロイ & 運用

- 環境: Vercel 等
- 環境変数: `GEMINI_API_KEY`, `GEMINI_MODEL`, `TIMEOUT_MS`
- エラーログは Sentry 等（本文は記録しない）
- API キー漏洩時は即失効 → 再発行 → 再デプロイ

---

## 11. 受け入れ基準

1. 入力 → 校正 → 結果 → 適用の一連動作が再現
2. API が正常応答・異常時はエラー返却
3. フロントでサニタイズ表示
4. API キーが露出しない
5. 文字数制限（1 万字）で 400
6. タイムアウト/レート制限時の明確な UI 表示
7. CI でテスト成功

---

## 12. 実装ロードマップ

- T+0: プロジェクト初期化、HTML → React 化
- T+1: API Route モック実装
- T+2: DOMPurify、タイムアウト、エラー処理
- T+3: Gemini 実接続、正規化処理
- T+4: テスト作成、CI
- T+5: デプロイ、監視

---

## 13. 実装上の注意

- `innerHTML` 禁止、サニタイズ必須
- クライアントで API キーを扱わない
- ユーザー文章を保存しない
- JSON 応答失敗時のフォールバック必須
- 既存 UI を壊さない
- Ctrl/Cmd 両対応のショートカット

---

## 14. UX 実装詳細

- **通知**: 右上、3 秒自動消滅、スライドイン/アウト
- **アニメーション**: スピナー、モーダル（フェード＋スケール）、ボタン（ホバー変化）
- **ショートカット**: `Ctrl+Enter`/`Cmd+Enter` 校正、`Escape` モーダル閉じ

---

## 15. フロント fetch 実装例

`AbortController` によるタイムアウト、レスポンス検証、エラー時の例外スローを必須とする。

---
