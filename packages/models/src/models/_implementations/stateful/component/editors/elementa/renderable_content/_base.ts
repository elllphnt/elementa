import { BaseRenderableContentData } from "@elllphnt/elementa-base";
import { keyManager, Model } from "@elllphnt/elementa-utils";
import { Observable, of } from "rxjs";
import { Project } from "../../../../../../../infrastructure/_.js";
import { BaseRenderableContent } from "../../../../../../_.js";

export abstract class BaseRenderableContentModel<
    D extends BaseRenderableContentData<string>
  >
  extends Model<D>
  implements BaseRenderableContent<D["type"]>
{
  type: D["type"];
  project: Project;

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
    project,
  }: {
    init: {
      type: D["type"];
    };
    project: Project;
  }) {
    super({ key: keyManager.next("renderable-content") });
    this.project = project;
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
