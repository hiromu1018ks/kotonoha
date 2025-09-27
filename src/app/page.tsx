"use client";

import { useState } from "react";
import ControlPanel from "./components/ControlPanel.tsx";
import EditorPanel from "./components/EditorPanel.tsx";
import Header from "./components/Header.tsx";
import ResultPanel from "./components/ResultPanel.tsx";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [inputText, setInputText] = useState("");
  const [proofreadResult, setProofreadResult] = useState("");
  const [proofreadSummary, setProofreadSummary] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const inputLength = inputText.length;
  const resultCharCount = proofreadResult.length;
  const hasResult = proofreadResult.length > 0;

  const onOpenSettings = () => {
    setIsSettingsOpen(true);
  };

  const handleCorrect = () => {
    // TODO: 後ほど実装。
    setProofreadResult(inputText); // 現時点では入力された情報をそのままResultPanelに表示。
  };

  const handleApply = () => {
    setInputText(proofreadResult);
  };

  const handleShowDetails = () => {
    // TODO 後ほど実装
  };

  return (
    <>
      <Header onOpenSettings={onOpenSettings} />
      <main className="container mx-auto px-4 py-8">
        <div className="hidden lg:grid lg:grid-cols-5 gap-6 h-[calc(100vh-200px)]">
          <EditorPanel
            value={inputText}
            onChange={setInputText}
            charCount={inputLength}
          />
          <ControlPanel
            loading={loading}
            hasResult={hasResult}
            onCorrect={handleCorrect}
            onApply={handleApply}
          />
          <ResultPanel
            result={proofreadResult}
            summary={proofreadSummary}
            charCount={resultCharCount}
            onShowDetails={handleShowDetails}
          />
        </div>

        <div className="lg:hidden space-y-6">
          <EditorPanel
            value={inputText}
            onChange={setInputText}
            charCount={inputLength}
          />
          <ControlPanel
            loading={loading}
            hasResult={hasResult}
            onCorrect={handleCorrect}
            onApply={handleApply}
          />
          <ResultPanel
            result={proofreadResult}
            summary={proofreadSummary}
            charCount={resultCharCount}
            onShowDetails={handleShowDetails}
          />
        </div>
      </main>
    </>
  );
}
