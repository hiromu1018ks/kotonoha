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
      className={`glass-effect rounded-2xl card-shadow border border-gray-200/50 flex flex-col min-h-[260px] lg:min-h-0 overflow-hidden transition-all duration-300 ${className}`}
    >
      <div className="p-4 border-b border-gray-200/50 flex items-center justify-between bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse shadow-sm"></div>
          <h2 className="font-semibold text-gray-900 tracking-wide">
            校正前の文章
          </h2>
        </div>
        <span
          id="inputCharCount"
          className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-all duration-300 ${
            charCount > maxChars
              ? "bg-red-100 text-red-600 border border-red-200 shadow-sm"
              : "bg-white/80 text-gray-600 border border-gray-200/50"
          }`}
          aria-live="polite"
        >
          {charCount}文字
        </span>
      </div>
      <div className="flex-1 p-5 min-h-[260px] lg:min-h-0 focus-glow">
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
          className={`w-full border-0 resize-none focus:outline-none text-gray-900 placeholder-gray-400 leading-loose h-64 lg:h-full bg-transparent ${
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
        <p
          id="inputText-help"
          aria-live="assertive"
          className="mt-3 text-sm font-medium"
        >
          {validationState === "empty" && (
            <span className="text-red-600 flex items-center space-x-1">
              <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full"></span>
              <span>文章を入力してください</span>
            </span>
          )}
          {validationState === "limit" && (
            <span className="text-red-600 flex items-center space-x-1">
              <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full"></span>
              <span>
                {maxChars}文字以内で入力してください（現在 {charCount} 文字）
              </span>
            </span>
          )}
          {validationState === "ok" && (
            <span className="text-slate-500 flex items-center space-x-1">
              <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full"></span>
              <span>Ctrl/Cmd+Enter で校正を実行できます</span>
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
