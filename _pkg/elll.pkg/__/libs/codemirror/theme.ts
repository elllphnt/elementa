import {
  HighlightStyle,
  TagStyle,
  syntaxHighlighting,
} from "@codemirror/language";
import { Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { tags as t } from "@lezer/highlight";

type Variant = "light" | "dark";

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

const createTheme = ({ variant, settings, styles }: Options): Extension => {
  const theme = EditorView.theme(
    {
      "&": {
        backgroundColor: settings.background,
        color: settings.foreground,
      },
      ".cm-content": {
        caretColor: settings.caret,
      },
      ".cm-cursor, .cm-dropCursor": {
        borderLeftColor: settings.caret,
      },
      "&.cm-focused .cm-selectionBackgroundm .cm-selectionBackground, .cm-content ::selection":
        {
          backgroundColor: settings.selection,
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
    selection: "#122BBB",
    gutterBackground: "#00000000",
    gutterForeground: "#E0E0E090",
    lineHighlight: "#FFFFFF0F",
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
