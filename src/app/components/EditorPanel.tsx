interface EditorPanelProps {
  value: string;
  onChange: (text: string) => void;
  charCount: number;
}

export default function EditorPanel({
  value,
  onChange,
  charCount,
}: EditorPanelProps) {
  return (
    <div className="col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <h2 className="font-semibold text-gray-900">校正前の文章</h2>
        </div>
        <span
          id="inputCharCount"
          className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded"
        >
          {charCount}文字
        </span>
      </div>
      <div className="flex-1 p-4">
        <textarea
          id="inputText"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="text-area w-full h-full border-0 resize-none focus:outline-none text-gray-900 placeholder-gray-400 leading-relaxed"
          placeholder="校正したい文章をここに入力してください。

例：
・ビジネスメール
・報告書
・提案書
・その他の日本語文書

Ctrl+Enterで校正を実行できます。"
        ></textarea>
      </div>
    </div>
  );
}
