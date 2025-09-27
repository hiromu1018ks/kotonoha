interface ControlPanelProps {
  loading: boolean;
  hasResult: boolean;
  onCorrect: () => void;
  onApply: () => void;
  className?: string;
}

export default function ControlPanel({
  loading,
  hasResult,
  onCorrect,
  onApply,
  className = "",
}: ControlPanelProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center space-y-4 ${className}`}
    >
      <button
        id="correctBtn"
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
        onClick={onCorrect}
        disabled={loading}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
        <span>文章を校正</span>
      </button>

      <div
        id="loading"
        className={`${loading ? "flex" : "hidden"} items-center space-x-2 text-purple-600`}
      >
        <div className="spinner"></div>
        <span className="text-sm font-medium">校正中...</span>
      </div>

      <button
        id="applyBtn"
        disabled={!hasResult || loading}
        className="w-full bg-gray-100 text-gray-400 font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:cursor-not-allowed"
        onClick={onApply}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
          ></path>
        </svg>
        <span>校正結果を適用</span>
      </button>
    </div>
  );
}
