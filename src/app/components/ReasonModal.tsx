"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import type { ProofreadDetails } from "@/types/proofread";

interface ReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  details: ProofreadDetails | null;
}

export default function ReasonModal({
  isOpen,
  onClose,
  details,
}: ReasonModalProps) {
  if (!details) {
    return null;
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="bg-white max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            校正理由の詳細
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          {details.fallbackText ? (
            // フォールバック表示：パースに失敗した場合
            <div>
              <h3 className="font-semibold text-sm text-gray-700 mb-2">
                詳細理由（元のテキスト）
              </h3>
              <div className="p-3 bg-gray-50 rounded-md border">
                <pre className="whitespace-pre-wrap text-sm text-gray-900">
                  {details.fallbackText}
                </pre>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                ※
                詳細情報の自動分類ができませんでした。元のテキストを表示しています。
              </p>
            </div>
          ) : (
            // 通常表示：パースに成功した場合
            <>
              <div>
                <h3 className="font-semibold text-sm text-gray-700 mb-2">
                  修正内容
                </h3>
                <div className="p-3 bg-blue-50 rounded-md">
                  <pre className="whitespace-pre-wrap text-sm">
                    {details.corrections || "情報がありません"}
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-sm text-gray-700 mb-2">
                  改善点
                </h3>
                <div className="p-3 bg-green-50 rounded-md">
                  <pre className="whitespace-pre-wrap text-sm">
                    {details.improvements || "情報がありません"}
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-sm text-gray-700 mb-2">
                  注意点
                </h3>
                <div className="p-3 bg-yellow-50 rounded-md">
                  <pre className="whitespace-pre-wrap text-sm">
                    {details.notes || "情報がありません"}
                  </pre>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
