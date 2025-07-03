import { Namespace } from "@elllphnt/elementa-runtime";
import { TextElementRenderable } from "@elllphnt/elementa-scene";
import { Handle } from "~/_types/_";
import { IFragmentHandle } from "~/_types/handles/renderable/fragment";
import { ElementHandle } from "../element.js";
import { ProseMirrorTextElementEditor } from "./editor.js";

export class TextElementHandle extends ElementHandle<TextElementRenderable> {
  constructor({
    renderable,
    fragment,
    parent,
  }: {
    renderable: TextElementRenderable;
    fragment: IFragmentHandle;
    parent: Handle | null;
  }) {
    super({ renderable, fragment, parent });

    const textEditor = new ProseMirrorTextElementEditor({
      element: renderable,
    });
    this.renderable.setEditor(textEditor);

    this.addEventListener("dblclick", () => {
      this.focus();
    });

    // sync focus state with renderable
    const focusSubscription = this.focused$.subscribe((focus) => {
      if (focus) {
        renderable.setMode("edit");
      } else {
        renderable.setMode("view");
        this.handleUnfocus();
      }
    });

    this.addDisposer(() => {
      focusSubscription.unsubscribe();
    });
  }

  extractContentExpressions() {
    const textContent = this.entity.text || "";
    const expressions = Namespace.extractExpressionsFromString(textContent);
    const propExpressions = expressions.filter((expr) =>
      expr.startsWith("props.")
    );
    const propNames = propExpressions
      .map((expr) => {
        const matches = expr.slice(6).match(/^[a-zA-Z0-9_]+/);
        return matches ? matches[0] : undefined;
      })
      .filter(Boolean) as string[];

    // const env = this.instance.environment;
    // for (const propName of propNames) {
    //   const prop = env.componentProp(propName);
    //   if (!prop) {
    //     env.setProp({
    //       name: propName,
    //       value: `[${propName}]`,
    //       type: "string",
    //     });
    //   }
    // }
  }

  handleUnfocus() {
    this.extractContentExpressions();
  }

  selectAll() {
    this.renderable.editor?.selectAll();
  }
}
