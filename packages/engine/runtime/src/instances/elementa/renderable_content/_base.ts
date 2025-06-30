import { BaseRenderableContentData } from "@elllphnt/elementa-base";
import { BaseRenderableContent } from "@elllphnt/elementa-models";
import { ElementRuntimeEnvironment } from "~/instances/elements/_environment/environment.js";
import { ModelInstance } from "~/instances/model.js";
import { ElementaEditorInstanceType } from "../_types.js";

export class BaseRenderableContentInstance<
  M extends BaseRenderableContent<BaseRenderableContentData<string>>
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
