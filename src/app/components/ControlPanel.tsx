"use client";

import { AnimatePresence, motion } from "framer-motion";

interface ControlPanelProps {
  loading: boolean;
  hasResult: boolean;
  canCorrect: boolean;
  errorMessage?: string;
  isCancelable?: boolean;
  onCorrect: () => void;
  onApply: () => void;
  onCancel?: () => void;
  className?: string;
}

export default function ControlPanel({
  loading,
  hasResult,
  canCorrect,
  errorMessage,
  isCancelable = false,
  onCorrect,
  onApply,
  onCancel,
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
        disabled={loading || !canCorrect}
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

      <AnimatePresence>
        {loading && (
          <motion.div
            id="loading"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center space-x-2 text-purple-600"
            role="status"
            aria-live="polite"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="h-4 w-4 border-2 border-purple-600 border-t-transparent rounded-full"
            />
            <span className="text-sm font-medium">校正中...</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {loading && isCancelable && onCancel && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={onCancel}
            className="text-sm text-gray-500 hover:text-gray-700 underline transition-colors duration-200"
            type="button"
          >
            キャンセル
          </motion.button>
        )}
      </AnimatePresence>

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

      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="w-full p-3 bg-red-50 border border-red-200 rounded-lg"
            role="alert"
            aria-live="assertive"
          >
            <p className="text-sm text-red-600 text-center">{errorMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
