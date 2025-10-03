export type NotificationType = "success" | "error" | "info";

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}

export type NotificationInput = Omit<Notification, "id">;
