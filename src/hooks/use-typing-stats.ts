import { useState, useRef, useCallback, useEffect } from "react";
import type { VimMode } from "./use-vim-mode";

export function useTypingStats(mode: VimMode, activePane: "editor" | "ai") {
  const [wordCount, setWordCount] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [elapsed, setElapsed] = useState("0:00");

  // Accumulated typing time (only counts Insert mode)
  const accumulatedMs = useRef(0);
  const insertEnteredAt = useRef<number | null>(null);

  // Keystroke tracking for WPM
  const typedChars = useRef(0);

  // Track insert mode enter/exit to accumulate time (editor only)
  const isEditorInsert = mode === "insert" && activePane === "editor";
  useEffect(() => {
    if (isEditorInsert) {
      insertEnteredAt.current = Date.now();
    } else if (insertEnteredAt.current !== null) {
      accumulatedMs.current += Date.now() - insertEnteredAt.current;
      insertEnteredAt.current = null;
    }
  }, [isEditorInsert]);

  // Timer — ticks every second, only counts Insert mode time
  useEffect(() => {
    const interval = setInterval(() => {
      let totalMs = accumulatedMs.current;
      if (insertEnteredAt.current !== null) {
        totalMs += Date.now() - insertEnteredAt.current;
      }

      const totalSeconds = Math.floor(totalMs / 1000);
      const mins = Math.floor(totalSeconds / 60);
      const secs = totalSeconds % 60;
      setElapsed(`${mins}:${secs.toString().padStart(2, "0")}`);

      // Calculate WPM: (typed chars / 5) / minutes
      const totalMinutes = totalMs / 60000;
      if (totalMinutes >= 0.05) {
        setWpm(Math.round((typedChars.current / 5) / totalMinutes));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const updateContent = useCallback((text: string) => {
    const trimmed = text.trim();
    setWordCount(trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length);
  }, []);

  const recordKeystroke = useCallback((isError: boolean) => {
    if (!isError) {
      typedChars.current++;
    }
  }, []);

  return { wordCount, wpm, elapsed, updateContent, recordKeystroke };
}
