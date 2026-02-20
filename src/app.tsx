import { useState, useRef, useCallback, useEffect } from "react";
import { useRenderer } from "@opentui/react";
import type { TextareaRenderable } from "@opentui/core";
import { Editor } from "./components/editor";
import { AiPane, type AiMode } from "./components/ai-pane";
import { StatusBar } from "./components/status-bar";
import { useVimMode, type AiCommand } from "./hooks/use-vim-mode";
import { useTypingStats } from "./hooks/use-typing-stats";
import { useIdle } from "./hooks/use-idle";
import { DiscussSession } from "./ai/discuss";
import { triggerWhisper } from "./ai/whisper";
import { runReview } from "./ai/review";
import { runPolish } from "./ai/polish";
import type { ChatMessage } from "./components/chat-view";

type Pane = "editor" | "ai";

export function App() {
  const renderer = useRenderer();
  const textareaRef = useRef<TextareaRenderable>(null);
  const [activePane, setActivePane] = useState<Pane>("editor");
  const [aiMode, setAiMode] = useState<AiMode>("idle");
  const { isIdle, resetIdle } = useIdle(3000);

  // Chat state (discuss/unstuck)
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

  // Get current editor content
  const getEditorContent = useCallback(() => {
    try {
      return textareaRef.current?.plainText ?? "";
    } catch {
      return "";
    }
  }, []);

  // --- Chat handlers (Discuss / Unstuck) ---
  const handleChatSubmit = useCallback(
    async (text: string) => {
      if (isChatStreaming) return;

      // Add user message
      setChatMessages((prev) => [...prev, { role: "user", content: text }]);
      setChatStreamingContent("");
      setIsChatStreaming(true);

      try {
        if (!discussRef.current) {
          discussRef.current = new DiscussSession(
            aiMode === "unstuck" ? "unstuck" : "discuss"
          );
        }

        const fullText = await discussRef.current.sendMessage(
          text,
          (chunk) => setChatStreamingContent((prev) => prev + chunk),
          aiMode === "unstuck" ? getEditorContent() : undefined
        );

        // Move streaming content to messages
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
    [isChatStreaming, aiMode, getEditorContent]
  );

  // --- Command handler ---
  const handleCommand = useCallback(
    (command: AiCommand, selectedText?: string) => {
      selectedTextRef.current = selectedText;
      setAiMode(command);
      setActivePane("ai");

      // Reset state for the new mode
      if (command === "discuss" || command === "unstuck") {
        // Reset discuss session when switching modes
        if (
          discussRef.current &&
          ((command === "discuss" && aiMode === "unstuck") ||
            (command === "unstuck" && aiMode === "discuss"))
        ) {
          discussRef.current.reset();
          discussRef.current = null;
          setChatMessages([]);
        }
      }

      if (command === "review") {
        setOutputContent("");
        setIsOutputStreaming(true);
        const content = selectedText || getEditorContent();
        if (content.trim()) {
          runReview(content, (chunk) =>
            setOutputContent((prev) => prev + chunk)
          )
            .catch(() => setOutputContent("Error running review"))
            .finally(() => setIsOutputStreaming(false));
        } else {
          setOutputContent("Nothing to review — write something first.");
          setIsOutputStreaming(false);
        }
      }

      if (command === "polish") {
        setOutputContent("");
        setIsOutputStreaming(true);
        const content = selectedText || getEditorContent();
        if (content.trim()) {
          runPolish(content, (chunk) =>
            setOutputContent((prev) => prev + chunk)
          )
            .catch(() => setOutputContent("Error running polish"))
            .finally(() => setIsOutputStreaming(false));
        } else {
          setOutputContent("Nothing to polish — write something first.");
          setIsOutputStreaming(false);
        }
      }
    },
    [aiMode, getEditorContent]
  );

  const handleReset = useCallback(() => {
    setAiMode("idle");
    setActivePane("editor");
    // Don't reset discuss session — preserve conversation for re-entry
  }, []);

  const handleQuit = useCallback(() => {
    discussRef.current?.abort();
    renderer.destroy();
  }, [renderer]);

  // Derived: AI pane is visible when an AI command is active
  const aiPaneVisible = aiMode !== "idle";

  const handlePaneSwitch = useCallback(() => {
    // Only allow switching when AI pane is visible
    if (aiMode === "idle") return;
    setActivePane((p) => (p === "editor" ? "ai" : "editor"));
  }, [aiMode]);

  const { mode } = useVimMode({
    textareaRef,
    onCommand: handleCommand,
    onReset: handleReset,
    onQuit: handleQuit,
    onPaneSwitch: handlePaneSwitch,
  });

  const { wordCount, wpm, elapsed, updateContent, recordKeystroke } =
    useTypingStats(mode, activePane);

  const handleContentChange = useCallback(
    (text: string) => {
      updateContent(text);
    },
    [updateContent]
  );

  const handleKeystroke = useCallback(
    (isError: boolean) => {
      resetIdle();
      recordKeystroke(isError);
      // Clear whisper on new typing
      if (whisperText) {
        setWhisperText(null);
        if (whisperTimerRef.current) clearTimeout(whisperTimerRef.current);
      }
    },
    [resetIdle, recordKeystroke, whisperText]
  );

  // --- Whisper trigger ---
  useEffect(() => {
    if (!isIdle || mode !== "normal") return;
    // Don't whisper if user is in an active AI session
    if (aiMode !== "idle" && aiMode !== "whisper") return;

    const content = getEditorContent();
    triggerWhisper(content, (text) => {
      setWhisperText(text);
      // Auto-clear after 10s
      if (whisperTimerRef.current) clearTimeout(whisperTimerRef.current);
      whisperTimerRef.current = setTimeout(() => setWhisperText(null), 10_000);
    });
  }, [isIdle, mode, aiMode, getEditorContent]);

  // Cleanup whisper timer
  useEffect(() => {
    return () => {
      if (whisperTimerRef.current) clearTimeout(whisperTimerRef.current);
    };
  }, []);

  return (
    <box
      style={{
        flexDirection: "column",
        width: "100%",
        height: "100%",
      }}
    >
      <box style={{ flexGrow: 1, flexDirection: "row" }}>
        <Editor
          textareaRef={textareaRef}
          inputFocused={activePane === "editor"}
          fullWidth={!aiPaneVisible}
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
      />
    </box>
  );
}
