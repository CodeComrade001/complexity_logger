import React, { createContext, useContext, useCallback } from "react";
import { toast } from "sonner";

// 1. Define the types for our context
type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationContextType {
  notify: (message: string, type?: NotificationType) => void;
}

// 2. Create the Context
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// 3. Create the Provider Component
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const notify = useCallback((message: string, type: NotificationType = 'info') => {
    switch (type) {
      case 'success':
        toast.success(message);
        break;
      case 'error':
        toast.error(message);
        break;
      case 'warning':
        toast.warning(message);
        break;
      case 'info':
        toast.info(message);
        break;
      default:
        toast(message);
    }
  }, []);

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
    </NotificationContext.Provider>
  );
};

// 4. Create the Hook to use the context
export const useNotification = () => {
  const context = useContext(NotificationContext);

  if (context === undefined) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }

  return context;
};