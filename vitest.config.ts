import { defineConfig } from "vitest/config"; // Vitestの設定関数を読み込む
import path from "node:path"; // Node.jsのpathモジュールでパスを解決する

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"], // テストファイルの探索パターンを指定（必要に応じて追加）
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), //"@/..." を src ディレクトリに解決する
    },
  },
});
