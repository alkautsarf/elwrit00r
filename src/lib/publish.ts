import { execSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { basename, resolve, extname } from "node:path";
import { homedir } from "node:os";
import type { PublishConfig } from "./config";

export function getApiKey(config: PublishConfig): string {
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

async function uploadImage(
  config: PublishConfig,
  apiKey: string,
  localPath: string,
  slug: string,
): Promise<string> {
  // Resolve ~ and relative paths
  const resolved = localPath.startsWith("~")
    ? resolve(homedir(), localPath.slice(2))
    : resolve(localPath);

  const ext = extname(resolved) || ".png";
  const fileName = `${slug}-${Date.now()}${ext}`;
  const fileData = await readFile(resolved);
  const file = new File([new Uint8Array(fileData)], fileName);

  const formData = new FormData();
  formData.append("file", file);
  formData.append("pathname", `writing/${fileName}`);

  // Derive upload URL from the config URL (sibling to /publish)
  const uploadUrl = config.url.replace(/\/writing$/, "") + "/upload";

  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Image upload failed: HTTP ${res.status}`);
  }

  const result = await res.json() as { ok: boolean; url: string };
  return result.url;
}

export async function processImages(
  body: string,
  config: PublishConfig,
  apiKey: string,
  slug: string,
): Promise<string> {
  // Match ![alt](path) or ![alt]('path') or ![alt]("path")
  const imageRegex = /!\[([^\]]*)\]\(['"]?([^'")\n]+)['"]?\)/g;
  let processed = body;
  const matches = [...body.matchAll(imageRegex)];

  for (const match of matches) {
    const [fullMatch, alt, rawPath] = match;
    const path = rawPath.trim();
    // Skip URLs — only upload local paths
    if (path.startsWith("http://") || path.startsWith("https://")) continue;

    try {
      const blobUrl = await uploadImage(config, apiKey, path, slug);
      processed = processed.replace(fullMatch, `![${alt}](${blobUrl})`);
    } catch {
      // Leave the original path if upload fails
    }
  }

  return processed;
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
