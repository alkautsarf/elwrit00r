import { theme } from "../theme";
import type { VimMode } from "../hooks/use-vim-mode";

interface StatusBarProps {
  mode: VimMode;
  wpm: number;
  wordCount: number;
  elapsed: string;
  whisperText: string | null;
  aiPaneVisible: boolean;
}

const modeDisplay: Record<VimMode, { label: string; color: string }> = {
  normal: { label: "NORMAL", color: theme.blue },
  insert: { label: "INSERT", color: theme.green },
  visual: { label: "VISUAL", color: theme.purple },
};

export function StatusBar({ mode, wpm, wordCount, elapsed, whisperText, aiPaneVisible }: StatusBarProps) {
  const { label, color } = modeDisplay[mode];

  // Center content: whisper > keybinding hints > nothing
  let centerText: string | null = null;
  if (whisperText) {
    centerText = whisperText;
  } else if (!aiPaneVisible && mode === "normal") {
    centerText = "spc: d discuss  u unstuck  r review  p polish";
  }

  return (
    <box
      style={{
        height: 1,
        flexDirection: "row",
        gap: 2,
        paddingLeft: 1,
        paddingRight: 1,
      }}
    >
      <text fg={color}>-- {label} --</text>
      <text fg={theme.statusFg}>{wpm} wpm</text>
      <text fg={theme.statusFg}>{wordCount} words</text>
      <text fg={theme.statusFg}>{elapsed}</text>
      <box style={{ flexGrow: 1, justifyContent: "center", flexDirection: "row" }}>
        {centerText ? <text fg={theme.fgFaint}>{centerText}</text> : null}
      </box>
      <text fg={theme.fgFaint}>elwrit00r</text>
    </box>
  );
}
