import { ElementaFrame } from "@elllphnt/elementa-models";
import { Runtime } from "../../../../runtime/runtime.js";
import { Instance } from "../../../instance.js";
import { ModelInstance } from "../../../model.js";
import { ElementaEditorInstanceType } from "../elementa/_types.js";

export class ElementaFrameInstance extends ModelInstance<ElementaFrame> {
  constructor({
    runtime,
    parent,
    model,
  }: {
    runtime: Runtime;
    parent?: Instance;
    model: ElementaFrame;
  }) {
    super({
      type: ElementaEditorInstanceType.Frame,
      runtime,
      parent,
      model,
    });
  }
}
