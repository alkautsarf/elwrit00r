import type { RefObject } from "react";
import type { ScrollBoxRenderable } from "@opentui/core";
import { theme } from "../theme";
import { getMarkdownStyle } from "../lib/markdown-style";
import { LEVELS, isLevelUnlocked, type Lesson } from "../lib/course-content";
import type { CourseProgress } from "../lib/course";

export type LearnPhase = "home" | "concept" | "example" | "exercise" | "feedback";

interface LearnViewProps {
  phase: LearnPhase;
  lesson: Lesson | null;
  feedback: string;
  isStreaming: boolean;
  progress: CourseProgress;
  selectedIndex: number;
  scrollRef: RefObject<ScrollBoxRenderable>;
}

export function LearnView({
  phase,
  lesson,
  feedback,
  isStreaming,
  progress,
  selectedIndex,
  scrollRef,
}: LearnViewProps) {
  if (phase === "home") {
    const totalLessons = LEVELS.reduce((sum, lvl) => sum + lvl.lessons.length, 0);
    const completed = progress.completedLessons.length;

    return (
      <scrollbox ref={scrollRef} style={{ flexGrow: 1 }}>
        <box style={{ padding: 1, flexDirection: "column", gap: 1 }}>
          <text fg={theme.fg}>Writing Course</text>
          <text fg={theme.fgFaint}>{`${completed} / ${totalLessons} completed`}</text>
          <text>{" "}</text>

          {(() => {
            let flatIdx = 0;
            return LEVELS.map((level, levelIdx) => {
              const unlocked = isLevelUnlocked(levelIdx, progress.completedLessons);
              return (
                <box key={level.name} style={{ flexDirection: "column" }}>
                  <text fg={unlocked ? theme.fg : theme.fgFaint}>
                    {`Level ${levelIdx}: ${level.name}`}
                  </text>
                  {level.lessons.map((l) => {
                    const idx = flatIdx++;
                    const done = progress.completedLessons.includes(l.id);
                    const isSelected = idx === selectedIndex;
                    const fg = isSelected ? theme.fg : (done ? theme.green : (unlocked ? theme.fgFaint : theme.border));
                    return (
                      <text key={l.id} fg={fg}>
                        {`${isSelected ? "▸ " : "  "}${done ? "●" : "○"} ${l.title}`}
                      </text>
                    );
                  })}
                  <text>{" "}</text>
                </box>
              );
            });
          })()}

          <text fg={theme.fgFaint}>j/k navigate · Space+L to start · Escape to close</text>
        </box>
      </scrollbox>
    );
  }

  if (phase === "concept" && lesson) {
    return (
      <scrollbox ref={scrollRef} style={{ flexGrow: 1 }} stickyScroll stickyStart="bottom">
        <box style={{ padding: 1, flexDirection: "column", gap: 1 }}>
          <text fg={theme.blue}>{`Lesson: ${lesson.title}`}</text>
          <text>{" "}</text>
          <markdown
            content={lesson.concept}
            syntaxStyle={getMarkdownStyle()}
            conceal
            style={{ width: "100%" }}
          />
          <text>{" "}</text>
          <text fg={theme.fgFaint}>Space+L to see examples</text>
        </box>
      </scrollbox>
    );
  }

  if (phase === "example" && lesson) {
    return (
      <scrollbox ref={scrollRef} style={{ flexGrow: 1 }} stickyScroll stickyStart="bottom">
        <box style={{ padding: 1, flexDirection: "column", gap: 1 }}>
          <text fg={theme.blue}>{`Lesson: ${lesson.title} — Examples`}</text>
          <text>{" "}</text>
          <markdown
            content={lesson.example}
            syntaxStyle={getMarkdownStyle()}
            conceal
            style={{ width: "100%" }}
          />
          <text>{" "}</text>
          <text fg={theme.fgFaint}>Space+L to start exercise</text>
        </box>
      </scrollbox>
    );
  }

  if (phase === "exercise" && lesson) {
    return (
      <box style={{ flexDirection: "column", flexGrow: 1, padding: 1, gap: 1 }}>
        <text fg={theme.blue}>{`Exercise: ${lesson.title}`}</text>
        <text>{" "}</text>
        <text fg={theme.fg}>{lesson.exercisePrompt}</text>
        <box style={{ flexGrow: 1 }} />
        <text fg={theme.fgFaint}>
          {lesson.exerciseType === "fix" || lesson.exerciseType === "cut"
            ? "Edit the text in the editor. Space+L to submit."
            : "Write your answer in the editor. Space+L to submit."}
        </text>
      </box>
    );
  }

  if (phase === "feedback") {
    return (
      <scrollbox ref={scrollRef} style={{ flexGrow: 1 }} stickyScroll stickyStart="bottom">
        <box style={{ padding: 1, flexDirection: "column", gap: 1 }}>
          <text fg={theme.blue}>Feedback</text>
          <text>{" "}</text>
          {feedback ? (
            <markdown
              content={feedback}
              syntaxStyle={getMarkdownStyle()}
              streaming={isStreaming}
              conceal
              style={{ width: "100%" }}
            />
          ) : (
            <text fg={theme.yellow}>Evaluating...</text>
          )}
          {!isStreaming && feedback && (
            <>
              <text>{" "}</text>
              <text fg={theme.fgFaint}>Space+L for next lesson · Escape to exit</text>
            </>
          )}
        </box>
      </scrollbox>
    );
  }

  return null;
}
