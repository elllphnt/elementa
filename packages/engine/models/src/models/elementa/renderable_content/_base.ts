import type { BaseRenderableContentData } from "@elllphnt/elementa-base";
import type { RecordState } from "@elllphnt/elementa-kernel";
import { Model } from "@elllphnt/elementa-kernel";
import type { ElementaEnvironment } from "../environment.js";

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
