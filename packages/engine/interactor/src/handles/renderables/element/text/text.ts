import type { TextElementRenderable } from "@elllphnt/elementa-scene";
import type { Handle } from "~/handles/handle.js";
import type { ElementaInteractor } from "~/interactor.js";
import { BaseElementHandle } from "../_base.js";
import { ProseMirrorTextElementEditor } from "./editor.js";

export class TextElementHandle extends BaseElementHandle<TextElementRenderable> {
  constructor({
    renderable,
    interactor,
    parent,
  }: {
    renderable: TextElementRenderable;
    interactor: ElementaInteractor;
    parent: Handle | null;
  }) {
    super({ renderable, interactor, parent });

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
    // const textContent = this.entity.text || "";
    // const expressions = Namespace.extractExpressionsFromString(textContent);
    // const propExpressions = expressions.filter((expr) =>
    //   expr.startsWith("props.")
    // );
    // const propNames = propExpressions
    //   .map((expr) => {
    //     const matches = expr.slice(6).match(/^[a-zA-Z0-9_]+/);
    //     return matches ? matches[0] : undefined;
    //   })
    //   .filter(Boolean) as string[];
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
