import { streamQuery } from "./client";
import { PROMPTS } from "./prompts";

const RATE_LIMIT_MS = 45_000;
const MIN_CONTENT_LENGTH = 50;

let lastWhisperTime = 0;

export async function triggerWhisper(
  content: string,
  onResult: (text: string) => void
): Promise<void> {
  if (content.length < MIN_CONTENT_LENGTH) return;
  if (Date.now() - lastWhisperTime < RATE_LIMIT_MS) return;

  lastWhisperTime = Date.now();

  try {
    const result = await streamQuery({
      prompt: content,
      systemPrompt: PROMPTS.whisper,
      onChunk: () => {},
    });

    if (result.fullText.trim()) {
      onResult(result.fullText.trim());
    }
  } catch {
    // Fail silently
  }
}
