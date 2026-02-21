import { useState, useCallback, useRef, type RefObject } from "react";
import { useKeyboard } from "@opentui/react";
import type { TextareaRenderable } from "@opentui/core";

export type VimMode = "normal" | "insert" | "visual";
export type AiCommand = "discuss" | "review" | "polish";

interface UseVimModeOptions {
  textareaRef: RefObject<TextareaRenderable | null>;
  onCommand: (command: AiCommand, selectedText?: string) => void;
  onReset: () => void;
  onQuit: () => void;
  onBrowse: () => void;
  onNewSession: () => void;
  onPaneSwitch: () => void;
  onToggleSidebar: () => void;
  onTitleFocus: () => void;
  onTitleBlur: () => void;
  titleFocused: boolean;
}

export function useVimMode({
  textareaRef,
  onCommand,
  onReset,
  onQuit,
  onBrowse,
  onNewSession,
  onPaneSwitch,
  onToggleSidebar,
  onTitleFocus,
  onTitleBlur,
  titleFocused,
}: UseVimModeOptions) {
  const [mode, setMode] = useState<VimMode>("normal");
  const yankRegister = useRef<string>("");
  const pendingKey = useRef<string | null>(null);

  const enterNormal = useCallback(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.editorView.resetSelection();
    }
    pendingKey.current = null;
    setMode("normal");
  }, [textareaRef]);

  const enterInsert = useCallback(() => {
    pendingKey.current = null;
    setMode("insert");
  }, []);

  const enterVisual = useCallback(() => {
    pendingKey.current = null;
    setMode("visual");
  }, []);

  useKeyboard((key) => {
    // Title input is focused — respect vim modes
    if (titleFocused) {
      if (mode === "normal") {
        key.preventDefault();
        switch (key.name) {
          case "j":
          case "return":
            onTitleBlur();
            break;
          case "i":
          case "a":
            enterInsert();
            break;
          case "escape":
            onTitleBlur();
            enterNormal();
            break;
          case "q":
            onQuit();
            break;
        }
      } else if (mode === "insert") {
        if (key.name === "escape") {
          key.preventDefault();
          enterNormal();
        }
        // All other keys pass through to the title input
      }
      return;
    }

    if (mode === "normal") {
      key.preventDefault();
      const ta = textareaRef.current;

      // --- Pending key sequences ---

      // Space leader → AI commands
      if (pendingKey.current === "space") {
        pendingKey.current = null;
        switch (key.name) {
          case "d": onCommand("discuss"); break;
          case "r": onCommand("review"); break;
          case "p": onCommand("polish"); break;
          case "n": onNewSession(); break;
          case "b": onBrowse(); break;
        }
        return;
      }

      // g prefix
      if (pendingKey.current === "g") {
        pendingKey.current = null;
        if (key.name === "g") ta?.gotoBufferHome();
        return;
      }

      // d prefix — delete motions
      if (pendingKey.current === "d") {
        pendingKey.current = null;
        switch (key.name) {
          case "d": ta?.deleteLine(); break;
          case "w":
          case "e": ta?.deleteWordForward(); break;
          case "b": ta?.deleteWordBackward(); break;
          case "$": ta?.deleteToLineEnd(); break;
          case "0": ta?.deleteToLineStart(); break;
        }
        return;
      }

      // y prefix — yank motions
      if (pendingKey.current === "y") {
        pendingKey.current = null;
        if (key.name === "y" && ta) {
          // yy — yank current line
          const cursor = ta.logicalCursor;
          const row = cursor.row;
          yankRegister.current = ta.getTextRangeByCoords(row, 0, row + 1, 0) || "";
        }
        return;
      }

      // --- Single keys ---

      switch (key.name) {
        // Cursor movement
        case "h": ta?.moveCursorLeft(); break;
        case "l": ta?.moveCursorRight(); break;
        case "j": ta?.moveCursorDown(); break;
        case "k":
          if (ta && ta.logicalCursor.row === 0) {
            onTitleFocus();
          } else {
            ta?.moveCursorUp();
          }
          break;
        case "w":
        case "e": ta?.moveWordForward(); break;
        case "b": ta?.moveWordBackward(); break;
        case "0": ta?.gotoLineHome(); break;
        case "^": ta?.gotoVisualLineHome(); break;
        case "$": ta?.gotoLineEnd(); break;
        case "g":
          if (key.shift) {
            ta?.gotoBufferEnd(); // G
          } else {
            pendingKey.current = "g"; // gg
          }
          break;

        // Insert mode entries
        case "i":
          if (key.shift) ta?.gotoLineHome(); // I
          enterInsert();
          break;
        case "a":
          if (key.shift) {
            ta?.gotoLineEnd(); // A
          } else {
            ta?.moveCursorRight(); // a
          }
          enterInsert();
          break;
        case "o":
          if (key.shift) {
            ta?.gotoLineHome(); // O — open line above
            ta?.insertText("\n");
            ta?.moveCursorUp();
          } else {
            ta?.gotoLineEnd(); // o — open line below
            ta?.insertText("\n");
          }
          enterInsert();
          break;

        // Editing
        case "x": ta?.deleteChar(); break;
        case "s":
          ta?.deleteChar();
          enterInsert();
          break;
        case "d":
          if (key.shift) {
            ta?.deleteToLineEnd(); // D
          } else {
            pendingKey.current = "d"; // dd, dw, d$, d0
          }
          break;
        case "c":
          if (key.shift) {
            ta?.deleteToLineEnd(); // C
            enterInsert();
          }
          break;

        // Undo/redo
        case "u": ta?.undo(); break;
        case "r":
          if (key.ctrl) ta?.redo(); // Ctrl+R
          break;

        // Sidebar toggle
        case "b":
          if (key.ctrl) onToggleSidebar(); // Ctrl+B
          break;

        // Visual mode
        case "v": enterVisual(); break;

        // Yank/paste
        case "y": pendingKey.current = "y"; break; // yy
        case "p":
          if (yankRegister.current) {
            ta?.insertText(yankRegister.current);
          }
          break;

        // Space leader → AI commands
        case "space": pendingKey.current = "space"; break;

        // Title focus (T = Shift+t)
        case "t":
          if (key.shift) onTitleFocus();
          break;

        // Pane switch
        case "tab": onPaneSwitch(); break;

        // Quit / reset
        case "q": onQuit(); break;
        case "escape": onReset(); break;
      }
      return;
    }

    if (mode === "insert") {
      if (key.name === "escape") {
        key.preventDefault();
        enterNormal();
      }
      return;
    }

    if (mode === "visual") {
      key.preventDefault();
      const ta = textareaRef.current;
      if (!ta) return;

      // Space leader → AI commands on selection
      if (pendingKey.current === "visual-space") {
        pendingKey.current = null;
        const selected = ta.getSelectedText();
        if (selected) {
          switch (key.name) {
            case "r": onCommand("review", selected); break;
            case "p": onCommand("polish", selected); break;
          }
        }
        enterNormal();
        return;
      }

      switch (key.name) {
        // Navigation — extend selection
        case "h": ta.moveCursorLeft({ select: true }); break;
        case "l": ta.moveCursorRight({ select: true }); break;
        case "j": ta.moveCursorDown({ select: true }); break;
        case "k": ta.moveCursorUp({ select: true }); break;
        case "w":
        case "e": ta.moveWordForward({ select: true }); break;
        case "b": ta.moveWordBackward({ select: true }); break;
        case "0": ta.gotoLineHome({ select: true }); break;
        case "^": ta.gotoVisualLineHome({ select: true }); break;
        case "$": ta.gotoLineEnd({ select: true }); break;
        case "g":
          if (key.shift) ta.gotoBufferEnd({ select: true }); // G
          break;

        // Yank (copy)
        case "y": {
          const selected = ta.getSelectedText();
          if (selected) yankRegister.current = selected;
          enterNormal();
          break;
        }
        // Paste (replace selection)
        case "p": {
          if (yankRegister.current) ta.insertText(yankRegister.current);
          enterNormal();
          break;
        }
        // Delete selection
        case "d":
        case "x": {
          const selected = ta.getSelectedText();
          if (selected) yankRegister.current = selected;
          ta.deleteChar();
          enterNormal();
          break;
        }
        // Change selection (delete + insert)
        case "c": {
          const selected = ta.getSelectedText();
          if (selected) yankRegister.current = selected;
          ta.deleteChar();
          enterInsert();
          break;
        }

        // Space leader → AI commands on selection
        case "space": pendingKey.current = "visual-space"; break;

        // Exit visual
        case "escape": enterNormal(); break;
      }
      return;
    }
  });

  return { mode, pendingKey };
}
