import { BaseRenderableContentData } from "@elllphnt/elementa-base";
import { Model, RecordState } from "@elllphnt/elementa-utils";
import { ElementaEnvironment } from "../environment.js";

export abstract class BaseRenderableContent<
  T extends BaseRenderableContentData<string>
> extends Model<RecordState<T>> {
  type: T["type"];
  environment: ElementaEnvironment;

  constructor({
    state,
    type,
    environment,
  }: {
    state: RecordState<T>;
    type: T["type"];
    environment: ElementaEnvironment;
  }) {
    super({ state });
    this.environment = environment;
    this.type = type;
  }
}
