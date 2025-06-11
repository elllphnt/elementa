import {
  BaseRenderableContent,
  RenderingEnvironment,
} from "@elllphnt/elementa-core";
import { CrdtModel, keyManager } from "@elllphnt/elementa-utils";
import * as y from "yjs";

export abstract class CrdtBaseRenderableContent<T extends string>
  extends CrdtModel<y.Map<any>>
  implements BaseRenderableContent<T>
{
  type: T;
  environment: RenderingEnvironment;

  constructor({
    crdt,
    type,
    environment,
    initialized,
  }: {
    crdt: y.Map<any>;
    type: T;
    environment: RenderingEnvironment;
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
