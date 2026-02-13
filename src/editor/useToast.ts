import { useState, useCallback, useRef } from "react";

export interface Toast {
  message: string;
  type: "success" | "error" | "info";
}

export function useToast(duration = 2000) {
  const [toast, setToast] = useState<Toast | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const show = useCallback(
    (message: string, type: Toast["type"] = "info") => {
      clearTimeout(timerRef.current);
      setToast({ message, type });
      timerRef.current = setTimeout(() => setToast(null), duration);
    },
    [duration]
  );

  return { toast, show };
}
