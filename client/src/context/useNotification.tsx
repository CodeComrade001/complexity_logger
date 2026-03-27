import React, { createContext, useContext, useCallback, useRef } from "react";
import { toast } from "sonner";

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationContextType {
  notify: (message: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const activeToast = useRef<string | number | null>(null);

  const notify = useCallback((message: string, type: NotificationType = 'info') => {
    // prevent stacking → dismiss previous
    if (activeToast.current) {
      toast.dismiss(activeToast.current);
    }

    const baseConfig = {
      duration: 5000, // 5 seconds
      className: "bg-card text-card-foreground border border-card-border",
      action: {
        label: "Cancel",
        onClick: () => {
          if (activeToast.current) toast.dismiss(activeToast.current);
        }
      }
    };

    let id;

    switch (type) {
      case 'success':
        id = toast.success(message, baseConfig);
        break;
      case 'error':
        id = toast.error(message, baseConfig);
        break;
      case 'warning':
        id = toast.warning(message, baseConfig);
        break;
      case 'info':
        id = toast.info(message, baseConfig);
        break;
      default:
        id = toast(message, baseConfig);
    }

    activeToast.current = id;
  }, []);

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }

  return context;
};