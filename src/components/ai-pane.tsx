import type { RefObject } from "react";
import type { ScrollBoxRenderable } from "@opentui/core";
import { theme } from "../theme";
import { ChatView, type ChatMessage } from "./chat-view";
import { OutputView } from "./output-view";
import { PublishView, type PublishStatus } from "./publish-view";
import type { VimMode } from "../hooks/use-vim-mode";

export type AiMode = "idle" | "discuss" | "whisper" | "review" | "polish" | "publish";

interface AiPaneProps {
  visible: boolean;
  focused: boolean;
  mode: AiMode;
  vimMode: VimMode;
  scrollRef: RefObject<ScrollBoxRenderable>;
  // Chat state (discuss)
  chatMessages: ChatMessage[];
  chatStreamingContent: string;
  isChatStreaming: boolean;
  onChatSubmit: (text: string) => void;
  // Output state (review/polish)
  outputContent: string;
  isOutputStreaming: boolean;
  // Publish state
  publishStatus: PublishStatus;
  publishTitle: string;
  publishSlug: string;
  publishExcerpt: string;
  publishDate: string;
  publishTags: string[];
  publishResult: string;
}

const modeLabels: Record<AiMode, string> = {
  idle: "AI Companion",
  discuss: "Discuss",
  whisper: "AI Companion",
  review: "Review",
  polish: "Polish",
  publish: "Publish",
};

export function AiPane({
  visible,
  focused,
  mode,
  vimMode,
  scrollRef,
  chatMessages,
  chatStreamingContent,
  isChatStreaming,
  onChatSubmit,
  outputContent,
  isOutputStreaming,
  publishStatus,
  publishTitle,
  publishSlug,
  publishExcerpt,
  publishDate,
  publishTags,
  publishResult,
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
          scrollRef={scrollRef}
        />
      );
    }
    if (mode === "review" || mode === "polish") {
      return (
        <OutputView
          label={mode === "review" ? "Reviewing" : "Polishing"}
          content={outputContent}
          isStreaming={isOutputStreaming}
          scrollRef={scrollRef}
          showAcceptHint={mode === "polish" && !isOutputStreaming && !!outputContent}
        />
      );
    }
    if (mode === "publish") {
      return (
        <PublishView
          status={publishStatus}
          title={publishTitle}
          slug={publishSlug}
          excerpt={publishExcerpt}
          date={publishDate}
          tags={publishTags}
          result={publishResult}
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
