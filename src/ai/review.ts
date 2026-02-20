import { streamQuery } from "./client";
import { PROMPTS } from "./prompts";

export async function runReview(
  content: string,
  onChunk: (text: string) => void
): Promise<string> {
  const result = await streamQuery({
    prompt: content,
    systemPrompt: PROMPTS.review,
    onChunk,
  });
  return result.fullText;
}
