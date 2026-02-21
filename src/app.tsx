import { useState, useRef, useCallback, useEffect } from "react";
import { useRenderer } from "@opentui/react";
import type { TextareaRenderable, InputRenderable } from "@opentui/core";
import { writeFile, readFile } from "node:fs/promises";
import { resolve, basename } from "node:path";
import { Editor } from "./components/editor";
import { AiPane, type AiMode } from "./components/ai-pane";
import { StatusBar } from "./components/status-bar";
import { FileBrowser } from "./components/file-browser";
import { Sidebar } from "./components/sidebar";
import { useVimMode, type AiCommand } from "./hooks/use-vim-mode";
import { useTypingStats } from "./hooks/use-typing-stats";
import { useIdle } from "./hooks/use-idle";
import { DiscussSession } from "./ai/discuss";
import { triggerWhisper } from "./ai/whisper";
import { runReview } from "./ai/review";
import { runPolish } from "./ai/polish";
import type { ChatMessage } from "./components/chat-view";

type Pane = "editor" | "ai" | "sidebar";
type View = "browser" | "editor";
export type SaveStatus = "saved" | "modified" | "saving";

interface AppProps {
  initialView: View;
  initialContent?: string;
  filePath?: string;
  writingsDir: string;
  sessionFile: string;
}

export function App({ initialView, initialContent, filePath: initialFilePath, writingsDir, sessionFile }: AppProps) {
  const renderer = useRenderer();
  const textareaRef = useRef<TextareaRenderable>(null);
  const titleInputRef = useRef<InputRenderable>(null);
  const [view, setView] = useState<View>(initialView);
  const [activePane, setActivePane] = useState<Pane>("editor");
  const [aiMode, setAiMode] = useState<AiMode>("idle");
  const { isIdle, resetIdle } = useIdle(3000);

  // File state
  const currentFileRef = useRef<string | null>(initialFilePath ?? null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [sidebarRefreshKey, setSidebarRefreshKey] = useState(0);
  const [fileName, setFileName] = useState<string>(
    initialFilePath ? basename(initialFilePath) : ""
  );
  const [title, setTitle] = useState("");
  const [titleFocused, setTitleFocused] = useState(false);

  // Chat state (discuss)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatStreamingContent, setChatStreamingContent] = useState("");
  const [isChatStreaming, setIsChatStreaming] = useState(false);
  const discussRef = useRef<DiscussSession | null>(null);

  // Output state (review/polish)
  const [outputContent, setOutputContent] = useState("");
  const [isOutputStreaming, setIsOutputStreaming] = useState(false);

  // Whisper state
  const [whisperText, setWhisperText] = useState<string | null>(null);
  const whisperTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Selected text from Visual mode
  const selectedTextRef = useRef<string | undefined>(undefined);

  // Load initial content into textarea on mount
  useEffect(() => {
    if (initialContent && textareaRef.current) {
      textareaRef.current.setText(initialContent);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Get current editor content
  const getEditorContent = useCallback(() => {
    try {
      return textareaRef.current?.plainText ?? "";
    } catch {
      return "";
    }
  }, []);

  // Rename file based on title
  const renameFileForTitle = useCallback(async (newTitle: string) => {
    if (!newTitle.trim() || !currentFileRef.current) return;
    const slug = newTitle.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    if (!slug) return;
    const dir = resolve(currentFileRef.current, "..");
    const newPath = resolve(dir, `${slug}.md`);
    if (newPath === currentFileRef.current) return;

    // Rename old file if it exists
    try {
      const { rename } = await import("node:fs/promises");
      const { existsSync } = await import("node:fs");
      if (existsSync(currentFileRef.current)) {
        await rename(currentFileRef.current, newPath);
      }
    } catch { /* ignore — file might not exist yet */ }

    currentFileRef.current = newPath;
    setFileName(basename(newPath));
  }, []);

  // Derive title from filename slug (reverse of slugification)
  const titleFromPath = useCallback((path: string) => {
    const name = basename(path, ".md");
    if (name.startsWith("untitled-")) return "";
    return name.replace(/-/g, " ");
  }, []);

  // --- Save / Load ---
  const saveFile = useCallback(async () => {
    const file = currentFileRef.current;
    if (!file) return;

    setSaveStatus("saving");
    try {
      const content = getEditorContent();
      await writeFile(file, content, "utf-8");
      await writeFile(
        sessionFile,
        JSON.stringify({ filePath: file, title, lastModified: new Date().toISOString() }),
        "utf-8"
      );
      setSaveStatus("saved");
      setSidebarRefreshKey((k) => k + 1);
    } catch {
      setSaveStatus("modified");
    }
  }, [getEditorContent, sessionFile, title]);

  const loadFile = useCallback(async (path: string) => {
    // Save current file first
    if (currentFileRef.current && saveStatus === "modified") {
      await saveFile();
    }

    const derived = titleFromPath(path);
    setTitle(derived);

    try {
      const content = await readFile(path, "utf-8");
      currentFileRef.current = path;
      setFileName(basename(path));
      setSaveStatus("saved");

      if (textareaRef.current) {
        textareaRef.current.setText(content);
      }
      if (titleInputRef.current) {
        titleInputRef.current.value = derived;
      }
    } catch {
      // New file — just set the path
      currentFileRef.current = path;
      setFileName(basename(path));
      if (textareaRef.current) {
        textareaRef.current.clear();
      }
      if (titleInputRef.current) {
        titleInputRef.current.clear();
      }
    }
  }, [saveStatus, saveFile, titleFromPath]);

  // Auto-save: debounced 2s after content change
  const scheduleAutoSave = useCallback(() => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      saveFile();
    }, 2000);
  }, [saveFile]);

  // Cleanup auto-save timer
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, []);

  // --- File browser handlers ---
  const handleBrowserOpen = useCallback(async (path: string) => {
    currentFileRef.current = path;
    setFileName(basename(path));
    const derived = titleFromPath(path);
    setTitle(derived);
    try {
      const content = await readFile(path, "utf-8");
      setView("editor");
      // Need to wait for textarea/input to mount
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.setText(content);
        }
        if (titleInputRef.current) {
          titleInputRef.current.value = derived;
        }
      }, 50);
    } catch {
      setView("editor");
    }
    setSaveStatus("saved");
  }, [titleFromPath]);

  const handleBrowserNew = useCallback(() => {
    const id = Date.now().toString(36);
    const path = resolve(writingsDir, `untitled-${id}.md`);
    currentFileRef.current = path;
    setFileName(basename(path));
    setTitle("");
    setTitleFocused(true);
    setView("editor");
    setSaveStatus("modified");
  }, [writingsDir]);

  // --- Sidebar handlers ---
  const handleSidebarOpen = useCallback(async (path: string) => {
    await loadFile(path);
    setSidebarVisible(false);
    setActivePane("editor");
  }, [loadFile]);

  const handleSidebarNew = useCallback(() => {
    const id = Date.now().toString(36);
    const path = resolve(writingsDir, `untitled-${id}.md`);
    currentFileRef.current = path;
    setFileName(basename(path));
    setTitle("");
    setTitleFocused(true);
    if (textareaRef.current) {
      textareaRef.current.clear();
    }
    setSidebarVisible(false);
    setActivePane("editor");
    setSaveStatus("modified");
  }, [writingsDir]);

  const handleToggleSidebar = useCallback(() => {
    setSidebarVisible((v) => {
      setActivePane(v ? "editor" : "sidebar");
      return !v;
    });
  }, []);

  // --- Chat handler (Discuss) ---
  const handleChatSubmit = useCallback(
    async (text: string) => {
      if (isChatStreaming) return;

      setChatMessages((prev) => [...prev, { role: "user", content: text }]);
      setChatStreamingContent("");
      setIsChatStreaming(true);

      try {
        if (!discussRef.current) {
          discussRef.current = new DiscussSession();
        }

        const fullText = await discussRef.current.sendMessage(
          text,
          (chunk) => setChatStreamingContent((prev) => prev + chunk),
          getEditorContent()
        );

        setChatMessages((prev) => [
          ...prev,
          { role: "assistant", content: fullText },
        ]);
        setChatStreamingContent("");
      } catch (err) {
        setChatMessages((prev) => [
          ...prev,
          { role: "assistant", content: `Error: ${(err as Error).message}` },
        ]);
      } finally {
        setIsChatStreaming(false);
      }
    },
    [isChatStreaming, getEditorContent]
  );

  // --- Command handler ---
  const handleCommand = useCallback(
    (command: AiCommand, selectedText?: string) => {
      selectedTextRef.current = selectedText;
      setAiMode(command);
      setActivePane("ai");

      if (command === "review" || command === "polish") {
        setOutputContent("");
        setIsOutputStreaming(true);
        const content = selectedText || getEditorContent();
        if (!content.trim()) {
          setOutputContent(`Nothing to ${command} -- write something first.`);
          setIsOutputStreaming(false);
          return;
        }
        const run = command === "review" ? runReview : runPolish;
        run(content, (chunk) => setOutputContent((prev) => prev + chunk))
          .catch(() => setOutputContent(`Error running ${command}`))
          .finally(() => setIsOutputStreaming(false));
      }
    },
    [getEditorContent]
  );

  const handleReset = useCallback(() => {
    setAiMode("idle");
    setActivePane("editor");
  }, []);

  const handleBrowse = useCallback(async () => {
    // Save current file before switching to browser
    if (currentFileRef.current && saveStatus === "modified") {
      await saveFile();
    }
    setAiMode("idle");
    setSidebarVisible(false);
    setActivePane("editor");
    setView("browser");
  }, [saveStatus, saveFile]);

  const handleNewSession = useCallback(() => {
    discussRef.current?.abort();
    discussRef.current = null;
    setChatMessages([]);
    setChatStreamingContent("");
    setIsChatStreaming(false);
    setAiMode("idle");
    setActivePane("editor");
  }, []);

  const handleQuit = useCallback(async () => {
    // Auto-save on quit
    if (currentFileRef.current) {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      const content = getEditorContent();
      if (content.trim()) {
        try {
          await writeFile(currentFileRef.current, content, "utf-8");
          await writeFile(
            sessionFile,
            JSON.stringify({ filePath: currentFileRef.current, lastModified: new Date().toISOString() }),
            "utf-8"
          );
        } catch { /* best effort */ }
      }
    }
    discussRef.current?.abort();
    renderer.destroy();
    process.exit(0);
  }, [renderer, getEditorContent, sessionFile]);

  const aiPaneVisible = aiMode !== "idle";

  const handlePaneSwitch = useCallback(() => {
    if (sidebarVisible) {
      setActivePane((p) => p === "sidebar" ? "editor" : "sidebar");
      return;
    }
    if (aiMode === "idle") return;
    setActivePane((p) => (p === "editor" ? "ai" : "editor"));
  }, [aiMode, sidebarVisible]);

  const handleTitleFocus = useCallback(() => {
    setTitleFocused(true);
  }, []);

  const handleTitleBlur = useCallback(() => {
    setTitleFocused(false);
  }, []);

  const { mode, pendingKey } = useVimMode({
    textareaRef,
    onCommand: handleCommand,
    onReset: handleReset,
    onQuit: handleQuit,
    onBrowse: handleBrowse,
    onNewSession: handleNewSession,
    onPaneSwitch: handlePaneSwitch,
    onToggleSidebar: handleToggleSidebar,
    onTitleFocus: handleTitleFocus,
    onTitleBlur: handleTitleBlur,
    titleFocused,
  });

  const { wordCount, wpm, elapsed, updateContent, recordKeystroke } =
    useTypingStats(mode, activePane === "editor" ? "editor" : "ai");

  const handleContentChange = useCallback(
    (text: string) => {
      updateContent(text);
      setSaveStatus("modified");
      scheduleAutoSave();
    },
    [updateContent, scheduleAutoSave]
  );

  const handleTitleChange = useCallback(
    (newTitle: string) => {
      setTitle(newTitle);
      setSaveStatus("modified");
      renameFileForTitle(newTitle);
      scheduleAutoSave();
    },
    [renameFileForTitle, scheduleAutoSave]
  );

  const handleKeystroke = useCallback(
    (isError: boolean) => {
      resetIdle();
      recordKeystroke(isError);
      setWhisperText(null);
      if (whisperTimerRef.current) {
        clearTimeout(whisperTimerRef.current);
        whisperTimerRef.current = null;
      }
    },
    [resetIdle, recordKeystroke]
  );

  // --- Whisper trigger ---
  useEffect(() => {
    if (view !== "editor") return;
    if (!isIdle || mode !== "normal") return;
    if (aiMode !== "idle" && aiMode !== "whisper") return;
    if (pendingKey.current !== null) return;

    const content = getEditorContent();
    triggerWhisper(content, (text) => {
      setWhisperText(text);
      if (whisperTimerRef.current) clearTimeout(whisperTimerRef.current);
      whisperTimerRef.current = setTimeout(() => setWhisperText(null), 10_000);
    });
  }, [isIdle, mode, aiMode, getEditorContent, view, pendingKey]);

  useEffect(() => {
    return () => {
      if (whisperTimerRef.current) clearTimeout(whisperTimerRef.current);
    };
  }, []);

  // --- Browser view ---
  if (view === "browser") {
    return (
      <box style={{ width: "100%", height: "100%" }}>
        <FileBrowser
          writingsDir={writingsDir}
          onOpen={handleBrowserOpen}
          onNew={handleBrowserNew}
          onQuit={() => { renderer.destroy(); process.exit(0); }}
        />
      </box>
    );
  }

  // --- Editor view ---
  return (
    <box
      style={{
        flexDirection: "column",
        width: "100%",
        height: "100%",
      }}
    >
      <box style={{ flexGrow: 1, flexDirection: "row" }}>
        <Sidebar
          visible={sidebarVisible}
          focused={activePane === "sidebar"}
          writingsDir={writingsDir}
          currentFile={currentFileRef.current}
          refreshKey={sidebarRefreshKey}
          onOpen={handleSidebarOpen}
          onNew={handleSidebarNew}
          onClose={() => {
            setSidebarVisible(false);
            setActivePane("editor");
          }}
        />
        <Editor
          textareaRef={textareaRef}
          titleInputRef={titleInputRef}
          inputFocused={activePane === "editor" && !titleFocused}
          titleFocused={activePane === "editor" && titleFocused}
          fullWidth={!aiPaneVisible && !sidebarVisible}
          title={title}
          onTitleChange={handleTitleChange}
          onTitleBlur={() => setTitleFocused(false)}
          onContentChange={handleContentChange}
          onKeystroke={handleKeystroke}
        />
        <AiPane
          visible={aiPaneVisible}
          focused={activePane === "ai"}
          mode={aiMode}
          vimMode={mode}
          chatMessages={chatMessages}
          chatStreamingContent={chatStreamingContent}
          isChatStreaming={isChatStreaming}
          onChatSubmit={handleChatSubmit}
          outputContent={outputContent}
          isOutputStreaming={isOutputStreaming}
        />
      </box>

      <StatusBar
        mode={mode}
        wpm={wpm}
        wordCount={wordCount}
        elapsed={elapsed}
        whisperText={whisperText}
        aiPaneVisible={aiPaneVisible}
        fileName={title || fileName}
        saveStatus={saveStatus}
      />
    </box>
  );
}
