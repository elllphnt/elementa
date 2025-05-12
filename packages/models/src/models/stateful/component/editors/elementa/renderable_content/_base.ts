import { BaseRenderableContentData } from "@elllphnt/elementa-base";
import { Model } from "@elllphnt/elementa-utils";
import { Observable, of } from "rxjs";
import { Project } from "../../../../../../infrastructure/_.js";
import { BaseRenderableContent } from "../../../../../_interfaces/_.js";

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

  constructor({ init, project }: { init: D; project: Project }) {
    super();
    this.project = project;
    this.type = init.type;
  }

  restore(data: BaseRenderableContentData<D["type"]>) {
    if (data.type !== this.type) {
      throw new Error(
        `Cannot restore data of type ${data.type} to a ${this.type} model`
      );
    }
  }
}
