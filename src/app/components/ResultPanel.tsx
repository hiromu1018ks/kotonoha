"use client";

/**
 * ResultPanel - サニタイズ済みHTML表示専用コンポーネント
 *
 * 重要: このコンポーネントは受け取るresult/summaryが
 * サーバーサイド（/api/proofreadハンドラー）で事前に
 * DOMPurifyサニタイズ済みであることを前提としています。
 *
 * TODO: /api/proofread実装時にisomorphic-dompurifyで
 * サーバーサイドサニタイズを追加してください。
 */

import { Copy, FileText, InfoIcon } from "lucide-react";

interface ResultPanelProps {
  result: string;
  summary: string;
  charCount: number;
  onShowDetails?: () => void;
  onCopy?: () => void;
  className?: string;
}

// 注意: この関数に渡されるtextは、サーバーサイド（API）で事前にサニタイズ済みである前提
const displaySafeHtml = (htmlString: string): string => {
  // プレーンテキストの場合は改行を<br>に変換
  if (!htmlString.includes("<")) {
    return htmlString.replace(/\n/g, "<br>");
  }

  // すでにHTMLタグを含む場合はそのまま返す（サーバーでサニタイズ済み前提）
  return htmlString;
};

export default function ResultPanel({
  result,
  summary,
  charCount,
  onShowDetails,
  onCopy,
  className = "",
}: ResultPanelProps) {
  const hasContent = result.length > 0;

  return (
    <div
      className={`glass-effect rounded-2xl card-shadow border border-gray-200/50 flex flex-col overflow-hidden transition-all duration-300 ${
        hasContent ? "shadow-green-100/50" : ""
      } ${className}`}
    >
      <div className="p-4 border-b border-gray-200/50 flex items-center justify-between bg-gradient-to-r from-green-50/50 to-emerald-50/50">
        <div className="flex items-center space-x-2">
          <div
            className={`w-2.5 h-2.5 bg-green-500 rounded-full shadow-sm ${hasContent ? "animate-pulse" : ""}`}
          ></div>
          <h2 className="font-semibold text-gray-900 tracking-wide">
            校正結果
          </h2>
        </div>
        <span
          id="outputCharCount"
          className="text-sm text-gray-600 bg-white/80 px-3 py-1.5 rounded-lg border border-gray-200/50 font-medium"
        >
          {charCount}文字
        </span>
      </div>
      <div className="flex-1 p-5 overflow-y-auto">
        <div
          id="resultArea"
          className="h-full"
          aria-live="polite"
          aria-label="校正結果表示エリア"
        >
          {result.length > 0 ? (
            <div
              className="text-gray-900 leading-loose whitespace-pre-wrap animate-fade-in"
              dangerouslySetInnerHTML={{ __html: displaySafeHtml(result) }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-200/30 to-pink-200/30 blur-2xl rounded-full"></div>
                <FileText className="w-20 h-20 mb-6 relative opacity-40" />
              </div>

              <div>
                <p className="text-center text-base font-medium">
                  校正結果がここに表示されます
                </p>
                <p className="text-sm text-center mt-2 text-gray-500">
                  校正後の文章と概要説明が表示されます
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      <div
        id="summarySection"
        className={`${result.length > 0 && summary.trim().length > 0 ? "block" : "hidden"} border-t border-gray-200/50 p-5 bg-gradient-to-br from-purple-50/80 to-pink-50/80 backdrop-blur-sm animate-slide-up`}
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-purple-100 to-pink-100 text-purple-600 rounded-xl flex items-center justify-center shadow-sm">
            <InfoIcon className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-purple-900 mb-2 tracking-wide">
              校正概要
            </h3>
            <p
              id="summaryText"
              className="text-sm text-purple-800 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: displaySafeHtml(
                  summary.trim() || "校正概要を準備中..."
                ),
              }}
            />
            <div className="flex items-center space-x-4 mt-3">
              <button
                id="detailsBtn"
                className="text-sm text-purple-600 hover:text-purple-800 font-medium underline disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                onClick={onShowDetails}
                disabled={!onShowDetails}
                aria-describedby="summaryText"
              >
                詳細な校正理由を見る
              </button>
              <button
                className="inline-flex items-center space-x-1.5 text-sm text-purple-600 hover:text-purple-800 font-medium underline transition-all duration-200 hover:scale-105"
                onClick={onCopy}
                disabled={!result}
                aria-label="校正結果をクリップボードにコピー"
              >
                <Copy className="w-4 h-4" />
                <span>コピー</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
