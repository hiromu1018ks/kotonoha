"use client";

import { useState } from "react";
import { parseProofreadDetails } from "@/lib/format/proofread.ts";
import { useSettingsStore } from "@/lib/settings/store.ts";
import type { ProofreadDetails } from "@/types/proofread.ts";
import ControlPanel from "./components/ControlPanel.tsx";
import EditorPanel from "./components/EditorPanel.tsx";
import Header from "./components/Header.tsx";
import ReasonModal from "./components/ReasonModal.tsx";
import ResultPanel from "./components/ResultPanel.tsx";
import SettingsModal from "./components/SettingsModal.tsx";

const deriveValidation = (
  text: string,
  max: number
): "ok" | "empty" | "limit" => {
  if (text.trim().length === 0) return "empty";

  if (text.length > max) return "limit";

  return "ok";
};

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [inputText, setInputText] = useState("");
  const [proofreadResult, setProofreadResult] = useState("");
  const [proofreadSummary, setProofreadSummary] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);
  const [proofreadDetails, setProofreadDetails] =
    useState<ProofreadDetails | null>(null);
  const [isReasonOpen, setIsReasonOpen] = useState(false);

  const maxChars = 10000;

  const validationState = deriveValidation(inputText, maxChars);

  const inputLength = inputText.length;
  const resultCharCount = proofreadResult.length;
  const hasResult = proofreadResult.length > 0;

  const onOpenSettings = () => {
    setIsSettingsOpen(true);
  };

  const handleCorrect = () => {
    if (validationState !== "ok") return;

    // 設定値を取得
    const settings = useSettingsStore.getState();

    // TODO: API呼び出し時に settings.style, settings.level, settings.customPrompt を使用
    console.log("現在の設定:", settings);

    setErrorMessage("");

    const controller = new AbortController();
    setAbortController(controller);
    setLoading(true);
    // TODO: 後ほど実装。
    setTimeout(() => {
      if (!controller.signal.aborted) {
        setProofreadResult(inputText);
        setProofreadSummary(
          "テスト用の校正概要：文章構造を改善し、より自然な表現に修正しました。"
        );
        setLoading(false);
        setAbortController(null);
      }
    }, 3000); // 現時点では入力された情報をそのままResultPanelに表示。
  };

  const handleApply = () => {
    setInputText(proofreadResult);
  };

  const handleShowDetails = () => {
    // パース関数のテストを兼ねて、実際にパースを実行
    const rawDetails = `
  修正内容:
  助詞「は」を「が」に修正しました。
  文末の敬語表現を統一しました。

  改善点:
  より自然な日本語表現に変更しました。
  読みやすさを向上させるため、文章構造を調整しました。

  注意点:
  ビジネス文書として適切な敬語レベルを維持してください。
  専門用語の使用は読者層を考慮してください。
    `;

    const parsedDetails = parseProofreadDetails(rawDetails);
    setProofreadDetails(parsedDetails);
    setIsReasonOpen(true);
    // TODO 後ほど実装
  };

  const handleCloseReason = () => {
    setIsReasonOpen(false);
  };

  const handleCancel = () => {
    if (abortController) {
      abortController.abort();
      setLoading(false);
      setAbortController(null);
      setErrorMessage("校正がキャンセルされました");
    }
  };

  const handleCopy = () => {
    if (!proofreadResult) return;

    navigator.clipboard
      .writeText(proofreadResult)
      .then(() => {
        console.log("校正結果をクリップボードにコピーしました");
      })
      .catch((err) => {
        console.error("コピーに失敗しました:", err);
        setErrorMessage("クリップボードへのコピーに失敗しました");
      });
  };

  return (
    <>
      <Header onOpenSettings={onOpenSettings} />
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-5 lg:h-[calc(100vh-200px)]">
          <EditorPanel
            value={inputText}
            onChange={setInputText}
            charCount={inputLength}
            maxChars={maxChars}
            onSubmit={handleCorrect}
            disabled={loading}
            validationState={validationState}
            className="lg:col-span-2"
          />
          <ControlPanel
            loading={loading}
            hasResult={hasResult}
            canCorrect={validationState === "ok"}
            errorMessage={errorMessage}
            isCancelable={!!abortController}
            onCorrect={handleCorrect}
            onApply={handleApply}
            onCancel={handleCancel}
            className="lg:col-span-1 lg:self-stretch"
          />
          <ResultPanel
            result={proofreadResult}
            summary={proofreadSummary}
            charCount={resultCharCount}
            onShowDetails={handleShowDetails}
            onCopy={handleCopy}
            className="lg:col-span-2"
          />
        </div>
        <ReasonModal
          isOpen={isReasonOpen}
          onClose={handleCloseReason}
          details={proofreadDetails}
        />
      </main>
      <SettingsModal open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </>
  );
}
