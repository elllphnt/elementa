import { DecorationSet, EditorView } from "@codemirror/view";
import { ControlProps } from "@repo/components";
import { useEffect, useRef } from "react";

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
import { lintKeymap } from "@codemirror/lint";
import { highlightSelectionMatches, searchKeymap } from "@codemirror/search";
import { EditorState, Extension, RangeSetBuilder } from "@codemirror/state";
import {
  Decoration,
  drawSelection,
  dropCursor,
  highlightActiveLine,
  highlightActiveLineGutter,
  highlightSpecialChars,
  keymap,
  rectangularSelection,
  ViewPlugin,
  ViewUpdate,
  WidgetType,
} from "@codemirror/view";
import { vscodeKeymap } from "@replit/codemirror-vscode-keymap";
import { editingKeyMap } from "~/src/modules/codemirror/keymaps/editing";

class PlaceholderWidget extends WidgetType {
  readonly text: string;

  constructor({ text }: { text: string }) {
    super();
    this.text = text;
  }

  toDOM() {
    const span = document.createElement("span");
    span.style.opacity = "0.5";
    span.style.pointerEvents = "none";
    span.textContent = this.text;
    return span;
  }
  ignoreEvent() {
    return true;
  }
}

const placeholderPlugin = ({ text }: { text: string }) =>
  ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;
      constructor(view: EditorView) {
        this.decorations = this.createDecorations(view);
      }
      update(update: ViewUpdate) {
        if (update.docChanged || update.viewportChanged)
          this.decorations = this.createDecorations(update.view);
      }
      createDecorations(view: EditorView) {
        const builder = new RangeSetBuilder<Decoration>();
        if (view.state.doc.length === 0) {
          builder.add(
            0,
            0,
            Decoration.widget({
              widget: new PlaceholderWidget({ text }),
              side: 1,
            }),
          );
        }
        return builder.finish();
      }
    },
    { decorations: (v) => v.decorations },
  );

export function createCodeMirror({
  content,
  extensions: extraExtensions = [],
}: {
  content?: string;
  extensions?: Extension[];
} = {}) {
  const extensions: Extension[] = [
    highlightActiveLineGutter(),
    highlightSpecialChars(),
    history(),
    autocompletion(),
    drawSelection(),
    dropCursor(),
    indentOnInput(),
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    bracketMatching(),
    closeBrackets(),
    rectangularSelection(),
    highlightActiveLine(),
    highlightSelectionMatches(),
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

  return EditorState.create({
    doc: content,
    extensions,
  });
}

export function ScriptControl({
  value,
  value$,
  onChange,
  settings,
}: ControlProps<
  any,
  {
    placeholder?: string;
  }
>): JSX.Element {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        onChange?.(update.state.doc.toString());
      }
    });

    const state = createCodeMirror({
      content: value,
      extensions: [
        updateListener,
        placeholderPlugin({ text: settings?.placeholder ?? "" }),
      ],
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    value$?.subscribe((value) => {
      if (!view.hasFocus) {
        view.dispatch({
          changes: {
            from: 0,
            to: view.state.doc.length,
            insert: value,
          },
        });
      }
    });

    view.focus();

    return () => {
      view?.destroy();
    };
  }, []);

  return <div ref={editorRef} />;
}
