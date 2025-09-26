# Kotonoha 実装タスクリスト（pnpm 版）

## プロジェクト概要

職場で LLM にアクセスできない環境向けの日本語文章校正 Web アプリを Next.js で実装する。

---

## 🚀 フェーズ 1: プロジェクト初期設定（優先度: 最高）

### 1.1 Next.js プロジェクト初期化

- [x] `pnpm create next-app kotonoha --ts --tailwind --eslint`
- [x] プロジェクト構造調整
- [x] Git 初期化と初回コミット

### 1.2 依存関係

- [x] **必須パッケージ**
  - `@google/genai`（Gemini API SDK）
  - `dompurify` + `@types/dompurify`（XSS 対策）
  - `zustand`（状態管理）
  - `framer-motion`（アニメーション）
  - `lucide-react`（アイコン）

- [x] **開発用パッケージ**
  - `@testing-library/react` + `@testing-library/jest-dom`
  - `@playwright/test`（E2E）
  - `msw`（API モック）
    → インストール例:
    `pnpm add -D @testing-library/react @testing-library/jest-dom @playwright/test msw`

### 1.3 shadcn/ui

- [ ] `pnpm dlx shadcn-ui@latest init`
- [ ] 必要コンポーネント追加
      `button`, `card`, `modal`, `select`, `textarea`, `input`

### 1.4 環境設定

- [ ] `.env.local`

  ```
  GEMINI_API_KEY=your_api_key_here
  GEMINI_MODEL=gemini-2.5-flash
  NODE_ENV=development
  TIMEOUT_MS=10000
  ```

- [ ] `.env.example`（キーなし）
- [ ] `.gitignore` 確認

---

## 🎨 フェーズ 2: UI 基盤実装（優先度: 高）

- [ ] `app/layout.tsx` 設定
- [ ] `Header.tsx` 実装（ロゴ、タイトル、設定ボタン）
- [ ] `app/page.tsx` 作成（デスクトップ 3 カラム、モバイル縦並び）
- [ ] `EditorPanel.tsx`（テキスト入力・文字数表示）
- [ ] `ControlPanel.tsx`（校正・適用ボタン、ローディング）
- [ ] `ResultPanel.tsx`（結果・概要・詳細ボタン）
- [ ] `SettingsModal.tsx`（文体・校正レベル設定、localStorage）
- [ ] `ReasonModal.tsx`（詳細理由、安全表示）

---

## 🔧 フェーズ 3: API 実装（優先度: 高）

- [ ] `app/api/proofread/route.ts` 作成（POST）
- [ ] Gemini API 呼び出し実装（@google/genai 利用、API キー env 管理）
- [ ] プロンプト生成関数追加
- [ ] タイムアウト（10 秒）設定
- [ ] エラーハンドリング（400/401/403/408/429/500）
- [ ] レスポンス正規化（JSON 検証・フォールバック・サニタイズ）

---

## 🔒 フェーズ 4: セキュリティ対策（優先度: 最高）

- [ ] DOMPurify で `correctedText`/`details` をサニタイズ
- [ ] innerHTML 使用禁止
- [ ] CSP 設定（`script-src 'self'`）
- [ ] API キーはサーバーのみで利用（クライアント露出禁止）
- [ ] 文字数制限（1 万字）・型検証

---

## ✨ フェーズ 5: UX 機能（優先度: 中）

- [ ] 通知システム（右上 3 秒自動消滅）
- [ ] Framer Motion でアニメーション（ローディング、モーダル、ボタン）
- [ ] ショートカット: `Ctrl/Cmd+Enter` 校正、`Escape` モーダル閉じ
- [ ] Zustand で状態管理、localStorage 永続化

---

## 🧪 フェーズ 6: テスト（優先度: 中）

- [ ] ユニットテスト（コンポーネント、ユーティリティ）
- [ ] API Route テスト（正常/異常/タイムアウト）
- [ ] MSW モック設定
- [ ] Playwright で E2E（入力 → 校正 → 適用 → 詳細確認）
- [ ] XSS テスト、API キー露出チェック

---

## 🚀 フェーズ 7: デプロイ・運用（優先度: 中）

- [ ] Vercel プロジェクト作成 & GitHub 連携
- [ ] 本番環境変数設定（`pnpm vercel env add` 等）
- [ ] Next.js 最適化（Image, Bundle, Core Web Vitals）
- [ ] Lighthouse 90+ 確保
- [ ] Sentry 等によるエラー監視（本文はログ対象外）

---

## 📋 受け入れ基準 (MVP)

- [ ] `/` ページで入力 → 校正 → 結果 → 適用が動作
- [ ] API Route が正しく応答
- [ ] サニタイズ処理有効
- [ ] API キー露出なし
- [ ] 1 万字制限が効く
- [ ] エラーメッセージが適切
- [ ] CI でテスト成功

---

## 🔄 将来拡張（Phase 2 以降）

- 部分校正
- 修正箇所ハイライト
- 履歴保存・エクスポート（txt/docx/pdf）
- ダークモード/カスタムテーマ
- 音声入力
- 校正統計・用語集

---
