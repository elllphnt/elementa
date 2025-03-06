import { elllIcons16 } from "@repo/components";
import { Disposable } from "@repo/utils";
import { Observable, of } from "rxjs";
import { ModelConstructor } from "../modules/elll/model/contructor";
import { Model } from "../modules/elll/model/model";
import { IElll } from "../types/elll";

export class ReactModel extends Disposable implements Model {
  static key = 0;
  readonly key = ReactModel.key++;
  readonly url: string;
  readonly elll: IElll;

  get content() {
    return this.elll.contentManager.content(this.url, "text");
  }

  get icon(): string {
    return elllIcons16.component;
  }
  get icon$(): Observable<string> {
    return of(elllIcons16.component);
  }
  get color(): string {
    return "#08f";
  }
  get color$(): Observable<string> {
    return of("#08f");
  }

  constructor({ elll, url }: { elll: any; url: string }) {
    super();
    this.url = url;
    this.elll = elll;
  }
}

export const reactModelConstructor: ModelConstructor = {
  name: "elll.model.react",
  new: ({ elll, url }) => new ReactModel({ elll, url }),
};
