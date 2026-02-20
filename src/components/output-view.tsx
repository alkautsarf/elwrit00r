import { theme } from "../theme";

interface OutputViewProps {
  label: string;
  content: string;
  isStreaming: boolean;
}

export function OutputView({ label, content, isStreaming }: OutputViewProps) {
  return (
    <box style={{ flexDirection: "column", flexGrow: 1 }}>
      <scrollbox
        style={{ flexGrow: 1 }}
        stickyScroll
        stickyStart="bottom"
      >
        <box style={{ padding: 1 }}>
          {content ? (
            <text fg={theme.fg}>{content}</text>
          ) : (
            <text fg={theme.fgFaint}>
              {isStreaming ? `${label}...` : `Press i to trigger ${label.toLowerCase()}`}
            </text>
          )}
        </box>
      </scrollbox>
    </box>
  );
}
