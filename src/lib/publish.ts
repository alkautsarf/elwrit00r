import { execSync } from "node:child_process";
import { basename } from "node:path";
import type { PublishConfig } from "./config";

function getApiKey(config: PublishConfig): string {
  // 1. Direct key in config
  if (config.apiKey) return config.apiKey;

  // 2. Environment variable
  const envKey = process.env.ELWRIT00R_PUBLISH_KEY;
  if (envKey) return envKey;

  // 3. macOS Keychain
  if (process.platform === "darwin" && config.keychainService) {
    try {
      return execSync(
        `security find-generic-password -s "${config.keychainService}" -a "${config.keychainAccount}" -w 2>/dev/null`
      )
        .toString()
        .trim();
    } catch {
      // Fall through to error
    }
  }

  throw new Error(
    `API key not found. Set it using one of:\n` +
    `  1. "apiKey" in ~/.config/elwrit00r/config.json\n` +
    `  2. ELWRIT00R_PUBLISH_KEY environment variable\n` +
    `  3. macOS Keychain (macOS only): security add-generic-password -s "${config.keychainService}" -a "${config.keychainAccount}" -w "YOUR_KEY"`
  );
}

function deriveExcerpt(content: string): string {
  const clean = content.replace(/\n+/g, " ").trim();
  const sentences = clean.match(/[^.!?]+[.!?]+/g) ?? [];
  return sentences.slice(0, 2).join(" ").trim() || clean.slice(0, 160);
}

function deriveSlug(filePath: string): string {
  return basename(filePath, ".md");
}

export interface PublishPayload {
  slug: string;
  title: string;
  body: string;
  excerpt: string;
  date: string;
  tags: string[];
}

export function buildPayload(
  filePath: string,
  title: string,
  body: string,
  tags?: string[]
): PublishPayload {
  return {
    slug: deriveSlug(filePath),
    title,
    body,
    excerpt: deriveExcerpt(body),
    date: new Date().toISOString().split("T")[0],
    tags: tags ?? [],
  };
}

export async function publishPost(
  config: PublishConfig,
  payload: PublishPayload
): Promise<{ ok: boolean; error?: string }> {
  const apiKey = getApiKey(config);

  const res = await fetch(`${config.url}/publish`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text();
    return { ok: false, error: `HTTP ${res.status}: ${body}` };
  }

  return { ok: true };
}

export async function unpublishPost(
  config: PublishConfig,
  filePath: string
): Promise<{ ok: boolean; error?: string }> {
  const apiKey = getApiKey(config);
  const slug = deriveSlug(filePath);

  const res = await fetch(`${config.url}/unpublish`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ slug }),
  });

  if (!res.ok) {
    const body = await res.text();
    return { ok: false, error: `HTTP ${res.status}: ${body}` };
  }

  return { ok: true };
}
