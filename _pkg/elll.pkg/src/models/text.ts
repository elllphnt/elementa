import { elllIcons16 } from "@repo/components";
import { Disposable } from "@repo/utils";
import { Observable, of } from "rxjs";
import { ModelConstructor } from "../modules/elll/model/contructor";
import { Model } from "../modules/elll/model/model";
import { IElll } from "../types/elll";
import { fileColor, fileIcon } from "../components/ui/icons/file_icon";
import { mimeTypes } from "../libs/mimetypes";

export class TextModel extends Disposable implements Model {
  static key = 0;
  readonly key = TextModel.key++;
  readonly url: string;
  readonly elll: IElll;

  get content(): any {
    return this.elll.contentManager.content(this.url, "json");
  }

  get icon(): string {
    return fileIcon(mimeTypes.json);
  }
  get icon$(): Observable<string> {
    return of(fileIcon(mimeTypes.json));
  }

  get color(): string {
    return fileColor(mimeTypes.json);
  }
  get color$(): Observable<string> {
    return of(fileColor(mimeTypes.json));
  }

  constructor({ elll, url }: { elll: any; url: string }) {
    super();
    this.url = url;
    this.elll = elll;
  }
}

export const jsonModelConstructor: ModelConstructor = {
  name: "elll.model.json",
  new: ({ elll, url }) => new TextModel({ elll, url }),
};
