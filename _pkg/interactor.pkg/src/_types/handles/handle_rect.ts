import { Disposable, Rect } from "@repo/utils";
import { Observable } from "rxjs";
import { IHandle } from "./handle";

export interface ILayoutUpdatePropagation {
  confirm(instance: any): void;
  isConfimed(instance: any): boolean;
}

export interface IHandleRect extends Disposable {
  readonly key: string;
  readonly renderableKey: string;
  readonly handle: IHandle;

  readonly htmlElement$: Observable<HTMLElement | undefined>;
  readonly htmlElement: HTMLElement | undefined;

  readonly contentRect$: Observable<Rect | undefined>;
  readonly contentRect: Rect | undefined;

  readonly viewportRect$: Observable<Rect | undefined>;
  readonly viewportRect: Rect | undefined;
}
