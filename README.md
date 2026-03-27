# elwrit00r

Terminal writing app with vim keybindings and AI companion. Built with [OpenTUI](https://github.com/anthropics/opentui) + React + Bun.

## Features

- **Vim modal editing** -- Normal, Insert, and Visual modes with full cursor motions, yank/paste, and delete operations
- **AI companion** -- Discuss ideas, review drafts, and polish writing with Claude, plus idle whispers that nudge you forward
- **Learn mode** -- Interactive writing course with 36 lessons across 7 levels, from punctuation to web writing
- **Accept polish** -- Apply polished text directly back to the editor with Spc+a
- **Publish to your site** -- Publish and unpublish writing directly from the terminal via API
- **No-AI mode** -- `--no-ai` flag for pure distraction-free writing without any AI features
- **File management** -- Auto-saving drafts (500ms debounce) to `~/.elwrit00r/writings/`, file browser, sidebar for quick switching
- **Title-based naming** -- Title field that auto-renames the file slug as you type
- **Pane navigation** -- Tab to switch between editor and AI pane, j/k scroll AI pane when focused
- **Markdown output** -- AI review and polish responses rendered with syntax-highlighted markdown

## Screens

**File browser** -- Lists all writings sorted by last modified. j/k navigation, Enter to open, n for new, d to delete.

**Editor** -- Full-screen distraction-free writing with vim keybindings. Status bar shows mode, WPM, word count, and elapsed time.

**AI pane** -- Side panel for discuss (multi-turn chat), review (structured feedback), and polish (rewrite) modes. Ctrl+U/D for half-page scroll, j/k when focused via Tab.

## Install

```bash
brew tap alkautsarf/tap && brew install elwrit00r
```

Or from source:

```bash
bun install
```

## Usage

```bash
elwrit00r                # file browser
elwrit00r draft.md       # open specific file
elwrit00r --new          # fresh draft
elwrit00r --no-ai        # pure writing mode, no AI features
```

Or create an alias:

```bash
# Add to ~/.local/bin/elw
#!/bin/bash
ELW_DIR="$HOME/Documents/elwrit00r"
exec bun run "$ELW_DIR/src/index.tsx" "$@"
```

## Keybindings

| Screen  | Key       | Action              |
|---------|-----------|---------------------|
| Browser | j/k       | Navigate            |
| Browser | Enter     | Open file           |
| Browser | n         | New writing         |
| Browser | d         | Delete (confirm)    |
| Browser | l         | Learn mode          |
| Browser | q         | Quit                |
| Editor  | i/a/o     | Enter Insert mode   |
| Editor  | Esc       | Back to Normal      |
| Editor  | v         | Visual select       |
| Editor  | T         | Focus title         |
| Editor  | Tab       | Switch pane         |
| Editor  | Ctrl+B    | Toggle sidebar      |
| Editor  | Ctrl+U/D  | Scroll AI pane      |
| Editor  | Spc+d     | Discuss (AI chat)   |
| Editor  | Spc+r     | Review              |
| Editor  | Spc+p     | Polish              |
| Editor  | Spc+a     | Accept polish       |
| Editor  | Spc+P     | Publish to site     |
| Editor  | Spc+U     | Unpublish from site |
| Editor  | Spc+l     | Learn mode          |
| Editor  | Spc+v     | Markdown preview    |
| Editor  | Spc+,     | Markdown cheat sheet|
| Editor  | Spc+n     | New AI session      |
| Editor  | Spc+b     | Back (learn/browser)|
| Title   | h/l       | Cursor left/right   |
| Title   | w/b       | Word forward/back   |
| Title   | 0/$       | Line start/end      |
| Title   | x         | Delete character    |
| Editor  | q         | Quit                |

## Publishing

## Learning

elwrit00r includes a 36-lesson interactive writing course. Press `l` from the file browser or `Spc+l` from the editor to start.

**Levels:**
- Level 0: Grammar & Punctuation (6 lessons)
- Level 1: Sentence Craft (6 lessons)
- Level 2: Paragraphs & Structure (6 lessons)
- Level 3: Voice & Style (6 lessons)
- Level 4: Writing Forms (6 lessons)
- Level 5: Editing & Rewriting (3 lessons)
- Level 6: Writing for the Web (3 lessons)

Each lesson has concept, examples, an exercise, and AI-powered feedback. Levels are gated -- complete all lessons in a level to unlock the next. Progress is saved at `~/.elwrit00r/course.json`.

**Navigation:** j/k to browse lessons, Spc+l to start/advance, Spc+b to go back, Escape to exit.

## Publishing

elwrit00r can publish writing directly to any site with a compatible API. The publish flow: review your writing (Spc+r to generate tags), then Spc+P to publish.

### Setup

Create a config file at `~/.config/elwrit00r/config.json`:

```json
{
  "publish": {
    "url": "https://yoursite.com/api/writing",
    "keychainService": "yoursite.publish-key",
    "keychainAccount": "publish-key"
  }
}
```

Store your API key using one of these methods:

**Option 1: Config file** (any platform)

Add `"apiKey"` directly to your config:

```json
{
  "publish": {
    "url": "https://yoursite.com/api/writing",
    "apiKey": "YOUR_API_KEY"
  }
}
```

**Option 2: Environment variable** (any platform)

```bash
export ELWRIT00R_PUBLISH_KEY="YOUR_API_KEY"
```

**Option 3: macOS Keychain** (macOS only)

```bash
security add-generic-password -s "yoursite.publish-key" -a "publish-key" -w "YOUR_API_KEY"
```

With matching config:

```json
{
  "publish": {
    "url": "https://yoursite.com/api/writing",
    "keychainService": "yoursite.publish-key",
    "keychainAccount": "publish-key"
  }
}
```

### API contract

Your site needs two endpoints:

**POST `{url}/publish`** -- Create or update a post (upsert by slug).

Request body:

```json
{
  "slug": "my-post-title",
  "title": "My Post Title",
  "body": "Full markdown content...",
  "excerpt": "First two sentences as preview text.",
  "date": "2026-03-25",
  "tags": ["terminal", "workflow"]
}
```

Response: `{ "ok": true }` on success.

**POST `{url}/unpublish`** -- Soft-delete a post (set published=false).

Request body:

```json
{
  "slug": "my-post-title"
}
```

Response: `{ "ok": true }` on success.

Both endpoints should accept `Authorization: Bearer <api-key>` header.

### Publish flow

1. Write your piece in elwrit00r
2. Spc+r to review -- generates tags automatically
3. Spc+P to publish -- shows confirmation with title, slug, excerpt, date, tags
4. Spc+P again to confirm -- publishes to your site
5. Escape to cancel at any point

To update a published post, edit and Spc+P again (upsert by slug). To remove, Spc+U.

### Images

Embed images with local file paths in your writing:

```
![my screenshot](~/Desktop/screenshot.png)
![diagram](/Users/me/docs/arch.png)
```

On publish, local images are automatically uploaded to Vercel Blob and the paths replaced with CDN URLs. Your local file stays untouched. Paths starting with `http://` or `https://` are left as-is.

## Stack

- [Bun](https://bun.sh) -- Runtime
- [OpenTUI](https://github.com/anthropics/opentui) -- Terminal UI framework
- [React](https://react.dev) -- Component model via OpenTUI's React reconciler
- [Claude Agent SDK](https://github.com/anthropics/claude-agent-sdk) -- AI companion
