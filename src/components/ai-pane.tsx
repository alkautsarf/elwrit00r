import type { RefObject } from "react";
import type { ScrollBoxRenderable } from "@opentui/core";
import { theme } from "../theme";
import { ChatView, type ChatMessage } from "./chat-view";
import { OutputView } from "./output-view";
import { PublishView, type PublishStatus } from "./publish-view";
import { getMarkdownStyle } from "../lib/markdown-style";
import type { VimMode } from "../hooks/use-vim-mode";

const CHEATSHEET = [
  ["HEADINGS", ""],
  ["# Heading 1", "Large heading"],
  ["## Heading 2", "Section heading"],
  ["### Heading 3", "Subsection"],
  ["", ""],
  ["TEXT", ""],
  ["**bold**", "Bold text"],
  ["*italic*", "Italic text"],
  ["`code`", "Inline code"],
  ["", ""],
  ["LISTS", ""],
  ["- item", "Bullet list"],
  ["1. item", "Numbered list"],
  ["", ""],
  ["BLOCKS", ""],
  ["> quote", "Blockquote"],
  ["```lang", "Code block (close with ```)"],
  ["---", "Horizontal divider"],
  ["", ""],
  ["LINKS & IMAGES", ""],
  ["[text](url)", "Hyperlink"],
  ["![alt](path)", "Image (local or URL)"],
];

export type AiMode = "idle" | "discuss" | "whisper" | "review" | "polish" | "publish" | "cheatsheet" | "preview";

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
  // Preview state
  previewContent: string;
}

const modeLabels: Record<AiMode, string> = {
  idle: "AI Companion",
  discuss: "Discuss",
  whisper: "AI Companion",
  review: "Review",
  polish: "Polish",
  publish: "Publish",
  cheatsheet: "Markdown",
  preview: "Preview",
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
  previewContent,
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
    if (mode === "cheatsheet") {
      const exampleMd = `## Example Output

**Bold text** and *italic text* with \`inline code\`.

> A blockquote looks like this.

- Bullet one
- Bullet two

1. Numbered one
2. Numbered two

\`\`\`lua
vim.opt.number = true
\`\`\`

---

A [link](https://example.com) in a sentence.`;

      return (
        <scrollbox ref={scrollRef} style={{ flexGrow: 1 }} stickyScroll stickyStart="bottom">
          <box style={{ padding: 1, flexDirection: "column", gap: 0 }}>
            <text fg={theme.blue}>SYNTAX</text>
            <text>{" "}</text>
            {CHEATSHEET.map(([syntax, desc], i) => {
              if (!syntax && !desc) return <text key={i}>{" "}</text>;
              if (!desc) return <text key={`h-${i}`} fg={theme.blue}>{syntax}</text>;
              return (
                <box key={i} style={{ flexDirection: "row" }}>
                  <text fg={theme.fg} style={{ width: 20 }}>{syntax}</text>
                  <text fg={theme.fgFaint}>{desc}</text>
                </box>
              );
            })}
            <text>{" "}</text>
            <text fg={theme.blue}>RENDERED OUTPUT</text>
            <text>{" "}</text>
            <markdown content={exampleMd} syntaxStyle={getMarkdownStyle()} conceal style={{ width: "100%" }} />
          </box>
        </scrollbox>
      );
    }
    if (mode === "preview") {
      return (
        <scrollbox ref={scrollRef} style={{ flexGrow: 1 }} stickyScroll stickyStart="bottom">
          <box style={{ padding: 1 }}>
            {previewContent ? (
              <markdown content={previewContent} syntaxStyle={getMarkdownStyle()} conceal style={{ width: "100%" }} />
            ) : (
              <text fg={theme.fgFaint}>Nothing to preview — write something first.</text>
            )}
          </box>
        </scrollbox>
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
