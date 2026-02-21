import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { readFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { existsSync } from "node:fs";
import { App } from "./app";
import pkg from "../package.json";

// Parse args
const args = process.argv.slice(2);

if (args.includes("--version") || args.includes("-v")) {
  console.log(`elwrit00r v${pkg.version}`);
  process.exit(0);
}

const HOME = process.env.HOME || process.env.USERPROFILE || ".";
const WRITINGS_DIR = resolve(HOME, ".elwrit00r", "writings");
const SESSION_FILE = resolve(HOME, ".elwrit00r", "session.json");

// Ensure directory exists
await mkdir(WRITINGS_DIR, { recursive: true });
const isNew = args.includes("--new");
const fileArg = args.find((a) => !a.startsWith("--"));

let initialView: "browser" | "editor" = "browser";
let initialContent = "";
let filePath: string | undefined;

if (fileArg) {
  filePath = resolve(fileArg);
  initialView = "editor";
  if (existsSync(filePath)) {
    initialContent = await readFile(filePath, "utf-8");
  }
} else if (isNew) {
  const id = Date.now().toString(36);
  filePath = resolve(WRITINGS_DIR, `untitled-${id}.md`);
  initialView = "editor";
}

const renderer = await createCliRenderer({ exitOnCtrlC: false });
createRoot(renderer).render(
  <App
    initialView={initialView}
    initialContent={initialContent}
    filePath={filePath}
    writingsDir={WRITINGS_DIR}
    sessionFile={SESSION_FILE}
  />
);
