"use client";

import { FileText, Settings } from "lucide-react";

interface HeaderProps {
  onOpenSettings: () => void;
}

export default function Header({ onOpenSettings }: HeaderProps) {
  return (
    <header className="border-b border-gray-200/50 glass-effect sticky top-0 z-40 shadow-sm">
      <div className="container mx-auto px-4 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 group">
            <div className="w-11 h-11 bg-gradient-to-br from-purple-600 via-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:scale-105">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 via-purple-500 to-pink-600 bg-clip-text text-transparent tracking-tight">
                Kotonoha
              </h1>
              <p className="text-sm text-gray-600 tracking-wide">
                言葉を美しく磨く AI校正アシスタント
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenSettings}
            data-testid="header-settings-button"
            aria-label="設定を開く"
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-300 hover:bg-gray-100/80 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 active:scale-95"
          >
            <Settings className="w-5 h-5 text-gray-600 transition-transform duration-300 hover:rotate-90" />
          </button>
        </div>
      </div>
    </header>
  );
}
