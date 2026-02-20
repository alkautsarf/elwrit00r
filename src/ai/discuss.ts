import { streamQuery, resumeQuery } from "./client";
import { PROMPTS } from "./prompts";

export class DiscussSession {
  private sessionId: string | null = null;
  private abortController: AbortController | null = null;

  constructor(private mode: "discuss" | "unstuck" = "discuss") {}

  async sendMessage(
    userMessage: string,
    onChunk: (text: string) => void,
    editorContent?: string
  ): Promise<string> {
    // Cancel any in-flight request
    this.abort();
    this.abortController = new AbortController();

    const prompt =
      this.mode === "unstuck" && editorContent
        ? `Here's what I've written so far:\n\n---\n${editorContent}\n---\n\n${userMessage}`
        : userMessage;

    try {
      if (this.sessionId) {
        // Continue existing conversation
        const result = await resumeQuery({
          prompt,
          systemPrompt: PROMPTS[this.mode === "unstuck" ? "unstuck" : "discuss"],
          sessionId: this.sessionId,
          onChunk,
          abortController: this.abortController,
        });
        return result.fullText;
      } else {
        // Start new conversation
        const result = await streamQuery({
          prompt,
          systemPrompt: PROMPTS[this.mode === "unstuck" ? "unstuck" : "discuss"],
          onChunk,
          persist: true,
          abortController: this.abortController,
        });
        this.sessionId = result.sessionId;
        return result.fullText;
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return "";
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
