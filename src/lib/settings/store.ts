import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_SETTINGS, type Settings, STORAGE_KEY } from "./defaults.ts";

interface SettingsStore extends Settings {
  setSettings: (settings: Partial<Settings>) => void;
  reset: () => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      setSettings: (newSettings) =>
        set((state) => ({ ...state, ...newSettings })),
      reset: () => set(DEFAULT_SETTINGS),
    }),
    {
      name: STORAGE_KEY,
    }
  )
);
