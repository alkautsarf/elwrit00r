import { useState, useEffect, useCallback } from "react";
import { useKeyboard } from "@opentui/react";
import { readdir, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { theme } from "../theme";

interface SidebarProps {
  visible: boolean;
  focused: boolean;
  writingsDir: string;
  currentFile: string | null;
  refreshKey?: number;
  onOpen: (filePath: string) => void;
  onNew: () => void;
  onClose: () => void;
}

interface SidebarEntry {
  name: string;
  path: string;
  modified: Date;
}

export function Sidebar({ visible, focused, writingsDir, currentFile, refreshKey, onOpen, onNew, onClose }: SidebarProps) {
  const [files, setFiles] = useState<SidebarEntry[]>([]);
  const [cursor, setCursor] = useState(0);

  const loadFiles = useCallback(async () => {
    try {
      const entries = await readdir(writingsDir);
      const mdFiles = entries.filter((e) => e.endsWith(".md"));
      const fileEntries: SidebarEntry[] = await Promise.all(
        mdFiles.map(async (name) => {
          const filePath = resolve(writingsDir, name);
          const s = await stat(filePath);
          return { name, path: filePath, modified: s.mtime };
        })
      );
      fileEntries.sort((a, b) => b.modified.getTime() - a.modified.getTime());
      setFiles(fileEntries);
    } catch {
      setFiles([]);
    }
  }, [writingsDir]);

  useEffect(() => {
    if (visible) loadFiles();
  }, [visible, loadFiles, refreshKey]);

  useKeyboard((key) => {
    if (!focused) return;
    key.preventDefault();

    switch (key.name) {
      case "j":
        setCursor((c) => Math.min(c + 1, files.length - 1));
        break;
      case "k":
        setCursor((c) => Math.max(c - 1, 0));
        break;
      case "return":
        if (files[cursor]) onOpen(files[cursor].path);
        break;
      case "n":
        onNew();
        break;
      case "escape":
        onClose();
        break;
      case "b":
        if (key.ctrl) onClose();
        break;
    }
  });

  return (
    <box
      visible={visible}
      style={{
        width: 24,
        flexDirection: "column",
        paddingTop: 1,
        paddingLeft: 1,
        paddingRight: 1,
      }}
    >
      <text fg={theme.fgFaint}>writings</text>
      <box style={{ height: 1 }} />
      {files.map((file, i) => {
        const isSelected = i === cursor && focused;
        const isCurrent = file.path === currentFile;
        return (
          <text
            key={file.path}
            fg={isSelected ? theme.blue : isCurrent ? theme.green : theme.fg}
          >
            {isSelected ? ">" : " "} {file.name.replace(/\.md$/, "")}
          </text>
        );
      })}
      {files.length === 0 ? (
        <text fg={theme.fgFaint}>empty</text>
      ) : null}
    </box>
  );
}
