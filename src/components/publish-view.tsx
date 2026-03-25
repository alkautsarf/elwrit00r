import { theme } from "../theme";

export type PublishStatus = "confirm" | "publishing" | "unpublish-confirm" | "unpublishing" | "success" | "error" | null;

interface PublishViewProps {
  status: PublishStatus;
  title: string;
  slug: string;
  excerpt: string;
  date: string;
  tags: string[];
  result: string;
}

export function PublishView({
  status,
  title,
  slug,
  excerpt,
  date,
  tags,
  result,
}: PublishViewProps) {
  if (status === "confirm") {
    return (
      <box style={{ flexDirection: "column", flexGrow: 1, padding: 1, gap: 1 }}>
        <text fg={theme.fgFaint}>Publishing to elpabl0.xyz</text>
        <box style={{ flexDirection: "column", gap: 0 }}>
          <text fg={theme.fgFaint}>{`Title:   ${title}`}</text>
          <text fg={theme.fgFaint}>{`Slug:    ${slug}`}</text>
          <text fg={theme.fgFaint}>{`Date:    ${date}`}</text>
          <text fg={theme.fgFaint}>{`Tags:    ${tags.length > 0 ? tags.join(", ") : "(none — run Space+r first)"}`}</text>
        </box>
        <box style={{ flexDirection: "column" }}>
          <text fg={theme.fgFaint}>Excerpt:</text>
          <text fg={theme.fg}>{excerpt}</text>
        </box>
        <box style={{ flexGrow: 1 }} />
        <text fg={theme.fgFaint}>Space+P to confirm · Escape to cancel</text>
      </box>
    );
  }

  if (status === "unpublish-confirm") {
    return (
      <box style={{ flexDirection: "column", flexGrow: 1, padding: 1, gap: 1 }}>
        <text fg={theme.fgFaint}>Unpublishing from elpabl0.xyz</text>
        <text fg={theme.fg}>{`Remove "${slug}" from the site?`}</text>
        <box style={{ flexGrow: 1 }} />
        <text fg={theme.fgFaint}>Space+U to confirm · Escape to cancel</text>
      </box>
    );
  }

  if (status === "publishing") {
    return (
      <box style={{ flexDirection: "column", flexGrow: 1, padding: 1, justifyContent: "center", alignItems: "center" }}>
        <text fg={theme.yellow}>Publishing...</text>
      </box>
    );
  }

  if (status === "unpublishing") {
    return (
      <box style={{ flexDirection: "column", flexGrow: 1, padding: 1, justifyContent: "center", alignItems: "center" }}>
        <text fg={theme.yellow}>Unpublishing...</text>
      </box>
    );
  }

  if (status === "success") {
    return (
      <box style={{ flexDirection: "column", flexGrow: 1, padding: 1, gap: 1 }}>
        <text fg={theme.green}>Published ✓</text>
        <text fg={theme.fgFaint}>{result}</text>
        <box style={{ flexGrow: 1 }} />
        <text fg={theme.fgFaint}>Escape to dismiss</text>
      </box>
    );
  }

  if (status === "error") {
    return (
      <box style={{ flexDirection: "column", flexGrow: 1, padding: 1, gap: 1 }}>
        <text fg={theme.red}>Publish failed</text>
        <text fg={theme.fgFaint}>{result}</text>
        <box style={{ flexGrow: 1 }} />
        <text fg={theme.fgFaint}>Escape to dismiss</text>
      </box>
    );
  }

  return null;
}
