import { elllFileTypes } from "@elllphnt/utils";
import { Disposable } from "@repo/utils";
import { Observable, of } from "rxjs";
import { fileColor, fileIcon } from "../components/ui/icons/file_icon";
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
    return fileIcon(elllFileTypes.primitive);
  }
  get icon$(): Observable<string> {
    return of(fileIcon(elllFileTypes.primitive));
  }

  get color(): string {
    return fileColor(elllFileTypes.primitive);
  }
  get color$(): Observable<string> {
    return of(fileColor(elllFileTypes.primitive));
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
