"use client";

import ControlPanel from "./components/ControlPanel.tsx";
import EditorPanel from "./components/EditorPanel.tsx";
import Header from "./components/Header.tsx";
import ReasonModal from "./components/ReasonModal.tsx";
import ResultPanel from "./components/ResultPanel.tsx";
import SettingsModal from "./components/SettingsModal.tsx";
import { useProofread } from "./hooks/useProofread.ts";

export default function Home() {
  const {
    inputText,
    setInputText,
    proofreadResult,
    proofreadSummary,
    proofreadDetails,
    loading,
    errorMessage,
    successMessage,
    isSettingsOpen,
    isReasonOpen,
    validationState,
    inputLength,
    resultCharCount,
    hasResult,
    maxChars,
    openSettings,
    toggleSettings,
    runProofread,
    applyResult,
    showDetails,
    closeReason,
    cancelProofread,
    copyResult,
  } = useProofread();

  return (
    <>
      <Header onOpenSettings={openSettings} />
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-5 lg:h-[calc(100vh-200px)]">
          <EditorPanel
            value={inputText}
            onChange={setInputText}
            charCount={inputLength}
            maxChars={maxChars}
            onSubmit={() => void runProofread()}
            disabled={loading}
            validationState={validationState}
            className="lg:col-span-2"
          />
          <ControlPanel
            loading={loading}
            hasResult={hasResult}
            canCorrect={validationState === "ok"}
            errorMessage={errorMessage}
            successMessage={successMessage}
            isCancelable={Boolean(cancelProofread)}
            onCorrect={() => void runProofread()}
            onApply={applyResult}
            onCancel={cancelProofread}
            className="lg:col-span-1 lg:self-stretch"
          />
          <ResultPanel
            result={proofreadResult}
            summary={proofreadSummary}
            charCount={resultCharCount}
            onShowDetails={showDetails}
            onCopy={copyResult}
            className="lg:col-span-2"
          />
        </div>
        <ReasonModal
          isOpen={isReasonOpen}
          onClose={closeReason}
          details={proofreadDetails}
        />
      </main>
      <SettingsModal open={isSettingsOpen} onOpenChange={toggleSettings} />
    </>
  );
}
