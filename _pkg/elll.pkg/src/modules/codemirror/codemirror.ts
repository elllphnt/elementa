import {
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
  completionKeymap,
} from "@codemirror/autocomplete";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import {
  bracketMatching,
  defaultHighlightStyle,
  foldKeymap,
  indentOnInput,
  syntaxHighlighting,
} from "@codemirror/language";
import { lintGutter, lintKeymap } from "@codemirror/lint";
import { highlightSelectionMatches, searchKeymap } from "@codemirror/search";
import { EditorState, Extension } from "@codemirror/state";
import {
  EditorView,
  crosshairCursor,
  drawSelection,
  dropCursor,
  highlightActiveLine,
  highlightActiveLineGutter,
  highlightSpecialChars,
  keymap,
  lineNumbers,
  rectangularSelection,
} from "@codemirror/view";
import { vscodeKeymap } from "@replit/codemirror-vscode-keymap";
import { foldGutter } from "./extensions/fold_gutter/fold_gutter";
import { theme } from "./extensions/theme/theme";
import { editingKeyMap } from "./keymaps/editing";

export function createCodeMirror({
  content,
  extensions: extraExtensions = [],
}: {
  content?: string;
  extensions?: Extension[];
}) {
  const extensions: Extension[] = [
    lineNumbers(),
    highlightActiveLineGutter(),
    highlightSpecialChars(),
    history(),
    foldGutter(),
    lintGutter(),
    autocompletion(),
    drawSelection(),
    dropCursor(),
    EditorState.allowMultipleSelections.of(true),
    indentOnInput(),
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    bracketMatching(),
    closeBrackets(),
    rectangularSelection(),
    crosshairCursor(),
    highlightActiveLine(),
    highlightSelectionMatches(),
    theme({ getView: () => view }),
    keymap.of(vscodeKeymap),
    keymap.of([
      ...closeBracketsKeymap,
      ...defaultKeymap,
      ...searchKeymap,
      ...historyKeymap,
      ...foldKeymap,
      ...completionKeymap,
      ...lintKeymap,
      ...editingKeyMap,
    ] as any),
    ...extraExtensions,
  ];

  const initialState = EditorState.create({
    doc: content,
    extensions,
  });

  const view = new EditorView({
    state: initialState,
  });

  return view;
}
