import { ElementaViewerComponentState } from "@elllphnt/elementa-models";
import { Runtime } from "../../../../runtime/runtime.js";
import { Instance } from "../../../instance.js";
import { ModelInstance } from "../../../model.js";
import { ElementaEditorInstanceType } from "../elementa/_types.js";

export class ElementaViewerComponentStateInstance extends ModelInstance<ElementaViewerComponentState> {
  constructor({
    runtime,
    parent,
    model,
  }: {
    runtime: Runtime;
    parent?: Instance;
    model: ElementaViewerComponentState;
  }) {
    super({
      type: ElementaEditorInstanceType.EditorState,
      runtime,
      parent,
      model,
    });
  }
}
