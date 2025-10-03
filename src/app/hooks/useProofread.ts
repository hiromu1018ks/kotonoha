import { useCallback, useMemo, useRef, useState } from "react";
import { parseProofreadDetails } from "@/lib/format/proofread.ts";
import {
  notifyError,
  notifyInfo,
  notifySuccess,
} from "@/lib/notifications/store.ts";
import { useSettingsStore } from "@/lib/settings/store.ts";
import { proofreadResponseSchema } from "@/lib/validation/proofread.ts";
import type { ProofreadDetails } from "@/types/proofread";

const MAX_CHARS = 10_000;

export function useProofread() {
  const [inputText, setInputText] = useState("");
  const [proofreadResult, setProofreadResult] = useState("");
  const [proofreadSummary, setProofreadSummary] = useState("");
  const [proofreadDetails, setProofreadDetails] =
    useState<ProofreadDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isReasonOpen, setIsReasonOpen] = useState(false);

  const cancelledRequestIds = useRef(new Set<string>());
  const controllerToRequestId = useRef(new Map<AbortController, string>());
  const abortController = useRef<AbortController | null>(null);

  const validationState = useMemo<"ok" | "empty" | "limit">(() => {
    if (inputText.trim().length === 0) return "empty";

    if (inputText.length > MAX_CHARS) return "limit";

    return "ok";
  }, [inputText]);

  const inputLength = inputText.length;
  const resultCharCount = proofreadResult.length;
  const hasResult = proofreadResult.length > 0;

  const openSettings = useCallback(() => {
    setIsSettingsOpen(true);
  }, []);

  const toggleSettings = useCallback((nextOpen: boolean) => {
    setIsSettingsOpen(nextOpen);
  }, []);

  // 校正理由モーダルの表示・非表示を制御
  const openReason = useCallback(() => setIsReasonOpen(true), []);
  const closeReason = useCallback(() => setIsReasonOpen(false), []);

  // 校正結果を入力欄へ適用
  const applyResult = useCallback(() => {
    setInputText(proofreadResult);
  }, [proofreadResult]);

  // 校正詳細を表示するハンドラー。詳細が無い場合はエラーメッセージを表示
  const showDetails = useCallback(() => {
    if (!proofreadDetails) {
      notifyError("校正詳細情報がありません。まず文章を校正してください。");

      return;
    }

    openReason();
  }, [proofreadDetails, openReason]);

  // 校正処理のキャンセル
  const cancelProofread = useCallback(() => {
    const controller = abortController.current;

    if (!controller) return;

    const requestId = controllerToRequestId.current.get(controller);

    if (requestId) {
      cancelledRequestIds.current.add(requestId);
      controllerToRequestId.current.delete(controller);
    }

    controller.abort();
    setLoading(false);
    abortController.current = null;
    notifyInfo("校正がキャンセルされました");
  }, []);

  // 校正結果をクリップボードへコピー
  const copyResult = useCallback(() => {
    if (!proofreadResult) return;

    navigator.clipboard
      .writeText(proofreadResult)
      .then(() => {
        notifySuccess("クリップボードにコピーしました!");
      })
      .catch((err) => {
        console.error("コピーに失敗しました:", err);
        notifyError("クリップボードへのコピーに失敗しました");
      });
  }, [proofreadResult]);

  // 校正 API を呼び出すメイン処理
  const runProofread = useCallback(async () => {
    if (validationState !== "ok") return; // 入力が不正なら何もしない

    const requestId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;

    setProofreadResult("");
    setProofreadSummary("");
    setProofreadDetails(null);

    const controller = new AbortController();

    controllerToRequestId.current.set(controller, requestId);

    abortController.current = controller;

    setLoading(true);

    try {
      const settings = useSettingsStore.getState(); // 文体・レベルの設定を取得

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
      setProofreadDetails(parseProofreadDetails(data.details));
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          if (cancelledRequestIds.current.has(requestId)) {
            cancelledRequestIds.current.delete(requestId);
          } else {
            notifyError("校正がキャンセルされました");
          }
        } else {
          notifyError(error.message);
        }
      } else {
        notifyError("予期しないエラーが発生しました");
      }
    } finally {
      setLoading(false);

      if (abortController.current === controller) {
        abortController.current = null;
      }

      controllerToRequestId.current.delete(controller);
    }
  }, [inputText, validationState]);

  return {
    // 状態
    inputText,
    proofreadResult,
    proofreadSummary,
    proofreadDetails,
    loading,
    isSettingsOpen,
    isReasonOpen,
    validationState,
    inputLength,
    resultCharCount,
    hasResult,
    maxChars: MAX_CHARS,

    // 状態更新関数
    setInputText,
    toggleSettings,

    // ハンドラー
    openSettings,
    closeReason,
    showDetails,
    runProofread,
    applyResult,
    cancelProofread,
    copyResult,
  };
}
