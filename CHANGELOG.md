# Changelog

All notable changes to elwrit00r will be documented in this file.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.2.0] - 2026-02-22

### Added

- Keyboard scrolling for AI pane: Ctrl+U/Ctrl+D for half-page scroll, j/k when AI pane is focused via Tab
- Pane-aware navigation: j/k scroll the AI pane when focused, move editor cursor when not

## [0.1.1] - 2026-02-22

### Fixed

- Save system rewrite: cancel auto-save timer before all view transitions to prevent writing empty content to disk
- Add `saveStatusRef` for synchronous reads in closures, fixing stale `saveStatus` state in save guards
- Add `textareaRef` null guard in `saveFile` to prevent saving when editor is unmounted
- Save current file before switching via browser open, sidebar new, and browser new
- Cancel auto-save timer during file rename to prevent race conditions
- Extract `flushIfModified` and `createNewFile` helpers to deduplicate save-before-switch pattern
- `handleQuit` now reuses `saveFile` instead of duplicating write logic

## [0.1.0] - 2026-02-21

### Added

- Vim modal editing with Normal, Insert, and Visual modes
- Full cursor motions: h/j/k/l, w/b/e, 0/$, gg/G
- Delete operations: dd, dw, d$, d0, x, s
- Yank/paste: yy, p (plus visual mode y/d/c)
- File browser with j/k navigation, open, new, delete
- Sidebar file list toggled via Ctrl+b
- Auto-save with 2s debounce after typing
- Title field that renames file slug on change
- AI discuss mode with multi-turn chat (always draft-aware)
- AI review mode with structured feedback
- AI polish mode for rewriting
- AI whisper nudges during idle periods
- Markdown rendering for AI output
- WPM, word count, and elapsed time in status bar
- Homebrew distribution via `brew tap alkautsarf/tap`

[0.2.0]: https://github.com/alkautsarf/elwrit00r/releases/tag/v0.2.0
[0.1.1]: https://github.com/alkautsarf/elwrit00r/releases/tag/v0.1.1
[0.1.0]: https://github.com/alkautsarf/elwrit00r/releases/tag/v0.1.0
