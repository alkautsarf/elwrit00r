import { theme } from "../theme";
import { ChatView, type ChatMessage } from "./chat-view";
import { OutputView } from "./output-view";
import type { VimMode } from "../hooks/use-vim-mode";

export type AiMode = "idle" | "discuss" | "whisper" | "review" | "polish";

interface AiPaneProps {
  visible: boolean;
  focused: boolean;
  mode: AiMode;
  vimMode: VimMode;
  // Chat state (discuss)
  chatMessages: ChatMessage[];
  chatStreamingContent: string;
  isChatStreaming: boolean;
  onChatSubmit: (text: string) => void;
  // Output state (review/polish)
  outputContent: string;
  isOutputStreaming: boolean;
}

const modeLabels: Record<AiMode, string> = {
  idle: "AI Companion",
  discuss: "Discuss",
  whisper: "AI Companion",
  review: "Review",
  polish: "Polish",
};

export function AiPane({
  visible,
  focused,
  mode,
  vimMode,
  chatMessages,
  chatStreamingContent,
  isChatStreaming,
  onChatSubmit,
  outputContent,
  isOutputStreaming,
}: AiPaneProps) {
  function renderContent() {
    if (mode === "discuss") {
      return (
        <ChatView
          messages={chatMessages}
          streamingContent={chatStreamingContent}
          isStreaming={isChatStreaming}
          inputFocused={focused && vimMode === "insert"}
          onSubmit={onChatSubmit}
        />
      );
    }
    if (mode === "review" || mode === "polish") {
      return (
        <OutputView
          label={mode === "review" ? "Reviewing" : "Polishing"}
          content={outputContent}
          isStreaming={isOutputStreaming}
        />
      );
    }
    return null;
  }

  return (
    <box
      visible={visible}
      style={{
        width: "35%",
        flexDirection: "column",
        border: true,
        borderColor: focused ? theme.borderFocused : theme.border,
      }}
      title={modeLabels[mode]}
      titleAlignment="left"
    >
      {renderContent()}
    </box>
  );
}
