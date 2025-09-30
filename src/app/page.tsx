"use client";

import { useState } from "react";
import { parseProofreadDetails } from "@/lib/format/proofread.ts";
import { useSettingsStore } from "@/lib/settings/store.ts";
import { proofreadResponseSchema } from "@/lib/validation/proofread.ts";
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

  const handleCorrect = async () => {
    if (validationState !== "ok") return;

    setErrorMessage("");
    setProofreadResult("");
    setProofreadSummary("");
    setProofreadDetails(null);

    const controller = new AbortController();
    setAbortController(controller);
    setLoading(true);

    try {
      // 設定値を取得
      const settings = useSettingsStore.getState();

      const response = await fetch("/api/proofread", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: inputText,
          style: settings.style,
          level: settings.level,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const error = (await response.json()) as { error?: string };
        throw new Error(error.error || "校正に失敗しました");
      }

      const json: unknown = await response.json();

      const validated = proofreadResponseSchema.safeParse(json);

      if (!validated.success) {
        throw new Error("APIレスポンスの形式が不正です");
      }

      const data = validated.data;

      setProofreadResult(data.correctedText);
      setProofreadSummary(data.summary);

      const parsedDetails = parseProofreadDetails(data.details);
      setProofreadDetails(parsedDetails);
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          setErrorMessage("校正がキャンセルされました");
        } else {
          setErrorMessage(error.message);
        }
      } else {
        setErrorMessage("予期しないエラーが発生しました");
      }
    } finally {
      setLoading(false);
      setAbortController(null);
    }
  };

  const handleApply = () => {
    setInputText(proofreadResult);
  };

  const handleShowDetails = () => {
    if (!proofreadDetails) {
      setErrorMessage("校正詳細情報がありません。まず文章を校正してください。");

      return;
    }

    setIsReasonOpen(true);
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
            onSubmit={() => void handleCorrect()}
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
            onCorrect={() => void handleCorrect()}
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
