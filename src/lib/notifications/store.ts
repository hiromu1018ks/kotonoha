import { create } from "zustand";
import type { Notification, NotificationInput } from "@/types/notification";

interface NotificationStore {
  notifications: Notification[];
  add: (input: NotificationInput) => string;
  remove: (id: string) => void;
  clear: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],

  add: (input) => {
    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;

    const duration = input.duration ?? 3000;

    const notification: Notification = {
      id,
      type: input.type,
      message: input.message,
      duration,
    };

    set((state) => ({
      notifications: [...state.notifications, notification],
    }));

    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      }, duration);
    }

    return id;
  },

  remove: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  clear: () => set({ notifications: [] }),
}));

export function notifySuccess(message: string, duration?: number): string {
  return useNotificationStore
    .getState()
    .add({ type: "success", message, duration });
}

export function notifyError(message: string, duration?: number): string {
  return useNotificationStore
    .getState()
    .add({ type: "error", message, duration });
}

export function notifyInfo(message: string, duration?: number): string {
  return useNotificationStore
    .getState()
    .add({ type: "info", message, duration });
}
