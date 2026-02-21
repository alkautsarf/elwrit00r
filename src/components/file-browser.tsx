import { useState, useEffect, useCallback } from "react";
import { useKeyboard, useTerminalDimensions } from "@opentui/react";
import { readdir, stat, unlink, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { theme } from "../theme";

interface FileEntry {
  name: string;
  path: string;
  wordCount: number;
  modified: Date;
  title: string;
}

interface FileBrowserProps {
  writingsDir: string;
  onOpen: (filePath: string) => void;
  onNew: () => void;
  onQuit: () => void;
}

function formatDate(d: Date): string {
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function FileBrowser({ writingsDir, onOpen, onNew, onQuit }: FileBrowserProps) {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [cursor, setCursor] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const { height } = useTerminalDimensions();

  const loadFiles = useCallback(async () => {
    try {
      const entries = await readdir(writingsDir);
      const mdFiles = entries.filter((e) => e.endsWith(".md"));
      const fileEntries: FileEntry[] = await Promise.all(
        mdFiles.map(async (name) => {
          const filePath = resolve(writingsDir, name);
          const s = await stat(filePath);
          let title = name.replace(/\.md$/, "").replace(/-/g, " ");
          let wordCount = 0;
          try {
            const content = await readFile(filePath, "utf-8");
            const trimmed = content.trim();
            wordCount = trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length;
          } catch { /* use filename fallback */ }
          return { name, path: filePath, wordCount, modified: s.mtime, title };
        })
      );
      fileEntries.sort((a, b) => b.modified.getTime() - a.modified.getTime());
      setFiles(fileEntries);
    } catch {
      setFiles([]);
    }
  }, [writingsDir]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  useKeyboard((key) => {
    key.preventDefault();

    // Delete confirmation state
    if (confirmDelete !== null) {
      if (key.name === "y") {
        const file = files[confirmDelete];
        if (file) {
          unlink(file.path).then(() => {
            setConfirmDelete(null);
            setCursor((c) => Math.min(c, files.length - 2));
            loadFiles();
          });
        }
      } else {
        setConfirmDelete(null);
      }
      return;
    }

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
      case "d":
        if (files[cursor]) setConfirmDelete(cursor);
        break;
      case "q":
        onQuit();
        break;
    }
  });

  const maxVisible = Math.max(height - 8, 3);
  const scrollOffset = Math.max(0, cursor - maxVisible + 1);
  const visibleFiles = files.slice(scrollOffset, scrollOffset + maxVisible);

  return (
    <box style={{ width: "100%", height: "100%", justifyContent: "center", flexDirection: "row" }}>
    <box style={{ flexDirection: "column", width: 60, paddingTop: 2 }}>
      <text fg={theme.fg}>elwrit00r</text>
      <text fg={theme.fgFaint}>{files.length} writings in ~/.elwrit00r/writings/</text>
      <box style={{ height: 1 }} />

      {files.length === 0 ? (
        <box style={{ flexDirection: "column", gap: 1 }}>
          <text fg={theme.fgFaint}>No writings yet.</text>
          <box style={{ flexDirection: "row" }}>
            <text fg={theme.fgFaint}>{"Press "}</text>
            <text fg={theme.green}>n</text>
            <text fg={theme.fgFaint}>{" to start writing."}</text>
          </box>
        </box>
      ) : (
        <box style={{ flexDirection: "column" }}>
          {visibleFiles.map((file, i) => {
            const idx = scrollOffset + i;
            const isSelected = idx === cursor;
            const isDeleting = confirmDelete === idx;

            const meta = `${file.wordCount}w  ${formatDate(file.modified)}`;
            return (
              <box key={file.path} style={{ flexDirection: "row", height: 1 }}>
                <text fg={isSelected ? theme.blue : theme.fg} style={{ flexGrow: 1, flexShrink: 1 }}>
                  {isSelected ? ">" : " "} {file.title}
                </text>
                {isDeleting ? (
                  <text fg={theme.red}> delete? y/n</text>
                ) : (
                  <text fg={theme.fgFaint}> {meta}</text>
                )}
              </box>
            );
          })}
        </box>
      )}

      <box style={{ flexGrow: 1 }} />
      <box style={{ height: 1, flexDirection: "row", gap: 1 }}>
        <text fg={theme.green}>n</text>
        <text fg={theme.fgFaint}>{"new  "}</text>
        <text fg={theme.blue}>enter</text>
        <text fg={theme.fgFaint}>{"open  "}</text>
        <text fg={theme.red}>d</text>
        <text fg={theme.fgFaint}>{"delete  "}</text>
        <text fg={theme.fgFaint}>q quit</text>
      </box>
    </box>
    </box>
  );
}
