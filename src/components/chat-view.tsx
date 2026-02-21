import { useEffect, useRef, useCallback } from "react";
import type { TextareaRenderable } from "@opentui/core";
import { theme } from "../theme";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatViewProps {
  messages: ChatMessage[];
  streamingContent: string;
  isStreaming: boolean;
  inputFocused: boolean;
  onSubmit: (text: string) => void;
}

export function ChatView({
  messages,
  streamingContent,
  isStreaming,
  inputFocused,
  onSubmit,
}: ChatViewProps) {
  const inputRef = useRef<TextareaRenderable>(null);

  // Disable cursor blinking on the chat input
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.cursorStyle = { blinking: false };
    }
  }, []);

  const handleSubmit = useCallback(() => {
    if (!inputRef.current || isStreaming) return;
    try {
      const text = inputRef.current.plainText?.trim();
      if (text) {
        onSubmit(text);
        inputRef.current.clear();
      }
    } catch {
      // Buffer may be destroyed
    }
  }, [isStreaming, onSubmit]);

  // Build a unified message list including streaming content
  type DisplayMessage = ChatMessage & { faint?: boolean };
  const displayMessages: DisplayMessage[] = [...messages];
  if (isStreaming) {
    displayMessages.push({
      role: "assistant",
      content: streamingContent || "thinking...",
      faint: !streamingContent,
    });
  }

  return (
    <box style={{ flexDirection: "column", flexGrow: 1 }}>
      {/* Chat thread */}
      <scrollbox
        style={{ flexGrow: 1 }}
        stickyScroll
        stickyStart="bottom"
      >
        <box style={{ flexDirection: "column", gap: 1, padding: 1 }}>
          {displayMessages.map((msg, i) => (
            <box key={i} style={{ flexDirection: "column" }}>
              <text fg={msg.role === "user" ? theme.blue : msg.faint ? theme.fgFaint : theme.fg}>
                {msg.role === "user" ? "> " : ""}
                {msg.content}
              </text>
            </box>
          ))}
        </box>
      </scrollbox>

      {/* Input — multi-line textarea, Enter to submit */}
      <box style={{ flexDirection: "row", height: 3, paddingLeft: 1, paddingRight: 2 }}>
        <text fg={theme.fgFaint} style={{ flexShrink: 0 }}>{"> "}</text>
        <textarea
          ref={inputRef}
          placeholder={isStreaming ? "waiting..." : "type here..."}
          focused={inputFocused && !isStreaming}
          style={{
            flexGrow: 1,
            height: 3,
          }}
          keyBindings={[
            { name: "return", action: "submit" },
          ]}
          onSubmit={handleSubmit}
        />
      </box>
    </box>
  );
}

export type { ChatMessage };
