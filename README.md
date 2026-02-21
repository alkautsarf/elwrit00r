# elwrit00r

Terminal writing app with vim keybindings and AI companion. Built with [OpenTUI](https://github.com/anthropics/opentui) + React + Bun.

## Features

- **Vim modal editing** -- Normal, Insert, and Visual modes with full cursor motions, yank/paste, and delete operations
- **AI companion** -- Discuss ideas, review drafts, and polish writing with Claude, plus idle whispers that nudge you forward
- **File management** -- Auto-saving drafts to `~/.elwrit00r/writings/`, file browser, sidebar for quick switching
- **Title-based naming** -- Title field that auto-renames the file slug as you type
- **Markdown output** -- AI review and polish responses rendered with syntax-highlighted markdown

## Screens

**File browser** -- Lists all writings sorted by last modified. j/k navigation, Enter to open, n for new, d to delete.

**Editor** -- Full-screen distraction-free writing with vim keybindings. Status bar shows mode, WPM, word count, and elapsed time.

**AI pane** -- Side panel for discuss (multi-turn chat), review (structured feedback), and polish (rewrite) modes.

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
```

Or create an alias:

```bash
# Add to ~/.local/bin/elw
#!/bin/bash
ELW_DIR="$HOME/Documents/elwrit00r"
exec bun run "$ELW_DIR/src/index.tsx" "$@"
```

## Keybindings

| Screen  | Key     | Action              |
|---------|---------|---------------------|
| Browser | j/k     | Navigate            |
| Browser | Enter   | Open file           |
| Browser | n       | New writing         |
| Browser | d       | Delete (confirm)    |
| Browser | q       | Quit                |
| Editor  | i/a/o   | Enter Insert mode   |
| Editor  | Esc     | Back to Normal      |
| Editor  | v       | Visual select       |
| Editor  | T       | Focus title         |
| Editor  | Tab     | Switch pane         |
| Editor  | Ctrl+b  | Toggle sidebar      |
| Editor  | Spc+d   | Discuss (AI chat)   |
| Editor  | Spc+r   | Review              |
| Editor  | Spc+p   | Polish              |
| Editor  | Spc+n   | New AI session      |
| Editor  | Spc+b   | Back to browser     |
| Editor  | q       | Quit                |

## Stack

- [Bun](https://bun.sh) -- Runtime
- [OpenTUI](https://github.com/anthropics/opentui) -- Terminal UI framework
- [React](https://react.dev) -- Component model via OpenTUI's React reconciler
- [Claude Agent SDK](https://github.com/anthropics/claude-agent-sdk) -- AI companion
