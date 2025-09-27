"use client";

import { useState } from "react";
import ControlPanel from "./components/ControlPanel.tsx";
import EditorPanel from "./components/EditorPanel.tsx";
import Header from "./components/Header.tsx";
import ResultPanel from "./components/ResultPanel.tsx";

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

    setErrorMessage("");

    const controller = new AbortController();
    setAbortController(controller);
    setLoading(true);
    // TODO: 後ほど実装。
    setTimeout(() => {
      if (!controller.signal.aborted) {
        setProofreadResult(inputText);
        setLoading(false);
        setAbortController(null);
      }
    }, 3000); // 現時点では入力された情報をそのままResultPanelに表示。
  };

  const handleApply = () => {
    setInputText(proofreadResult);
  };

  const handleShowDetails = () => {
    // TODO 後ほど実装
  };

  const handleCancel = () => {
    if (abortController) {
      abortController.abort();
      setLoading(false);
      setAbortController(null);
      setErrorMessage("校正がキャンセルされました");
    }
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
            className="lg:col-span-2"
          />
        </div>
      </main>
    </>
  );
}
