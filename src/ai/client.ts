import { query } from "@anthropic-ai/claude-agent-sdk";

const MODEL = "claude-opus-4-6";

interface StreamOptions {
  prompt: string;
  systemPrompt: string;
  onChunk: (text: string) => void;
  persist?: boolean;
  abortController?: AbortController;
}

interface StreamResult {
  fullText: string;
  sessionId: string;
}

/** One-shot streaming query — no tools, single turn */
export async function streamQuery({
  prompt,
  systemPrompt,
  onChunk,
  persist = false,
  abortController,
}: StreamOptions): Promise<StreamResult> {
  let fullText = "";
  let sessionId = "";

  for await (const msg of query({
    prompt,
    options: {
      model: MODEL,
      systemPrompt,
      tools: [],
      maxTurns: 1,
      persistSession: persist,
      permissionMode: "bypassPermissions",
      allowDangerouslySkipPermissions: true,
      includePartialMessages: true,
      abortController,
      thinking: { type: "adaptive" },
      effort: "high",
    },
  })) {
    if (msg.type === "system" && msg.subtype === "init") {
      sessionId = msg.session_id;
    }

    if (msg.type === "stream_event") {
      const ev = msg.event as any;
      if (ev.type === "content_block_delta" && ev.delta?.type === "text_delta") {
        const chunk = ev.delta.text as string;
        // Strip leading newlines from first chunk (adaptive thinking artifact)
        const clean = fullText === "" ? chunk.replace(/^\n+/, "") : chunk;
        if (clean) {
          fullText += clean;
          onChunk(clean);
        }
      }
    }

    if (msg.type === "result") {
      if (msg.subtype === "success") {
        const result = (msg.result || fullText).replace(/^\n+/, "");
        return { fullText: result, sessionId };
      }
      const errors = "errors" in msg ? (msg as any).errors : ["Unknown error"];
      throw new Error(`AI error: ${errors.join(", ")}`);
    }
  }

  return { fullText, sessionId };
}

/** Multi-turn streaming query — resumes an existing session */
export async function resumeQuery({
  prompt,
  systemPrompt,
  sessionId,
  onChunk,
  abortController,
}: StreamOptions & { sessionId: string }): Promise<StreamResult> {
  let fullText = "";

  for await (const msg of query({
    prompt,
    options: {
      model: MODEL,
      systemPrompt,
      tools: [],
      maxTurns: 1,
      resume: sessionId,
      persistSession: true,
      permissionMode: "bypassPermissions",
      allowDangerouslySkipPermissions: true,
      includePartialMessages: true,
      abortController,
      thinking: { type: "adaptive" },
      effort: "high",
    },
  })) {
    if (msg.type === "stream_event") {
      const ev = msg.event as any;
      if (ev.type === "content_block_delta" && ev.delta?.type === "text_delta") {
        const chunk = ev.delta.text as string;
        // Strip leading newlines from first chunk (adaptive thinking artifact)
        const clean = fullText === "" ? chunk.replace(/^\n+/, "") : chunk;
        if (clean) {
          fullText += clean;
          onChunk(clean);
        }
      }
    }

    if (msg.type === "result") {
      if (msg.subtype === "success") {
        const result = (msg.result || fullText).replace(/^\n+/, "");
        return { fullText: result, sessionId };
      }
      const errors = "errors" in msg ? (msg as any).errors : ["Unknown error"];
      throw new Error(`AI error: ${errors.join(", ")}`);
    }
  }

  return { fullText, sessionId };
}
