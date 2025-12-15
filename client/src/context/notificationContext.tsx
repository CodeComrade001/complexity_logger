import { useState, useCallback, type ReactNode } from "react";
import { cn } from "../lib/utils";
import { NotificationContext } from "./useNotification";

type NotificationType = "info" | "success" | "warning" | "error";

interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

export interface NotificationContextType {
  notify: (msg: string, type?: NotificationType) => void;
}



const MAX_NOTIFICATIONS = 5;
const TIMEOUT = 4000;

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const notify = useCallback((message: string, type: NotificationType = "info") => {
    const id = crypto.randomUUID();

    setNotifications((prev) => {
      const next = [{ id, message, type }, ...prev];
      return next.slice(0, MAX_NOTIFICATIONS);
    });

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, TIMEOUT);
  }, []);

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}

      {/* Notification Stack */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80 max-w-[90vw]">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={cn(
              "panel px-4 py-3 text-sm shadow-md border animate-in slide-in-from-right",
              notificationStyles[n.type]
            )}
          >
            {n.message}
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

const notificationStyles: Record<NotificationType, string> = {
  info: "border-primary/40 text-foreground",
  success: "border-[hsl(140_70%_50%)] text-[hsl(140_70%_50%)]",
  warning: "border-[hsl(35_90%_50%)] text-[hsl(35_90%_50%)]",
  error: "border-destructive text-destructive",
};
