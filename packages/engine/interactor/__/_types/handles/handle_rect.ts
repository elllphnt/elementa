import type { Lifecycle, Rect } from "@elllphnt/elementa-utils";
import type { Observable } from "rxjs";
import type { Handle } from "./handle.js";

export interface ILayoutUpdatePropagation {
  confirm(instance: any): void;
  isConfimed(instance: any): boolean;
}

export interface IHandleRect extends Lifecycle {
  readonly key: string;
  readonly renderableKey: string;
  readonly handle: Handle;

  readonly htmlElement$: Observable<HTMLElement | undefined>;
  readonly htmlElement: HTMLElement | undefined;

  readonly contentRect$: Observable<Rect | undefined>;
  readonly contentRect: Rect | undefined;

  readonly viewportRect$: Observable<Rect | undefined>;
  readonly viewportRect: Rect | undefined;
}
