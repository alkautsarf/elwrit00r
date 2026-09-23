import { query, type HookCallback } from "@anthropic-ai/claude-agent-sdk";
import { homedir } from "node:os";
import { resolve } from "node:path";
import { MODEL, claudeCodePath, cleanEnv } from "./client";
import { PROMPTS } from "./prompts";

/**
 * Deny curl/wget to external hosts (the web goes through agent-browser).
 * A PreToolUse hook, not canUseTool: under bypassPermissions the SDK approves
 * every call before canUseTool is consulted, so a canUseTool guard never ran,
 * and SDK >= 0.3.198 prints a CLAUDE_SDK_CAN_USE_TOOL_SHADOWED warning to
 * stderr on every query, which lands on top of the TUI.
 * Matches curl/wget only in command position (start, or after ; & | ( ` $( ),
 * so `agent-browser open "https://curl.se"` or `grep -rn curl` still run.
 */
const FETCH_CMD = /(?:^|[;&|(`]|\$\()\s*(?:sudo\s+)?(?:curl|wget)\b/i;

const blockExternalFetch: HookCallback = async (input) => {
  if (input.hook_event_name !== "PreToolUse") return {};
  const cmd = String((input.tool_input as { command?: unknown } | null)?.command ?? "");
  if (FETCH_CMD.test(cmd) && !cmd.includes("127.0.0.1") && !cmd.includes("localhost")) {
    return {
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: "Use agent-browser to access the web, not curl/wget.",
      },
    };
  }
  return {};
};

export type DiscussEvent =
  | { type: "text"; content: string }
  | { type: "tool_use"; toolName: string; content: string }
  | { type: "done"; content: string }
  | { type: "error"; content: string };

const CWD = resolve(homedir(), "Documents", "elpabl0");

export class DiscussSession {
  private sessionId: string | null = null;
  private abortController: AbortController | null = null;

  async sendMessage(
    userMessage: string,
    onEvent: (event: DiscussEvent) => void,
    editorContent?: string,
  ): Promise<string> {
    this.abort();
    this.abortController = new AbortController();

    const prompt = editorContent?.trim()
      ? `Here's what I've written so far:\n\n---\n${editorContent}\n---\n\n${userMessage}`
      : userMessage;

    const isResume = !!this.sessionId;
    const options: Record<string, unknown> = {
      permissionMode: "bypassPermissions",
      allowDangerouslySkipPermissions: true,
      model: MODEL,
      env: cleanEnv(),
      cwd: CWD,
      abortController: this.abortController,
      includePartialMessages: true,
      thinking: { type: "adaptive" },
      effort: "high",
      settingSources: [],
      disallowedTools: ["Write", "Edit", "NotebookEdit"],
      hooks: { PreToolUse: [{ matcher: "Bash", hooks: [blockExternalFetch] }] },
      ...(claudeCodePath ? { pathToClaudeCodeExecutable: claudeCodePath } : {}),
    };

    // Same system prompt and tools on every turn: left unset on resume, the CLI
    // falls back to an empty system prompt and its full default toolset, and
    // on Opus 5.5 a changed tool list between turns discards earlier reasoning.
    options.systemPrompt = PROMPTS.discuss;
    options.tools = ["Bash", "Read", "Grep", "Glob", "WebSearch", "WebFetch"];
    if (isResume) {
      options.resume = this.sessionId;
    } else {
      options.persistSession = true;
    }

    try {
      let assistantText = "";
      const streaming = { text: "" };

      for await (const message of query({ prompt, options })) {
        if (message.type === "system" && (message as any).subtype === "init") {
          const sid = (message as any).session_id;
          if (sid) this.sessionId = sid;
        }

        if (message.type === "stream_event") {
          const ev = (message as any).event;
          if (ev?.type === "content_block_delta" && ev.delta?.type === "text_delta" && ev.delta.text) {
            // Strip leading newlines from first chunk (adaptive thinking artifact)
            const chunk = streaming.text === "" ? ev.delta.text.replace(/^\n+/, "") : ev.delta.text;
            if (chunk) {
              streaming.text += chunk;
              onEvent({ type: "text", content: streaming.text });
            }
          }
        }

        if (message.type === "assistant") {
          const content = (message as any).message?.content || [];
          const textParts = content.filter((b: any) => b.type === "text").map((b: any) => b.text);
          const fullText = textParts.join("\n").replace(/^\n+/, "");
          if (fullText) {
            assistantText = fullText;
            streaming.text = "";
          }

          const toolBlocks = content.filter((b: any) => b.type === "tool_use");
          for (const tool of toolBlocks) {
            const input = typeof tool.input === "string" ? tool.input : JSON.stringify(tool.input);
            onEvent({ type: "tool_use", toolName: tool.name, content: input.substring(0, 300) });
          }
        }

        if (message.type === "result") {
          streaming.text = "";
          const subtype = (message as any).subtype;
          if (subtype === "error_during_execution" || subtype === "error_max_turns") {
            const errors = (message as any).errors || ["Unknown error"];
            onEvent({ type: "error", content: errors.join(", ") });
          }
        }
      }

      // Use the last streaming text if no finalized assistant text was captured
      const finalText = (assistantText || streaming.text).replace(/^\n+/, "");
      onEvent({ type: "done", content: finalText });
      return finalText;
    } catch (err) {
      if ((err as Error).name === "AbortError") return "";
      onEvent({ type: "error", content: (err as Error).message });
      throw err;
    }
  }

  abort() {
    this.abortController?.abort();
    this.abortController = null;
  }

  reset() {
    this.abort();
    this.sessionId = null;
  }
}
