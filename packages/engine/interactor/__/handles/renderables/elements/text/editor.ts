import type {
  ITextElementEditor,
  TextElementRenderable,
} from "@elllphnt/elementa-scene";
import { baseKeymap } from "prosemirror-commands";
import { history, redo, undo } from "prosemirror-history";
import { keymap } from "prosemirror-keymap";
import { Schema } from "prosemirror-model";
import { AllSelection, EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { BehaviorSubject } from "rxjs";

const schema = new Schema({
  nodes: {
    doc: { content: "paragraph+" },
    paragraph: {
      content: "text*",
      toDOM() {
        return ["p", 0];
      },
    },
    text: { inline: true },
  },
});

export class ProseMirrorTextElementEditor implements ITextElementEditor {
  readonly element: TextElementRenderable;
  private _editor$ = new BehaviorSubject<EditorView | undefined>(undefined);

  get editor$() {
    return this._editor$;
  }
  get editor() {
    return this._editor$.value;
  }

  constructor({ element }: { element: TextElementRenderable }) {
    this.element = element;
  }

  mount(root: HTMLElement): void {
    const doc = schema.node("doc", null, [schema.node("paragraph", null, [])]);

    const state = EditorState.create({
      schema,
      doc,
      plugins: [
        history(),
        keymap({ "Mod-z": undo, "Mod-y": redo }),
        keymap(baseKeymap),
      ],
    });
    const editor = new EditorView(root, {
      state,
      dispatchTransaction: (transaction) => {
        const newState = editor.state.apply(transaction);
        if (transaction.docChanged) {
          this.element.entity.setText(newState.doc.toJSON());
        }
        editor.updateState(newState);
      },
      attributes: {
        style:
          "pointer-events: auto; outline: none; min-width: 2px; cursor: text;",
      },
    });
    editor.focus();

    this._editor$.next(editor);
  }

  unmount(): void {
    this._editor$.value?.destroy();
    this._editor$.next(undefined);
  }

  selectAll(): void {
    this.editor?.dispatch(
      this.editor.state.tr.setSelection(new AllSelection(this.editor.state.doc))
    );
  }
}
