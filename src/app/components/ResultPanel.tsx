import { FileText } from "lucide-react";

interface ResultPanelProps {
  result: string;
  summary: string;
  charCount: number;
  onShowDetails?: () => void;
  onCopy?: () => void;
}

export default function ResultPanel({
  result,
  summary,
  charCount,
  onShowDetails,
  // onCopy,
}: ResultPanelProps) {
  return (
    <div className="col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <h2 className="font-semibold text-gray-900">校正結果</h2>
        </div>
        <span
          id="outputCharCount"
          className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded"
        >
          {charCount}文字
        </span>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        <div id="resultArea" className="h-full">
          {result.length > 0 ? (
            <div className="text-gray-900 leading-relaxed whitespace-pre-wrap">
              {result}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <FileText className="w-16 h-16 mb-4" />

              <div>
                <p className="text-center">校正結果がここに表示されます</p>
                <p className="text-sm text-center mt-2">
                  校正後の文章と概要説明が表示されます
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      <div
        id="summarySection"
        className={`${result.length > 0 ? "block" : "hidden"} border-t border-gray-200 p-4 bg-purple-50`}
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-purple-900 mb-1">
              校正概要
            </h3>
            <p id="summaryText" className="text-sm text-purple-800">
              {summary}
            </p>
            <button
              id="detailsBtn"
              className="mt-2 text-sm text-purple-600 hover:text-purple-800 font-medium underline"
              onClick={onShowDetails}
            >
              詳細な校正理由を見る
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
