import { streamQuery } from "./client";
import type { Lesson } from "../lib/course-content";

const FEEDBACK_SYSTEM = `You are a writing teacher inside a terminal writing app. You evaluate writing exercises.

Be encouraging but specific. Point out what the student got right and what needs work. Use checkmarks (✓) for correct items and circles (○) for items that need improvement.

Keep feedback concise — 3-5 bullet points max. End with a score out of 3 (1 = needs work, 2 = good effort, 3 = nailed it).

When pointing out mistakes, show the corrected version so the student can see the difference. For example: "You wrote X — it should be Y because Z."
CRITICAL: Do not include a title or heading like "Feedback" — jump straight into the bullet points.`;

export async function runExerciseFeedback(
  lesson: Lesson,
  attempt: string,
  onChunk: (text: string) => void
): Promise<string> {
  const prompt = `Lesson: "${lesson.title}"

Lesson principle: ${lesson.feedbackPrompt}

Exercise prompt: ${lesson.exercisePrompt}

${lesson.exerciseText ? `Original text to fix:\n${lesson.exerciseText}\n\n` : ""}Student's attempt:
---
${attempt}
---

Evaluate this attempt against the lesson principle.`;

  const result = await streamQuery({
    prompt,
    systemPrompt: FEEDBACK_SYSTEM,
    onChunk,
  });
  return result.fullText;
}
