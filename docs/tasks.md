# Kotonoha 実装タスクリスト（詳細版）

## プロジェクト概要

職場で LLM にアクセスできない環境向けの日本語文章校正 Web アプリを Next.js で実装する。
既存の HTML/CSS/JS ベースの UI を React コンポーネント化し、Gemini API による実際の校正機能を実装する。

**重要な設計方針**:

- 既存 UI の DOM 構造（`inputText`, `resultArea`, `correctBtn` 等）を可能な限り維持
- セキュリティ重視：DOMPurify でサニタイズ、API キーはサーバーのみ
- レスポンシブ：デスクトップ 3 カラム、モバイル縦並び
- UX：ローディング、アニメーション、ショートカット対応

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

### 1.3 shadcn/ui

- [x] `pnpm dlx shadcn-ui@latest init`
- [x] 必要コンポーネント追加: `button`, `card`, `dialog`, `select`, `textarea`, `input`

### 1.4 環境設定

- [x] **`.env.local` 作成**

  ```bash
  GEMINI_API_KEY=your_api_key_here
  GEMINI_MODEL=gemini-2.5-flash
  NODE_ENV=development
  TIMEOUT_MS=10000
  ```

- [x] **`.env.example` 作成**（API キーなし版）

  ```bash
  GEMINI_API_KEY=
  GEMINI_MODEL=gemini-2.5-flash
  NODE_ENV=development
  TIMEOUT_MS=10000
  ```

- [x] **`.gitignore` 確認**（.env.local が除外されていることを確認）

---

## 🎨 フェーズ 2: UI 基盤実装（優先度: 高）

### 2.1 レイアウト・基盤コンポーネント

- [x] **`app/layout.tsx` 設定**
  - メタデータ設定（title, description, viewport）
  - Tailwind CSS とフォント（Inter/Noto Sans JP）読み込み
  - CSP ヘッダー設定: `script-src 'self'; object-src 'none'`
  - `<html lang="ja">` で日本語対応

- [x] **`app/globals.css` 追加設定**
  - CSS カスタムプロパティでテーマカラー定義
  - フォーカスリング、スクロールバースタイル
  - アニメーション用の @keyframes（fade-in, slide-up）

### 2.2 ヘッダーコンポーネント

- [x] **`components/Header.tsx` 実装**
  - ロゴ（Lucide の FileText アイコン）+ "Kotonoha" タイトル
  - 設定ボタン（Settings アイコン）→ SettingsModal 開く
  - レスポンシブ：モバイルで適切な padding/margin
  - `data-testid` 属性追加（テスト用）

### 2.3 メインページ

- [x] **`app/page.tsx` 作成**
  - **デスクトップ**: 3カラムレイアウト（EditorPanel | ControlPanel | ResultPanel）
  - **モバイル**: 縦並び（Editor → Control → Result）
  - CSS Grid または Flexbox でレスポンシブ
  - 各パネル間の適切な gap/padding 設定
  - 状態管理: `useState` で入力テキスト、校正結果、ローディング状態

### 2.4 エディターパネル

- [x] **`components/EditorPanel.tsx` 実装**
  - **Textarea**: `id="inputText"` 属性（既存DOM互換）
  - **文字数カウンター**: リアルタイム表示、制限（10,000文字）超過時に警告色
  - **ショートカット**: `Ctrl+Enter` / `Cmd+Enter` で校正実行
  - **プレースホルダー**: "校正したい文章をここに入力してください..."
  - **バリデーション**: 空文字、文字数制限のチェック
  - **アクセシビリティ**: `aria-label`, `aria-describedby`

### 2.5 コントロールパネル

- [x] **`components/ControlPanel.tsx` 実装**
  - **校正実行ボタン**: `id="correctBtn"`、disabled 状態制御
  - **適用ボタン**: 校正結果をエディターに反映、結果がない場合 disabled
  - **ローディング状態**: Framer Motion のスピナーアニメーション
  - **キャンセル機能**: 校正実行中にキャンセル可能（AbortController）
  - **エラー表示**: API エラー時の短いメッセージ表示

### 2.6 結果パネル

- [ ] **`components/ResultPanel.tsx` 実装**
  - **校正結果テキスト**: `id="resultArea"`、DOMPurify でサニタイズ済み
  - **概要表示**: 修正概要（1-2行）
  - **文字数カウンター**: 校正後文字数
  - **詳細ボタン**: "校正理由を見る" → ReasonModal 開く
  - **コピー機能**: クリップボードに校正結果をコピー
  - **差分表示**: 将来機能、現在は無効

### 2.7 設定モーダル

- [ ] **`components/SettingsModal.tsx` 実装**
  - **文体選択**: Select コンポーネント（business, casual, academic, report）
  - **校正レベル**: ラジオボタン（basic, standard, advanced）
  - **プロンプトカスタマイズ**: Textarea（上級者向け、デフォルトは非表示）
  - **localStorage 保存**: 設定値の永続化
  - **リセット機能**: デフォルト設定に戻す
  - **モーダル制御**: Escape キーで閉じる、背景クリックで閉じる

### 2.8 詳細理由モーダル

- [ ] **`components/ReasonModal.tsx` 実装**
  - **詳細理由表示**: DOMPurify でサニタイズ済み、`dangerouslySetInnerHTML` 禁止
  - **セクション分け**: 修正内容、改善点、注意点
  - **スクロール対応**: 長文の場合のスクロール
  - **アクセシビリティ**: フォーカストラップ、`role="dialog"`
  - **閉じるボタン**: X ボタン + Escape キー

---

## 🔧 フェーズ 3: API 実装（優先度: 高）

### 3.1 API Route 基盤

- [ ] **`app/api/proofread/route.ts` 作成**
  - **POST ハンドラー**: リクエスト検証 → Gemini API 呼び出し → レスポンス正規化
  - **リクエスト検証**:
    - `text` 必須、string 型、1-10000 文字
    - `style` オプション（business/casual/academic/report）、デフォルト business
    - `level` オプション（basic/standard/advanced）、デフォルト standard
  - **レスポンスヘッダー**: `Content-Type: application/json`、CORS 設定

### 3.2 Gemini API 連携

- [ ] **`lib/gemini.ts` 作成**
  - **GoogleGenerativeAI インスタンス**: 環境変数 `GEMINI_API_KEY` から初期化
  - **モデル設定**: `GEMINI_MODEL` 環境変数（デフォルト: gemini-2.5-flash）
  - **タイムアウト設定**: `AbortController` で 10 秒制限
  - **接続エラーハンドリング**: ネットワークエラー、API キー無効、レート制限

### 3.3 プロンプト設計・生成

- [ ] **`lib/prompts.ts` 作成**
  - **基本プロンプトテンプレート**:

    ```
    あなたは日本語の校正・校閲の専門家です。以下の文章を{style}文書として適切に校正してください。

    校正レベル: {level}
    - basic: 誤字脱字・文法修正のみ
    - standard: 上記 + 自然な表現への改善
    - advanced: 上記 + 構造最適化・敬語調整

    必ず以下のJSON形式で回答してください:
    {
      "correctedText": "校正後の文章",
      "summary": "修正概要（1-2行）",
      "details": "詳細な修正理由と改善ポイント"
    }

    対象文章:
    {text}
    ```

  - **プロンプト組み立て関数**: 文体・レベルに応じた動的生成
  - **文体別の追加指示**: ビジネス（敬語重視）、カジュアル（親しみやすさ）、学術（正確性）

### 3.4 レスポンス処理・正規化

- [ ] **`lib/response-normalizer.ts` 作成**
  - **JSON パース処理**: Gemini レスポンスの JSON 抽出・パース
  - **フォールバック処理**: JSON 形式でない場合のプレーンテキスト格納
  - **必須フィールド検証**: `correctedText`, `summary`, `details` の存在確認
  - **サニタイズ処理**: DOMPurify で HTML タグ除去（サーバーサイド）
  - **文字数制限**: 各フィールドの最大文字数制限

### 3.5 エラーハンドリング

- [ ] **`lib/api-errors.ts` 作成**
  - **400 Bad Request**: リクエスト形式エラー、文字数制限超過
  - **401 Unauthorized**: API キー未設定・無効
  - **408 Request Timeout**: タイムアウト（10秒）
  - **429 Too Many Requests**: レート制限
  - **500 Internal Server Error**: その他のサーバーエラー
  - **エラーメッセージ**: ユーザーフレンドリーな日本語メッセージ

### 3.6 環境変数・設定管理

- [ ] **`lib/config.ts` 作成**
  - **環境変数の型定義**: `GEMINI_API_KEY`, `GEMINI_MODEL`, `TIMEOUT_MS`
  - **バリデーション**: 必須環境変数の存在確認
  - **デフォルト値**: モデル名、タイムアウト値のデフォルト設定
  - **開発・本番環境の切り替え**: NODE_ENV による設定変更

---

## 🔒 フェーズ 4: セキュリティ対策（優先度: 最高）

### 4.1 XSS 対策

- [ ] **DOMPurify サニタイズ実装**
  - **サーバーサイド**: `lib/sanitize.ts` 作成、API レスポンスの全フィールドをサニタイズ
  - **クライアントサイド**: 表示前の二重サニタイズ（念のため）
  - **設定**: HTML タグ除去、スクリプト実行防止、リンク・画像も無効化
  - **テストケース**: 悪意のある HTML/JavaScript 注入テスト

- [ ] **innerHTML 使用禁止の徹底**
  - **ESLint ルール**: `no-dangerous-innerHTML` 有効化
  - **React での安全な表示**: `{text}` 直接表示、`dangerouslySetInnerHTML` 禁止
  - **マークダウン対応**: 将来的に必要な場合のみ、remark + rehype-sanitize

### 4.2 API キー管理

- [ ] **サーバーサイド API キー管理**
  - **環境変数のみ**: `process.env.GEMINI_API_KEY`、クライアントには一切送信しない
  - **検証**: 起動時に API キーの存在確認、無効時はサーバー起動失敗
  - **ログ対策**: API キーがログに出力されないよう注意
  - **本番環境**: Vercel の環境変数設定、GitHub Secrets 利用

### 4.3 CSP（Content Security Policy）設定

- [ ] **`app/layout.tsx` での CSP 設定**

  ```typescript
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data:;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `;
  ```

  - **本番環境**: `'unsafe-inline'` 除去、nonce 利用検討

### 4.4 入力値検証・サニタイゼーション

- [ ] **リクエスト検証強化**
  - **型定義**: `lib/types.ts` で API リクエスト・レスポンスの型定義
  - **バリデーション関数**: `lib/validation.ts` で入力値の厳格チェック
  - **文字数制限**: 1-10,000 文字、制限超過時は 400 エラー
  - **文字種制限**: 制御文字・特殊文字の除去

### 4.5 HTTPS・通信セキュリティ

- [ ] **通信の暗号化**
  - **開発環境**: `pnpm dev` で HTTPS 対応（証明書生成）
  - **本番環境**: Vercel の自動 HTTPS、HSTS ヘッダー設定
  - **API 通信**: 内部 API のみ、外部 API は Next.js サーバー経由

### 4.6 ログ・監視セキュリティ

- [ ] **個人情報保護**
  - **ログから除外**: ユーザー入力テキスト、校正結果は一切ログに残さない
  - **エラーログ**: スタックトレースのみ、リクエスト body は除外
  - **監視**: API キー漏洩検知、異常なリクエスト頻度の監視

---

## ✨ フェーズ 5: UX 機能（優先度: 中）

### 5.1 通知システム

- [ ] **`components/NotificationSystem.tsx` 実装**
  - **表示位置**: 右上固定、z-index 最高レベル
  - **通知タイプ**: success（成功）, error（エラー）, info（情報）
  - **自動消滅**: 3 秒後に fadeOut、ホバー時は一時停止
  - **スタック表示**: 複数通知の縦積み表示
  - **アニメーション**: slideIn from right、fadeOut

- [ ] **通知管理フック `useNotification`**
  - **showSuccess**: 成功メッセージ表示（"校正が完了しました"）
  - **showError**: エラーメッセージ表示（API エラー等）
  - **showInfo**: 情報メッセージ表示（"クリップボードにコピーしました"）
  - **キュー管理**: 同時表示数制限、古い通知の自動削除

### 5.2 アニメーション実装

- [ ] **Framer Motion 設定**
  - **ローディングスピナー**: 回転アニメーション、脈動エフェクト
  - **ボタンアニメーション**: ホバー時の scale(1.05)、pressed 時の scale(0.95)
  - **モーダルアニメーション**: backdrop fadeIn、content slideUp + scaleIn
  - **パネル切り替え**: モバイルでのスムーズなレイアウト変更

- [ ] **カスタムアニメーション定義**
  - **`lib/animations.ts`**: 共通アニメーション variants 定義
  - **duration 設定**: 快適な速度（300ms 基準）
  - **easing**: natural な ease-out カーブ
  - **reduced-motion 対応**: `prefers-reduced-motion` CSS 対応

### 5.3 キーボードショートカット

- [ ] **`hooks/useKeyboardShortcuts.ts` 実装**
  - **Ctrl+Enter / Cmd+Enter**: 校正実行（テキストエリアフォーカス時）
  - **Escape**: モーダル閉じる、フォーカス解除
  - **Ctrl+A / Cmd+A**: テキスト全選択（テキストエリア内）
  - **クロスプラットフォーム**: Mac の Cmd、Windows/Linux の Ctrl 自動判定

### 5.4 状態管理・永続化

- [ ] **Zustand ストア設計**
  - **`store/appStore.ts`**: アプリケーション全体の状態管理
  - **`store/settingsStore.ts`**: ユーザー設定（文体、レベル、プロンプト）
  - **`store/uiStore.ts`**: UI 状態（モーダル開閉、ローディング状態）

- [ ] **localStorage 永続化**
  - **設定値の保存**: 文体、校正レベル、カスタムプロンプト
  - **入力履歴**: 最新 5 件の入力テキスト（オプション機能）
  - **プライバシー配慮**: 校正結果は保存しない
  - **容量制限**: 総容量 5MB 制限、超過時は古いデータから削除

### 5.5 アクセシビリティ強化

- [ ] **キーボードナビゲーション**
  - **Tab 順序**: 論理的なフォーカス移動
  - **フォーカス可視化**: 明確なフォーカスリング
  - **スキップリンク**: メインコンテンツへの直接移動

- [ ] **スクリーンリーダー対応**
  - **ARIA ラベル**: 適切な `aria-label`, `aria-describedby`
  - **ライブリージョン**: 校正完了、エラー発生の音声通知
  - **見出し構造**: `h1` → `h2` → `h3` の適切な階層

### 5.6 パフォーマンス最適化

- [ ] **React 最適化**
  - **useMemo**: 重い計算の結果キャッシュ
  - **useCallback**: 関数の再生成抑制
  - **React.lazy**: 大きなコンポーネントの遅延読み込み
  - **debounce**: 文字数カウンター更新の最適化

- [ ] **バンドル最適化**
  - **Code Splitting**: ページ単位の分割
  - **Dynamic Import**: モーダル等の必要時読み込み
  - **Tree Shaking**: 未使用コードの除去確認

---

## 🧪 フェーズ 6: テスト（優先度: 中）

### 6.1 ユニットテスト

- [ ] **ユーティリティ関数テスト**
  - **`lib/sanitize.test.ts`**: DOMPurify サニタイズ機能
    - HTML タグ除去、スクリプト除去、安全な文字列のみ残存確認
  - **`lib/validation.test.ts`**: 入力値検証
    - 文字数制限、必須フィールド、型チェック
  - **`lib/prompts.test.ts`**: プロンプト生成
    - 文体・レベル別の適切なプロンプト生成確認

- [ ] **React コンポーネントテスト**
  - **`components/EditorPanel.test.tsx`**:
    - 文字数カウンター、制限超過警告、ショートカット動作
  - **`components/ControlPanel.test.tsx`**:
    - ボタン状態制御、ローディング表示、エラー表示
  - **`components/ResultPanel.test.tsx`**:
    - 結果表示、コピー機能、詳細モーダル開閉
  - **`components/SettingsModal.test.tsx`**:
    - 設定保存・読み込み、フォーム検証

### 6.2 API Route テスト

- [ ] **`app/api/proofread/route.test.ts` 実装**
  - **正常系テスト**:
    - 適切なリクエスト → 期待する JSON レスポンス
    - 各文体・レベルでのプロンプト生成確認
  - **異常系テスト**:
    - 400: 空文字、文字数超過、不正な型
    - 401: API キー未設定・無効
    - 408: タイムアウトシミュレーション
    - 429: レート制限シミュレーション
  - **レスポンス検証**:
    - 必須フィールドの存在、サニタイズ処理確認

### 6.3 MSW（Mock Service Worker）設定

- [ ] **`__mocks__/handlers.ts` 作成**
  - **Gemini API モック**: `/v1/models/{model}:generateContent`
  - **レスポンスパターン**:
    - 成功レスポンス（正常な JSON）
    - エラーレスポンス（401, 429, 500）
    - タイムアウトシミュレーション
  - **動的レスポンス**: 入力文字数に応じた校正結果生成

- [ ] **`jest.setup.ts` 設定**
  - MSW server 起動・停止・リセット
  - テスト間での状態クリーンアップ

### 6.4 E2E テスト（Playwright）

- [ ] **`tests/e2e/main-flow.spec.ts` 実装**
  - **基本フロー**:
    1. ページアクセス → UI 要素の表示確認
    2. テキスト入力 → 文字数カウンター更新確認
    3. 校正実行 → ローディング表示 → 結果表示
    4. 詳細理由確認 → モーダル開閉
    5. 結果適用 → エディターへの反映確認

- [ ] **`tests/e2e/error-handling.spec.ts` 実装**
  - **エラーケース**:
    - 空文字入力 → 警告表示
    - 文字数超過 → エラーメッセージ
    - API エラー → エラー通知表示
    - ネットワークエラー → 再試行案内

- [ ] **`tests/e2e/settings.spec.ts` 実装**
  - **設定機能**:
    - 文体・レベル変更 → localStorage 保存確認
    - ページリロード → 設定復元確認

### 6.5 セキュリティテスト

- [ ] **XSS 攻撃テスト**
  - **悪意のある入力**:
    - `<script>alert('xss')</script>`
    - `<img src="x" onerror="alert('xss')">`
    - `javascript:alert('xss')`
  - **検証**: サニタイズ後に無害な文字列になることを確認

- [ ] **API キー露出チェック**
  - **ブラウザ DevTools**: Network タブで API キーが送信されないこと
  - **ソースコード**: バンドル後のクライアントコードに API キーが含まれないこと
  - **環境変数**: `.env.local` が Git にコミットされないこと

### 6.6 パフォーマンステスト

- [ ] **Lighthouse CI 設定**
  - **スコア目標**: Performance 90+, Accessibility 95+, SEO 90+
  - **Core Web Vitals**: LCP < 2.5s, FID < 100ms, CLS < 0.1

- [ ] **負荷テスト**
  - **同時リクエスト**: 10 件同時の校正リクエスト
  - **大量文字**: 10,000 文字の校正処理時間計測

---

## 🚀 フェーズ 7: デプロイ・運用（優先度: 中）

### 7.1 Vercel デプロイ設定

- [ ] **プロジェクト作成・連携**
  - **Vercel プロジェクト作成**: GitHub リポジトリと自動連携
  - **ドメイン設定**: カスタムドメイン（オプション）
  - **自動デプロイ**: main ブランチへの push で自動デプロイ

- [ ] **環境変数設定**
  - **Vercel Dashboard**: `GEMINI_API_KEY`, `GEMINI_MODEL`, `TIMEOUT_MS` 設定
  - **プレビュー環境**: PR 単位のプレビューデプロイ
  - **セキュリティ**: API キーの暗号化保存確認

### 7.2 最適化・パフォーマンス

- [ ] **Next.js 最適化設定**
  - **next.config.js**:
    - Bundle Analyzer 有効化
    - Image 最適化設定
    - 静的エクスポート不要ページの最適化
  - **Core Web Vitals**:
    - LCP: 2.5s 以内（フォント・画像最適化）
    - FID: 100ms 以内（JavaScript 最適化）
    - CLS: 0.1 以内（レイアウトシフト防止）

- [ ] **Lighthouse スコア最適化**
  - **Performance 90+**: 不要なライブラリ除去、コード分割
  - **Accessibility 95+**: ARIA ラベル、コントラスト比
  - **SEO 90+**: メタタグ、構造化データ
  - **Best Practices 95+**: HTTPS、セキュリティヘッダー

### 7.3 監視・ログ設定

- [ ] **エラー監視（Sentry 等）**
  - **エラートラッキング**: JavaScript エラー、API エラーの監視
  - **パフォーマンス監視**: ページロード時間、API レスポンス時間
  - **プライバシー配慮**: ユーザー入力テキストはログ対象外に設定

- [ ] **アップタイム監視**
  - **ヘルスチェック**: `/api/health` エンドポイント作成
  - **外部監視**: UptimeRobot 等での定期監視設定

### 7.4 CI/CD パイプライン

- [ ] **GitHub Actions 設定**
  - **`.github/workflows/ci.yml`**:
    - lint, type-check, test の自動実行
    - Playwright E2E テストの実行
    - Lighthouse CI によるパフォーマンス計測
  - **PR チェック**: マージ前の品質検証

---

## 📋 受け入れ基準 (MVP)

### 基本機能

- [ ] **メインフロー動作**: `/` ページで入力 → 校正 → 結果 → 適用が正常動作
- [ ] **API 正常動作**: `/api/proofread` が適切なレスポンス返却
- [ ] **文字数制限**: 10,000 文字制限が適切に機能
- [ ] **エラーハンドリング**: 各種エラー時の適切なメッセージ表示

### セキュリティ

- [ ] **XSS 対策**: DOMPurify によるサニタイズ処理が有効
- [ ] **API キー保護**: クライアントサイドに API キーが露出しない
- [ ] **HTTPS 通信**: 全通信が HTTPS で暗号化
- [ ] **CSP 設定**: Content Security Policy が適切に設定

### UX・アクセシビリティ

- [ ] **レスポンシブ**: デスクトップ・モバイル両方で正常表示
- [ ] **ローディング表示**: 校正実行中の適切なローディング表示
- [ ] **ショートカット**: Ctrl+Enter での校正実行が動作
- [ ] **通知システム**: 成功・エラー通知が適切に表示

### 品質保証

- [ ] **テスト成功**: CI でのユニット・E2E テストがすべて成功
- [ ] **Lighthouse 90+**: Performance, Accessibility, SEO すべて 90 点以上
- [ ] **型安全性**: TypeScript エラーが 0 件

---

## 🔄 将来拡張（Phase 2 以降）

### フェーズ 2: 高度な校正機能

- [ ] **部分校正機能**: 選択したテキスト範囲のみの校正
- [ ] **修正箇所ハイライト**: 変更点の視覚的な強調表示
- [ ] **差分表示**: Before/After の詳細な差分表示
- [ ] **修正理由別分類**: 誤字・文法・表現改善の分類表示

### フェーズ 3: データ管理・分析

- [ ] **履歴機能**: 校正履歴の保存・管理
- [ ] **エクスポート機能**: txt/docx/pdf 形式での出力
- [ ] **校正統計**: 修正回数・種別の統計表示
- [ ] **用語集機能**: 固有名詞・専門用語の辞書機能

### フェーズ 4: UI/UX 拡張

- [ ] **ダークモード**: ライト・ダークテーマ切り替え
- [ ] **カスタムテーマ**: 色・フォント等のカスタマイズ
- [ ] **音声入力**: Web Speech API による音声入力
- [ ] **ドラッグ&ドロップ**: ファイルのドラッグ&ドロップ対応

### フェーズ 5: 多言語・多様性

- [ ] **多言語対応**: 英語・中国語・韓国語の校正機能
- [ ] **方言対応**: 関西弁・博多弁等の方言校正
- [ ] **業界特化**: 医療・法律・技術文書等の専門校正
- [ ] **文体バリエーション**: 小説・詩・脚本等の創作文書対応

---

## 📚 参考資料・ドキュメント

- **Next.js 15 公式ドキュメント**: https://nextjs.org/docs
- **Gemini API リファレンス**: https://ai.google.dev/docs
- **Tailwind CSS v4 ドキュメント**: https://tailwindcss.com/docs
- **shadcn/ui コンポーネント**: https://ui.shadcn.com/
- **Playwright テストガイド**: https://playwright.dev/docs/
- **Vercel デプロイガイド**: https://vercel.com/docs

---

## ⚠️ 重要な注意事項

1. **セキュリティ第一**: API キー管理、XSS 対策は最優先
2. **プライバシー保護**: ユーザー文章は保存・ログ記録しない
3. **品質保証**: テスト不備でのリリースは厳禁
4. **パフォーマンス**: ユーザビリティを損なう遅延は改善必須
5. **アクセシビリティ**: 障害者対応を含めた幅広いユーザー配慮

---

**📝 最終更新**: 2025年9月（詳細版タスクリスト完成）
