import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { homedir } from "node:os";

const CONFIG_DIR = join(homedir(), ".config", "elwrit00r");
const CONFIG_PATH = join(CONFIG_DIR, "config.json");

export interface PublishConfig {
  url: string;
  apiKey?: string;
  keychainService: string;
  keychainAccount: string;
}

interface Config {
  publish?: PublishConfig;
}

const DEFAULT_CONFIG: Config = {
  publish: {
    url: "https://elpabl0.xyz/api/writing",
    keychainService: "elpabl0.publish-key",
    keychainAccount: "publish-key",
  },
};

export async function loadConfig(): Promise<Config> {
  try {
    const raw = await readFile(CONFIG_PATH, "utf-8");
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export async function initConfig(): Promise<void> {
  try {
    await readFile(CONFIG_PATH, "utf-8");
  } catch {
    await mkdir(CONFIG_DIR, { recursive: true });
    await writeFile(CONFIG_PATH, JSON.stringify(DEFAULT_CONFIG, null, 2) + "\n");
  }
}

export function getPublishConfig(config: Config): PublishConfig | null {
  return config.publish ?? null;
}
