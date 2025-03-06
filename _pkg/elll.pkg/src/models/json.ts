import { elllIcons16 } from "@repo/components";
import { Disposable } from "@repo/utils";
import { Observable, of } from "rxjs";
import { ModelConstructor } from "../modules/elll/model/contructor";
import { Model } from "../modules/elll/model/model";
import { IElll } from "../types/elll";

export class JsonModel extends Disposable implements Model {
  static key = 0;
  readonly key = JsonModel.key++;
  readonly url: string;
  readonly elll: IElll;

  get content(): any {
    return this.elll.contentManager.content(this.url, "json");
  }

  get icon(): string {
    return elllIcons16.textJustify;
  }
  get icon$(): Observable<string> {
    return of(elllIcons16.textJustify);
  }
  get color(): string {
    return "";
  }
  get color$(): Observable<string> {
    return of("");
  }

  constructor({ elll, url }: { elll: any; url: string }) {
    super();
    this.url = url;
    this.elll = elll;
  }
}

export const jsonModelConstructor: ModelConstructor = {
  name: "elll.model.json",
  new: ({ elll, url }) => new JsonModel({ elll, url }),
};
