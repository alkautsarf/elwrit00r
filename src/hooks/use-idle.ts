import { useState, useRef, useCallback, useEffect } from "react";

export function useIdle(delayMs: number = 3000) {
  const [isIdle, setIsIdle] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetIdle = useCallback(() => {
    setIsIdle(false);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setIsIdle(true), delayMs);
  }, [delayMs]);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return { isIdle, resetIdle };
}
