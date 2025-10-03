"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useNotificationStore } from "@/lib/notifications/store.ts";
import type { NotificationType } from "@/types/notification";

function getNotificationStyles(type: NotificationType): string {
  switch (type) {
    case "success":
      return "bg-green-500 border-green-600 text-white";

    case "error":
      return "bg-red-500 border-red-600 text-white";

    case "info":
      return "bg-blue-500 border-blue-600 text-white";
  }
}

export default function NotificationLayer() {
  const notifications = useNotificationStore((state) => state.notifications);
  const remove = useNotificationStore((state) => state.remove);

  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            className={`p-4 rounded-lg shadow-lg border-2 pointer-events-auto cursor-pointer ${getNotificationStyles(notification.type)}`}
            onClick={() => remove(notification.id)}
            role="status"
          >
            {<p className="text-sm font-medium">{notification.message}</p>}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
