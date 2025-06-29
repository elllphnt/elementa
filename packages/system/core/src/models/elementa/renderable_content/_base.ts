import {
  BaseRenderableContent,
  ElementaEnvironment,
} from "@elllphnt/elementa-core";
import { CrdtModel, keyManager } from "@elllphnt/elementa-utils";
import * as y from "yjs";

export abstract class CrdtBaseRenderableContent<T extends string>
  extends CrdtModel<y.Map<any>>
  implements BaseRenderableContent<T>
{
  type: T;
  environment: ElementaEnvironment;

  constructor({
    crdt,
    type,
    environment,
    initialized,
  }: {
    crdt: y.Map<any>;
    type: T;
    environment: ElementaEnvironment;
    initialized?: boolean;
  }) {
    super({ key: keyManager.next("renderable-content"), crdt });
    this.environment = environment;
    this.type = type;

    if (!initialized) {
      crdt.set("type", type);
    }
  }
}
