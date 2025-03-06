import { Disposable } from "@repo/utils";
import { Observable } from "rxjs";
import { IElll } from "~/src/types/elll";
import { Content } from "../content/content";

export interface Model<D = any> extends Disposable {
  readonly key: string | number;
  readonly url: string;
  readonly elll: IElll;

  get content(): Content<D> | undefined;
  get icon(): string;
  get icon$(): Observable<string>;

  get color(): string;
  get color$(): Observable<string>;
}
