import { useState, useRef, useCallback, useEffect } from "react";
import { useRenderer } from "@opentui/react";
import type { TextareaRenderable, InputRenderable, ScrollBoxRenderable } from "@opentui/core";
import { writeFile, readFile } from "node:fs/promises";
import { resolve, basename } from "node:path";
import { Editor } from "./components/editor";
import { AiPane, type AiMode } from "./components/ai-pane";
import { type PublishStatus } from "./components/publish-view";
import { loadConfig, getPublishConfig } from "./lib/config";
import { buildPayload, publishPost, unpublishPost, processImages, getApiKey } from "./lib/publish";
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
  noAi?: boolean;
}

export function App({ initialView, initialContent, filePath: initialFilePath, writingsDir, sessionFile, noAi }: AppProps) {
  const renderer = useRenderer();
  const textareaRef = useRef<TextareaRenderable>(null);
  const titleInputRef = useRef<InputRenderable>(null);
  const aiScrollRef = useRef<ScrollBoxRenderable>(null);
  const [view, setView] = useState<View>(initialView);
  const [activePane, setActivePane] = useState<Pane>("editor");
  const [aiMode, setAiMode] = useState<AiMode>("idle");
  const { isIdle, resetIdle } = useIdle(3000);

  // File state
  const currentFileRef = useRef<string | null>(initialFilePath ?? null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const saveStatusRef = useRef<SaveStatus>("saved");
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [sidebarRefreshKey, setSidebarRefreshKey] = useState(0);
  const [fileName, setFileName] = useState<string>(
    initialFilePath ? basename(initialFilePath) : ""
  );
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep saveStatusRef in sync with state for synchronous reads in closures
  const updateSaveStatus = useCallback((status: SaveStatus) => {
    saveStatusRef.current = status;
    setSaveStatus(status);
  }, []);

  // Cancel pending auto-save timer
  const cancelAutoSave = useCallback(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
  }, []);
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

  // Publish state
  const [publishStatus, setPublishStatus] = useState<PublishStatus>(null);
  const [publishResult, setPublishResult] = useState("");
  const [publishPayload, setPublishPayload] = useState<{ title: string; slug: string; excerpt: string; date: string; tags: string[] }>({ title: "", slug: "", excerpt: "", date: "", tags: [] });

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
    cancelAutoSave(); // Prevent save targeting old path during rename
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
  }, [cancelAutoSave]);

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

    // Don't save if editor is unmounted — ref is null, would write stale empty content
    if (!textareaRef.current) return;

    const content = getEditorContent();
    updateSaveStatus("saving");
    try {
      await writeFile(file, content, "utf-8");
      await writeFile(
        sessionFile,
        JSON.stringify({ filePath: file, title, lastModified: new Date().toISOString() }),
        "utf-8"
      );
      updateSaveStatus("saved");
      setSidebarRefreshKey((k) => k + 1);
    } catch {
      updateSaveStatus("modified");
    }
  }, [getEditorContent, sessionFile, title, updateSaveStatus]);

  // Cancel auto-save and flush pending changes if the current file is modified
  const flushIfModified = useCallback(async () => {
    cancelAutoSave();
    if (currentFileRef.current && saveStatusRef.current === "modified") {
      await saveFile();
    }
  }, [saveFile, cancelAutoSave]);

  const loadFile = useCallback(async (path: string) => {
    await flushIfModified();

    const derived = titleFromPath(path);
    setTitle(derived);

    try {
      const content = await readFile(path, "utf-8");
      currentFileRef.current = path;
      setFileName(basename(path));
      updateSaveStatus("saved");

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
  }, [flushIfModified, titleFromPath, updateSaveStatus]);

  // Auto-save: debounced 2s after content change
  const scheduleAutoSave = useCallback(() => {
    cancelAutoSave();
    autoSaveTimerRef.current = setTimeout(saveFile, 500);
  }, [saveFile, cancelAutoSave]);

  // Cleanup auto-save timer
  useEffect(() => {
    return () => cancelAutoSave();
  }, [cancelAutoSave]);

  // Create a new untitled file, flushing any pending changes first
  const createNewFile = useCallback(() => {
    flushIfModified();
    const id = Date.now().toString(36);
    const path = resolve(writingsDir, `untitled-${id}.md`);
    currentFileRef.current = path;
    setFileName(basename(path));
    setTitle("");
    setTitleFocused(true);
    updateSaveStatus("modified");
    return path;
  }, [writingsDir, flushIfModified, updateSaveStatus]);

  // --- File browser handlers ---
  const handleBrowserOpen = useCallback(async (path: string) => {
    await flushIfModified();

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
    updateSaveStatus("saved");
  }, [titleFromPath, flushIfModified, updateSaveStatus]);

  const handleBrowserNew = useCallback(() => {
    createNewFile();
    setView("editor");
  }, [createNewFile]);

  // --- Sidebar handlers ---
  const handleSidebarOpen = useCallback(async (path: string) => {
    await loadFile(path);
    setSidebarVisible(false);
    setActivePane("editor");
  }, [loadFile]);

  const handleSidebarNew = useCallback(() => {
    createNewFile();
    if (textareaRef.current) {
      textareaRef.current.clear();
    }
    setSidebarVisible(false);
    setActivePane("editor");
  }, [createNewFile]);

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

        const body = getEditorContent();
        const content = title ? `# ${title}\n\n${body}` : body;
        const fullText = await discussRef.current.sendMessage(
          text,
          (chunk) => setChatStreamingContent((prev) => prev + chunk),
          content
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
    [isChatStreaming, getEditorContent, title]
  );

  // --- Command handler ---
  const handleCommand = useCallback(
    (command: AiCommand, selectedText?: string) => {
      if (noAi) return;
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
    [getEditorContent, noAi]
  );

  const handleReset = useCallback(() => {
    setAiMode("idle");
    setActivePane("editor");
  }, []);

  const handleAcceptPolish = useCallback(() => {
    if (aiMode !== "polish" || isOutputStreaming || !outputContent) return;

    if (selectedTextRef.current === undefined) {
      textareaRef.current?.setText(outputContent);
    } else {
      const full = getEditorContent();
      const replaced = full.replace(selectedTextRef.current, outputContent);
      textareaRef.current?.setText(replaced);
    }

    scheduleAutoSave();
    setAiMode("idle");
    setActivePane("editor");
  }, [aiMode, isOutputStreaming, outputContent, getEditorContent, scheduleAutoSave]);

  const handleConfirmPublish = useCallback(async () => {
    if (publishStatus === "confirm") {
      setPublishStatus("publishing");
      try {
        const config = await loadConfig();
        const pubConfig = getPublishConfig(config);
        if (!pubConfig) {
          setPublishStatus("error");
          setPublishResult("No publish config found. Check ~/.config/elwrit00r/config.json");
          return;
        }
        const rawBody = getEditorContent();
        const slug = basename(currentFileRef.current ?? "", ".md");

        // Upload local images to Blob and replace paths with URLs
        let processedBody = rawBody;
        try {
          processedBody = await processImages(rawBody, pubConfig, getApiKey(pubConfig), slug);
        } catch {
          // Continue with original body if image processing fails
        }

        const payload = buildPayload(
          currentFileRef.current ?? "",
          title,
          processedBody,
          publishPayload.tags,
        );
        const result = await publishPost(pubConfig, payload);
        if (result.ok) {
          setPublishStatus("success");
          setPublishResult(`https://elpabl0.xyz/writing/${publishPayload.slug}`);
        } else {
          setPublishStatus("error");
          setPublishResult(result.error ?? "Unknown error");
        }
      } catch (e) {
        setPublishStatus("error");
        setPublishResult(e instanceof Error ? e.message : "Unknown error");
      }
    }
  }, [publishStatus, title, getEditorContent, publishPayload]);

  const handlePublish = useCallback(() => {
    // If already in confirm mode, trigger the actual publish
    if (aiMode === "publish" && publishStatus === "confirm") {
      handleConfirmPublish();
      return;
    }

    if (!currentFileRef.current || !title.trim()) return;
    const body = getEditorContent();
    if (!body.trim()) return;

    const slug = basename(currentFileRef.current, ".md");
    const sentences = body.replace(/\n+/g, " ").trim().match(/[^.!?]+[.!?]+/g) ?? [];
    const excerpt = sentences.slice(0, 2).join(" ").trim() || body.slice(0, 160);
    const date = new Date().toISOString().split("T")[0];

    // Parse tags from last review output if available
    // Claude may format as: `bio`, `identity` OR `bio` `identity` OR bio, identity
    const tagsMatch = outputContent.match(/\*\*Tags?:\*\*\s*(.+)/i);
    const tags = tagsMatch
      ? tagsMatch[1]
          .replace(/[`'"#*]/g, "")
          .split(/[,\s]+/)
          .map((t) => t.trim().toLowerCase().replace(/[^a-z0-9-]/g, ""))
          .filter(Boolean)
      : [];

    setPublishPayload({ title, slug, excerpt, date, tags });
    setPublishStatus("confirm");
    setPublishResult("");
    setAiMode("publish");
    setActivePane("ai");
  }, [aiMode, publishStatus, handleConfirmPublish, title, getEditorContent, outputContent]);

  const handleConfirmUnpublish = useCallback(async () => {
    if (!currentFileRef.current) return;
    setPublishStatus("unpublishing");
    try {
      const config = await loadConfig();
      const pubConfig = getPublishConfig(config);
      if (!pubConfig) {
        setPublishStatus("error");
        setPublishResult("No publish config found.");
        return;
      }
      const result = await unpublishPost(pubConfig, currentFileRef.current);
      if (result.ok) {
        setPublishStatus("success");
        setPublishResult(`Removed ${basename(currentFileRef.current, ".md")} from site`);
      } else {
        setPublishStatus("error");
        setPublishResult(result.error ?? "Unknown error");
      }
    } catch (e) {
      setPublishStatus("error");
      setPublishResult(e instanceof Error ? e.message : "Unknown error");
    }
  }, []);

  const handleUnpublish = useCallback(() => {
    if (!currentFileRef.current) return;

    // If already in confirm mode, do the actual unpublish
    if (aiMode === "publish" && publishStatus === "unpublish-confirm") {
      handleConfirmUnpublish();
      return;
    }

    const slug = basename(currentFileRef.current, ".md");
    setPublishPayload((prev) => ({ ...prev, slug }));
    setPublishStatus("unpublish-confirm");
    setPublishResult("");
    setAiMode("publish");
    setActivePane("ai");
  }, [aiMode, publishStatus, handleConfirmUnpublish]);

  const handleCheatsheet = useCallback(() => {
    setAiMode("cheatsheet");
    setActivePane("ai");
  }, []);

  const handlePreview = useCallback(() => {
    setAiMode("preview");
    setActivePane("ai");
  }, []);

  const handleBrowse = useCallback(async () => {
    await flushIfModified();
    setAiMode("idle");
    setSidebarVisible(false);
    setActivePane("editor");
    setView("browser");
  }, [flushIfModified]);

  const handleNewSession = useCallback(() => {
    if (noAi) return;
    discussRef.current?.abort();
    discussRef.current = null;
    setChatMessages([]);
    setChatStreamingContent("");
    setIsChatStreaming(false);
    setAiMode("idle");
    setActivePane("editor");
  }, [noAi]);

  const handleQuit = useCallback(async () => {
    cancelAutoSave();
    if (currentFileRef.current && getEditorContent().trim()) {
      try { await saveFile(); } catch { /* best effort */ }
    }
    discussRef.current?.abort();
    renderer.destroy();
    process.exit(0);
  }, [renderer, getEditorContent, saveFile, cancelAutoSave]);

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

  const handleScroll = useCallback((amount: number, unit: "line" | "viewport") => {
    if (unit === "viewport") {
      aiScrollRef.current?.scrollBy(amount, "viewport");
    } else {
      aiScrollRef.current?.scrollBy(amount * 3, "absolute");
    }
  }, []);

  const { mode, pendingKey } = useVimMode({
    textareaRef,
    titleInputRef,
    onCommand: handleCommand,
    onReset: handleReset,
    onAcceptPolish: handleAcceptPolish,
    onPublish: handlePublish,
    onUnpublish: handleUnpublish,
    onCheatsheet: handleCheatsheet,
    onPreview: handlePreview,
    onQuit: handleQuit,
    onBrowse: handleBrowse,
    onNewSession: handleNewSession,
    onPaneSwitch: handlePaneSwitch,
    onToggleSidebar: handleToggleSidebar,
    onTitleFocus: handleTitleFocus,
    onTitleBlur: handleTitleBlur,
    onScroll: handleScroll,
    activePane,
    titleFocused,
  });

  const { wordCount, wpm, elapsed, updateContent, recordKeystroke } =
    useTypingStats(mode, activePane === "editor" ? "editor" : "ai");

  const handleContentChange = useCallback(
    (text: string) => {
      updateContent(text);
      updateSaveStatus("modified");
      scheduleAutoSave();
    },
    [updateContent, scheduleAutoSave, updateSaveStatus]
  );

  const handleTitleChange = useCallback(
    (newTitle: string) => {
      setTitle(newTitle);
      updateSaveStatus("modified");
      renameFileForTitle(newTitle);
      scheduleAutoSave();
    },
    [renameFileForTitle, scheduleAutoSave, updateSaveStatus]
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
    if (noAi) return;
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
  }, [isIdle, mode, aiMode, getEditorContent, view, pendingKey, noAi]);

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
          whisperText={whisperText}
          onContentChange={handleContentChange}
          onKeystroke={handleKeystroke}
        />
        <AiPane
          visible={aiPaneVisible}
          focused={activePane === "ai"}
          mode={aiMode}
          vimMode={mode}
          scrollRef={aiScrollRef}
          chatMessages={chatMessages}
          chatStreamingContent={chatStreamingContent}
          isChatStreaming={isChatStreaming}
          onChatSubmit={handleChatSubmit}
          outputContent={outputContent}
          isOutputStreaming={isOutputStreaming}
          publishStatus={publishStatus}
          publishTitle={publishPayload.title}
          publishSlug={publishPayload.slug}
          publishExcerpt={publishPayload.excerpt}
          publishDate={publishPayload.date}
          publishTags={publishPayload.tags}
          publishResult={publishResult}
          previewContent={getEditorContent()}
        />
      </box>

      <StatusBar
        mode={mode}
        wpm={wpm}
        wordCount={wordCount}
        elapsed={elapsed}
        aiPaneVisible={aiPaneVisible}
        fileName={title || fileName}
        saveStatus={saveStatus}
        noAi={noAi}
      />
    </box>
  );
}
