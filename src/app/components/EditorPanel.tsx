interface EditorPanelProps {
  value: string;
  onChange: (text: string) => void;
  charCount: number;
  maxChars: number;
  onSubmit: () => void;
  disabled?: boolean;
  validationState: "ok" | "empty" | "limit";
  helperMessage?: string;
  className?: string;
}

export default function EditorPanel({
  value,
  onChange,
  charCount,
  maxChars,
  onSubmit,
  disabled = false,
  validationState,
  // helperMessage,
  className = "",
}: EditorPanelProps) {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col min-h-[260px] lg:min-h-0 ${className}`}
    >
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <h2 className="font-semibold text-gray-900">校正前の文章</h2>
        </div>
        <span
          id="inputCharCount"
          className={`text-sm px-2 py-1 rounded ${
            charCount > maxChars
              ? "bg-red-100 text-red-600 border border-red-200"
              : "bg-gray-100 text-gray-500"
          }`}
          aria-live="polite"
        >
          {charCount}文字
        </span>
      </div>
      <div className="flex-1 p-4 min-h-[260px] lg:min-h-0">
        <textarea
          id="inputText"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
              e.preventDefault();

              if (validationState === "ok") {
                onSubmit();
              }
            }
          }}
          className={`w-full border-0 resize-none focus:outline-none text-gray-900 placeholder-gray-400 leading-relaxed h-64 lg:h-full ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
          placeholder={
            "校正したい文章をここに入力してください。\n\n例：\n・ビジネスメール\n・報告書\n・提案書\n・その他の日本語文書\n\nCtrl+Enterで校正を実行できます。"
          }
          readOnly={disabled}
          aria-label="校正前の文章"
          aria-invalid={validationState !== "ok"}
          aria-describedby="inputText-help"
        ></textarea>
        <p id="inputText-help" aria-live="assertive" className="mt-3 text-sm">
          {validationState === "empty" && (
            <span className="text-red-600">文章を入力してください</span>
          )}
          {validationState === "limit" && (
            <span className="text-red-600">
              {maxChars}文字以内で入力してください（現在 {charCount} 文字）
            </span>
          )}
          {validationState === "ok" && (
            <span className="text-slate-500">
              Ctrl/Cmd+Enter で校正を実行できます
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
