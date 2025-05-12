import { BaseRenderableContent } from "@elllphnt/elementa-models";
import { FragmentEnvironment } from "../../../fragment/_.js";
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
    environment: FragmentEnvironment;
  }) {
    super({
      model,
      type: ElementaEditorInstanceType.RenderableContent,
      runtime: environment.runtime,
    });
  }
}
