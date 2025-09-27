"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible.tsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Label } from "@/components/ui/label.tsx";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import type {
  Settings,
  SettingsLevel,
  SettingsStyle,
} from "@/lib/settings/defaults.ts";
import {
  DEFAULT_SETTINGS,
  LEVEL_OPTIONS,
  STYLE_OPTIONS,
} from "@/lib/settings/defaults.ts";
import { useSettingsStore } from "@/lib/settings/store.ts";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SettingsModal({
  open,
  onOpenChange,
}: SettingsModalProps) {
  const { style, level, customPrompt, setSettings, reset } = useSettingsStore();

  const [localStyle, setLocalStyle] = useState(style);
  const [localLevel, setLocalLevel] = useState(level);
  const [localCustomPrompt, setLocalCustomPrompt] = useState(customPrompt);
  const [showCustomPrompt, setShowCustomPrompt] = useState(false);

  useEffect(() => {
    if (open) {
      setLocalStyle(style);
      setLocalLevel(level);
      setLocalCustomPrompt(customPrompt);
      setShowCustomPrompt(customPrompt.length > 0);
    }
  }, [open, style, level, customPrompt]);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setLocalStyle(style);
      setLocalLevel(level);
      setLocalCustomPrompt(customPrompt);
    }
    onOpenChange(newOpen);
  };

  const handleSave = () => {
    const newSettings: Settings = {
      style: localStyle,
      level: localLevel,
      customPrompt: showCustomPrompt ? localCustomPrompt : "",
    };
    setSettings(newSettings);
    onOpenChange(false);
    // TODO: 成功通知（将来の通知システムで実装）
  };

  const handleReset = () => {
    setLocalStyle(DEFAULT_SETTINGS.style);
    setLocalLevel(DEFAULT_SETTINGS.level);
    setLocalCustomPrompt(DEFAULT_SETTINGS.customPrompt);
    setShowCustomPrompt(false);
    reset();
    // TODO: リセット通知（将来の通知システムで実装）
  };

  const maxCustomPromptLength = 2000;
  const isCustomPromptTooLong =
    localCustomPrompt.length > maxCustomPromptLength;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto bg-white"
        aria-describedby="settings-description"
      >
        <DialogHeader>
          <DialogTitle>設定</DialogTitle>
          <p
            id="settings-description"
            className="text-sm text-muted-foreground"
          >
            文体と校正レベルを設定できます
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="document-style">文書スタイル</Label>
            <Select
              value={localStyle}
              onValueChange={(value) => setLocalStyle(value as SettingsStyle)}
            >
              <SelectTrigger id="document-style" data-testid="style-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {STYLE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>校正レベル</Label>
            <RadioGroup
              value={localLevel}
              onValueChange={(value) => setLocalLevel(value as SettingsLevel)}
              className="space-y-2"
            >
              {LEVEL_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={option.value}
                    id={`level-${option.value}`}
                    data-testid={`level-${option.value}`}
                  />
                  <Label
                    htmlFor={`level-${option.value}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <Collapsible
            open={showCustomPrompt}
            onOpenChange={setShowCustomPrompt}
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="flex w-full justify-start p-0 h-auto hover:bg-transparent"
                data-testid="custom-prompt-toggle"
              >
                {showCustomPrompt ? (
                  <ChevronDown className="h-4 w-4 mr-2" />
                ) : (
                  <ChevronRight className="h-4 w-4 mr-2" />
                )}
                <span className="text-sm font-medium">
                  カスタムプロンプト設定（上級者向け）
                </span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 mt-2">
              <div className="space-y-2">
                <Label htmlFor="custom-prompt">
                  カスタムプロンプト
                  <span className="text-xs text-muted-foreground ml-2">
                    ({localCustomPrompt.length}/{maxCustomPromptLength}文字)
                  </span>
                </Label>
                <Textarea
                  id="custom-prompt"
                  value={localCustomPrompt}
                  onChange={(e) => setLocalCustomPrompt(e.target.value)}
                  placeholder="校正時に追加で使用するプロンプトを入力してください..."
                  className={`min-h-[100px] ${isCustomPromptTooLong ? "border-red-500" : ""}`}
                  data-testid="custom-prompt-textarea"
                />
                {isCustomPromptTooLong && (
                  <p className="text-sm text-red-500">
                    カスタムプロンプトは{maxCustomPromptLength}
                    文字以内で入力してください
                  </p>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            data-testid="cancel-button"
          >
            キャンセル
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            data-testid="reset-button"
            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            リセット
          </Button>
          <Button
            onClick={handleSave}
            disabled={isCustomPromptTooLong}
            data-testid="save-button"
            className="bg-purple-600 hover:bg-purple-700"
          >
            保存
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
