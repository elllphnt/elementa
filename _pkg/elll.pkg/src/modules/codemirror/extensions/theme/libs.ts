import {
  HighlightStyle,
  TagStyle,
  syntaxHighlighting,
} from "@codemirror/language";
import { Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { tags as t } from "@lezer/highlight";

interface Options {
  /**
   * Theme variant. Determines which styles CodeMirror will apply by default.
   */
  variant: Variant;

  /**
   * Settings to customize the look of the editor, like background, gutter, selection and others.
   */
  settings: Settings;

  /**
   * Syntax highlighting styles.
   */
  styles: TagStyle[];
}

interface Settings {
  /**
   * Editor background.
   */
  background: string;

  /**
   * Default text color.
   */
  foreground: string;

  /**
   * Caret color.
   */
  caret: string;

  /**
   * Selection background.
   */
  selection: string;

  /**
   * Selection Match background.
   */
  selectionMatch: string;

  /**
   * Background of highlighted lines.
   */
  lineHighlight: string;

  /**
   * Gutter background.
   */
  gutterBackground: string;

  /**
   * Text color inside gutter.
   */
  gutterForeground: string;
}

type Variant = "light" | "dark";

const createTheme = ({ variant, settings, styles }: Options): Extension => {
  const theme = EditorView.theme(
    {
      "&": {
        backgroundColor: settings.background,
        color: settings.foreground,
      },
      ".cm-line": {
        padding: "0",
      },
      ".cm-content": {
        caretColor: settings.caret,
      },
      ".cm-cursor, .cm-dropCursor": {
        borderLeftColor: settings.caret,
      },
      "& .cm-selectionBackground, .cm-content ::selection": {
        backgroundColor: settings.selection,
      },
      "& .cm-selectionBackground": {},
      "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-content ::selection":
        {
          backgroundColor: settings.selection,
        },
      "&.cm-focused .cm-selectionMatch": {
        backgroundColor: settings.selectionMatch,
      },
      "& .cm-selectionMatch": {
        backgroundColor: settings.selectionMatch,
      },
      ".cm-activeLine": {
        backgroundColor: settings.lineHighlight,
      },
      ".cm-gutters": {
        backgroundColor: settings.gutterBackground,
        color: settings.gutterForeground,
      },
      ".cm-activeLineGutter": {
        backgroundColor: settings.lineHighlight,
      },
    },
    {
      dark: variant === "dark",
    },
  );

  const highlightStyle = HighlightStyle.define(styles);
  const extension = [theme, syntaxHighlighting(highlightStyle)];

  return extension;
};

export const coolGlow = createTheme({
  variant: "dark",
  settings: {
    background: "#00000000",
    foreground: "#E0E0E0",
    caret: "#FFFFFFA6",
    selection: "#0088ff33",
    selectionMatch: "#00ff8822",
    gutterBackground: "#00000000",
    gutterForeground: "#E0E0E090",
    lineHighlight: "#0088ff11",
  },
  styles: [
    {
      tag: t.comment,
      color: "#AEAEAE",
    },
    {
      tag: [t.string, t.special(t.brace), t.regexp],
      color: "#8DFF8E",
    },
    {
      tag: [
        t.className,
        t.definition(t.propertyName),
        t.function(t.variableName),
        t.function(t.definition(t.variableName)),
        t.definition(t.typeName),
      ],
      color: "#A3EBFF",
    },
    {
      tag: [t.number, t.bool, t.null],
      color: "#62E9BD",
    },
    {
      tag: [t.keyword, t.operator],
      color: "#2BF1DC",
    },
    {
      tag: [t.definitionKeyword, t.modifier],
      color: "#F8FBB1",
    },
    {
      tag: [t.variableName, t.self],
      color: "#B683CA",
    },
    {
      tag: [t.angleBracket, t.tagName, t.typeName, t.propertyName],
      color: "#60A4F1",
    },
    {
      tag: t.derefOperator,
      color: "#E0E0E0",
    },
    {
      tag: t.attributeName,
      color: "#7BACCA",
    },
  ],
});

export const tomorrow = createTheme({
  variant: "light",
  settings: {
    background: "#FFFFFF",
    foreground: "#4D4D4C",
    caret: "#AEAFAD",
    selection: "#0088ff33",
    selectionMatch: "#00ff8822",
    gutterBackground: "#FFFFFF",
    gutterForeground: "#4D4D4C80",
    lineHighlight: "#0088ff11",
  },
  styles: [
    {
      tag: t.comment,
      color: "#8E908C",
    },
    {
      tag: [t.variableName, t.self, t.propertyName, t.attributeName, t.regexp],
      color: "#C82829",
    },
    {
      tag: [t.number, t.bool, t.null],
      color: "#F5871F",
    },
    {
      tag: [t.className, t.typeName, t.definition(t.typeName)],
      color: "#C99E00",
    },
    {
      tag: [t.string, t.special(t.brace)],
      color: "#718C00",
    },
    {
      tag: t.operator,
      color: "#3E999F",
    },
    {
      tag: [t.definition(t.propertyName), t.function(t.variableName)],
      color: "#4271AE",
    },
    {
      tag: t.keyword,
      color: "#8959A8",
    },
    {
      tag: t.derefOperator,
      color: "#4D4D4C",
    },
  ],
});
