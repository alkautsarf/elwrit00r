import { streamQuery } from "./client";
import { PROMPTS } from "./prompts";

export async function runPolish(
  content: string,
  onChunk: (text: string) => void
): Promise<string> {
  const result = await streamQuery({
    prompt: content,
    systemPrompt: PROMPTS.polish,
    onChunk,
  });
  return result.fullText;
}
