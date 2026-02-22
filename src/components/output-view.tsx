import type { RefObject } from "react";
import type { ScrollBoxRenderable } from "@opentui/core";
import { theme } from "../theme";
import { getMarkdownStyle } from "../lib/markdown-style";

interface OutputViewProps {
  label: string;
  content: string;
  isStreaming: boolean;
  scrollRef: RefObject<ScrollBoxRenderable | null>;
}

export function OutputView({ label, content, isStreaming, scrollRef }: OutputViewProps) {
  return (
    <box style={{ flexDirection: "column", flexGrow: 1 }}>
      <scrollbox
        ref={scrollRef}
        style={{ flexGrow: 1 }}
        stickyScroll
        stickyStart="bottom"
      >
        <box style={{ padding: 1 }}>
          {content ? (
            <markdown
              content={content}
              syntaxStyle={getMarkdownStyle()}
              streaming={isStreaming}
              conceal
              style={{ width: "100%" }}
            />
          ) : (
            <text fg={theme.fgFaint}>
              {isStreaming ? `${label}...` : `Waiting for content...`}
            </text>
          )}
        </box>
      </scrollbox>
    </box>
  );
}
