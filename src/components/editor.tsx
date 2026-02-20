import React, { useEffect, type RefObject } from "react";
import type { TextareaRenderable } from "@opentui/core";
import { useTerminalDimensions } from "@opentui/react";

interface EditorProps {
  textareaRef: RefObject<TextareaRenderable | null>;
  inputFocused: boolean;
  fullWidth: boolean;
  onContentChange?: (text: string) => void;
  onKeystroke?: (isError: boolean) => void;
}

export function Editor({ textareaRef, inputFocused, fullWidth, onContentChange, onKeystroke }: EditorProps) {
  const { height } = useTerminalDimensions();

  // Disable cursor blinking to match user's terminal config
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.cursorStyle = { blinking: false };
    }
  }, [textareaRef]);

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

  // Vertical offset: start writing at ~1/3 down when full-width
  const topPad = fullWidth ? Math.floor(height * 0.15) : 1;

  return (
    <box
      style={{
        flexGrow: fullWidth ? 1 : undefined,
        width: fullWidth ? undefined : "65%",
        flexDirection: "column",
      }}
    >
      <box
        style={{
          flexGrow: 1,
          flexDirection: "row",
          justifyContent: fullWidth ? "center" : undefined,
          paddingTop: topPad,
          paddingBottom: topPad,
        }}
      >
        <textarea
          ref={textareaRef as React.RefObject<TextareaRenderable>}
          focused={inputFocused}
          placeholder="Start writing..."
          style={{
            flexGrow: fullWidth ? undefined : 1,
            maxWidth: fullWidth ? 64 : undefined,
            width: fullWidth ? 64 : undefined,
          }}
        />
      </box>
    </box>
  );
}
