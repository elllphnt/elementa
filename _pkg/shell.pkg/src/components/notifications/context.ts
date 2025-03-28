import { createContext, useContext, useEffect } from "react";

export const NotificationContext = createContext<{
  title: string;
  setTitle: (title: string) => void;
  close: () => void;
} | null>(null);

export function useNotificationTitle(title: string) {
  const context = useContext(NotificationContext);

  useEffect(() => {
    context?.setTitle(title);
  }, [title]);
}
