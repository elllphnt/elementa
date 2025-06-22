import { BaseRenderableContent } from "@elllphnt/elementa-core";
import { ElementRuntimeEnvironment } from "../../../fragment/_.js";
import { ModelInstance } from "../../../model.js";
import { ElementaEditorInstanceType } from "../_types.js";

export class BaseRenderableContentInstance<
  M extends BaseRenderableContent<string>
> extends ModelInstance<M> {
  constructor({
    model,
    environment,
  }: {
    model: M;
    environment: ElementRuntimeEnvironment;
  }) {
    super({
      model,
      type: ElementaEditorInstanceType.RenderableContent,
      runtime: environment.runtime,
    });
  }
}
