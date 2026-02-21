import { SyntaxStyle } from "@opentui/core";
import { theme } from "../theme";

let _style: SyntaxStyle | null = null;

export function getMarkdownStyle(): SyntaxStyle {
  if (!_style) {
    _style = SyntaxStyle.fromTheme([
      { scope: ["default"], style: { foreground: theme.fg } },
      { scope: ["markup.heading.1"], style: { foreground: theme.purple, bold: true } },
      { scope: ["markup.heading.2"], style: { foreground: theme.blue, bold: true } },
      { scope: ["markup.heading.3"], style: { foreground: theme.cyan, bold: true } },
      { scope: ["markup.strong"], style: { bold: true } },
      { scope: ["markup.italic"], style: { italic: true } },
      { scope: ["markup.raw"], style: { foreground: theme.green } },
      { scope: ["markup.strikethrough"], style: { foreground: theme.fgFaint } },
      { scope: ["markup.list"], style: { foreground: theme.blue } },
      { scope: ["markup.link.label"], style: { foreground: theme.blue, underline: true } },
      { scope: ["markup.link.url"], style: { foreground: theme.fgFaint } },
      { scope: ["markup.link"], style: { foreground: theme.fgFaint } },
      { scope: ["punctuation.special"], style: { foreground: theme.fgFaint } },
      { scope: ["conceal"], style: { foreground: theme.fgFaint } },
    ]);
  }
  return _style;
}
