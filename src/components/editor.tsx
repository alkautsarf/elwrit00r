import { useEffect, type RefObject } from "react";
import type { TextareaRenderable, InputRenderable } from "@opentui/core";
import { useTerminalDimensions } from "@opentui/react";
import { theme } from "../theme";

interface EditorProps {
  textareaRef: RefObject<TextareaRenderable | null>;
  titleInputRef: RefObject<InputRenderable | null>;
  inputFocused: boolean;
  titleFocused: boolean;
  fullWidth: boolean;
  title: string;
  whisperText?: string | null;
  onTitleChange?: (text: string) => void;
  onTitleBlur?: () => void;
  onContentChange?: (text: string) => void;
  onKeystroke?: (isError: boolean) => void;
}

export function Editor({
  textareaRef,
  titleInputRef,
  inputFocused,
  titleFocused,
  fullWidth,
  title,
  whisperText,
  onTitleChange,
  onTitleBlur,
  onContentChange,
  onKeystroke,
}: EditorProps) {
  const { height } = useTerminalDimensions();

  // Disable cursor blinking on both refs
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.cursorStyle = { blinking: false };
    }
    if (titleInputRef.current) {
      titleInputRef.current.cursorStyle = { blinking: false };
    }
  }, [textareaRef, titleInputRef]);

  // Track content changes and keystrokes
  useEffect(() => {
    let lastText = "";
    let lastLen = 0;

    const interval = setInterval(() => {
      if (!textareaRef.current) return;
      let current: string;
      try { current = textareaRef.current.plainText; } catch { return; }
      if (current !== lastText) {
        const isError = current.length < lastLen;
        lastText = current;
        lastLen = current.length;
        onContentChange?.(current);
        onKeystroke?.(isError);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [textareaRef, onContentChange, onKeystroke]);

  // Track title changes
  useEffect(() => {
    let lastTitle = title;

    const interval = setInterval(() => {
      if (!titleInputRef.current) return;
      let current: string;
      try { current = titleInputRef.current.value; } catch { return; }
      if (current !== lastTitle) {
        lastTitle = current;
        onTitleChange?.(current);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [titleInputRef, onTitleChange, title]);

  const topPad = fullWidth ? Math.floor(height * 0.15) : 1;
  const colWidth = fullWidth ? 64 : undefined;

  return (
    <box
      style={{
        flexGrow: fullWidth ? 1 : undefined,
        width: fullWidth ? undefined : "65%",
        flexDirection: "column",
      }}
    >
      {/* Top spacer with optional whisper */}
      <box style={{ height: topPad, justifyContent: "center", alignItems: "center" }}>
        {whisperText && fullWidth && (
          <text fg={theme.fgFaint}>{whisperText}</text>
        )}
      </box>

      {/* Content row (horizontal centering) */}
      <box
        style={{
          flexGrow: 1,
          flexDirection: "row",
          justifyContent: fullWidth ? "center" : undefined,
          paddingLeft: fullWidth ? undefined : 4,
        }}
      >
        <box
          style={{
            flexGrow: fullWidth ? undefined : 1,
            maxWidth: colWidth,
            width: colWidth,
            flexDirection: "column",
          }}
        >
          <input
            ref={titleInputRef as RefObject<InputRenderable>}
            focused={titleFocused}
            placeholder="Untitled"
            onSubmit={onTitleBlur}
          />
          <box style={{ height: 1 }} />
          <textarea
            ref={textareaRef as RefObject<TextareaRenderable>}
            focused={inputFocused}
            placeholder="Start writing..."
            style={{ flexGrow: 1 }}
          />
        </box>
      </box>

      {/* Bottom spacer */}
      <box style={{ height: topPad }} />
    </box>
  );
}
