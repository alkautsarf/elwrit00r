import { streamQuery } from "./client";
import { PROMPTS } from "./prompts";

export async function runPolish(
  content: string,
  onChunk: (text: string) => void
): Promise<string> {
  const result = await streamQuery({
    prompt: `Polish the following writing:\n\n---\n${content}\n---`,
    systemPrompt: PROMPTS.polish,
    onChunk,
  });
  return result.fullText;
}
