import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { homedir } from "node:os";

const COURSE_PATH = join(homedir(), ".elwrit00r", "course.json");

export interface CourseProgress {
  completedLessons: string[];
  currentLesson: string | null;
  lastSessionAt: string | null;
}

const DEFAULT_PROGRESS: CourseProgress = {
  completedLessons: [],
  currentLesson: null,
  lastSessionAt: null,
};

export async function loadProgress(): Promise<CourseProgress> {
  try {
    const raw = await readFile(COURSE_PATH, "utf-8");
    return { ...DEFAULT_PROGRESS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export async function saveProgress(progress: CourseProgress): Promise<void> {
  await writeFile(COURSE_PATH, JSON.stringify(progress, null, 2) + "\n", "utf-8");
}
