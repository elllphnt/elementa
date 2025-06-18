import { BaseRenderableContentData } from "@elllphnt/elementa-base";
import {
  BaseRenderableContent,
  ElementaEnvironment,
} from "@elllphnt/elementa-core";
import { keyManager, Model } from "@elllphnt/elementa-utils";
import { Observable, of } from "rxjs";

export abstract class StatefulBaseRenderableContent<
    D extends BaseRenderableContentData<string>
  >
  extends Model<D>
  implements BaseRenderableContent<D["type"]>
{
  type: D["type"];
  environment: ElementaEnvironment;

  get _data(): BaseRenderableContentData<D["type"]> {
    return {
      type: this.type,
    };
  }

  get _data$(): Observable<BaseRenderableContentData<D["type"]>> {
    return of({
      type: this.type,
    });
  }

  constructor({
    init,
    environment,
  }: {
    init: {
      type: D["type"];
    };
    environment: ElementaEnvironment;
  }) {
    super({ key: keyManager.next("renderable-content") });
    this.environment = environment;
    this.type = init.type;
  }

  restore(data: { type: D["type"] }) {
    if (data.type !== this.type) {
      throw new Error(
        `Cannot restore data of type ${data.type} to a ${this.type} model`
      );
    }
  }
}
