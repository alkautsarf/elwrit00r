import { streamQuery } from "./client";
import { PROMPTS } from "./prompts";

export async function runReview(
  content: string,
  onChunk: (text: string) => void
): Promise<string> {
  const result = await streamQuery({
    prompt: `Review the following writing:\n\n---\n${content}\n---`,
    systemPrompt: PROMPTS.review,
    onChunk,
  });
  return result.fullText;
}
