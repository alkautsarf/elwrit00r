import { theme } from "../theme";
import type { VimMode } from "../hooks/use-vim-mode";
import type { SaveStatus } from "../app";

interface StatusBarProps {
  mode: VimMode;
  wpm: number;
  wordCount: number;
  elapsed: string;
  whisperText: string | null;
  aiPaneVisible: boolean;
  fileName?: string;
  saveStatus?: SaveStatus;
  noAi?: boolean;
}

const modeDisplay: Record<VimMode, { label: string; color: string }> = {
  normal: { label: "NORMAL", color: theme.blue },
  insert: { label: "INSERT", color: theme.green },
  visual: { label: "VISUAL", color: theme.purple },
};

export function StatusBar({ mode, wpm, wordCount, elapsed, whisperText, aiPaneVisible, fileName, saveStatus, noAi }: StatusBarProps) {
  const { label, color } = modeDisplay[mode];

  // Build left side as a single stable string
  const left = `-- ${label} --  ${wpm} wpm  ${wordCount} words  ${elapsed}`;

  // Center content: whisper > keybinding hints > nothing
  let centerText: string | null = null;
  if (!noAi && whisperText) {
    centerText = whisperText;
  } else if (!noAi && !aiPaneVisible && mode === "normal") {
    centerText = "spc: d discuss  r review  p polish";
  }

  // Right side: filename + save indicator
  let fileDisplay = "elwrit00r";
  if (fileName) {
    const name = fileName.replace(/\.md$/, "");
    let indicator = "";
    if (saveStatus === "modified") indicator = " [+]";
    else if (saveStatus === "saving") indicator = " ...";
    fileDisplay = `${name}${indicator}`;
  }

  return (
    <box
      style={{
        height: 1,
        overflow: "hidden",
        flexDirection: "row",
        paddingLeft: 1,
        paddingRight: 1,
      }}
    >
      <text fg={color} style={{ flexShrink: 0 }}>{left}</text>
      <box style={{ flexGrow: 1, overflow: "hidden", justifyContent: "center", flexDirection: "row" }}>
        {centerText ? <text fg={theme.fgFaint}>{centerText}</text> : null}
      </box>
      <text fg={theme.fgFaint} style={{ flexShrink: 0 }}>{fileDisplay}</text>
    </box>
  );
}
