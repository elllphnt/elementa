import { Namespace } from "@repo/elementa";
import { TextElementRenderable } from "@repo/elementa-renderer";
import { IHandle } from "~/src/_types/_";
import { IFragmentHandle } from "~/src/_types/handles/entity/fragment";
import { ElementHandle } from "../element";
import { ProseMirrorTextElementEditor } from "./editor";

export class TextElementHandle extends ElementHandle<TextElementRenderable> {
  constructor({
    renderable,
    fragment,
    parent,
  }: {
    renderable: TextElementRenderable;
    fragment: IFragmentHandle;
    parent: IHandle | null;
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
    const textContent = this.entity.text;
    const expressions = Namespace.extractExpressionsFromString(textContent);
    const propExpressions = expressions.filter((expr) =>
      expr.startsWith("props."),
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
