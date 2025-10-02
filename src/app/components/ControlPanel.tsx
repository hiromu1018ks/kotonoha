"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, Download } from "lucide-react";

interface ControlPanelProps {
  loading: boolean;
  hasResult: boolean;
  canCorrect: boolean;
  errorMessage?: string;
  successMessage?: string;
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
  successMessage,
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
        className={`w-full font-semibold py-3.5 px-5 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2.5 shadow-lg relative overflow-hidden group ${
          loading || !canCorrect
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-purple-600 via-purple-500 to-pink-600 hover:from-purple-700 hover:via-purple-600 hover:to-pink-700 text-white transform hover:scale-105 hover:shadow-xl active:scale-95"
        }`}
        onClick={onCorrect}
        disabled={loading || !canCorrect}
      >
        {!loading && !canCorrect ? null : (
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></span>
        )}
        <CheckCircle className="w-5 h-5 relative z-10" />
        <span className="relative z-10">文章を校正</span>
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
        className={`w-full font-semibold py-3.5 px-5 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2.5 shadow-lg relative overflow-hidden group
    ${
      hasResult && !loading
        ? "bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white transform hover:scale-105 hover:shadow-xl cursor-pointer active:scale-95" // 有効時: 緑色
        : "bg-gray-100 text-gray-400 cursor-not-allowed" // 無効時: グレー
    }
  `}
        onClick={onApply}
      >
        {hasResult && !loading && (
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></span>
        )}
        <Download className="w-5 h-5 relative z-10" />
        <span className="relative z-10">校正結果を適用</span>
      </button>

      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-full p-3.5 bg-red-50/90 border border-red-200 rounded-xl shadow-sm backdrop-blur-sm"
            role="alert"
            aria-live="assertive"
          >
            <p className="text-sm text-red-700 text-center font-medium">
              {errorMessage}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-full p-3.5 bg-green-50/90 border border-green-200 rounded-xl shadow-sm backdrop-blur-sm"
            role="status"
            aria-live="polite"
          >
            <p className="text-sm text-green-700 text-center flex items-center justify-center space-x-2 font-medium">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{successMessage}</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
