import type { Lifecycle } from "@elllphnt/elementa-utils";
import type { Observable } from "rxjs";
import type { Handle } from "../handles/handle.js";

export type DropCase = {
  target: Handle;
  datatypes: string[];
};

export interface IInteractionManager extends Lifecycle {
  readonly focused: Handle | undefined;
  readonly focused$: Observable<Handle | undefined>;

  readonly hovered: Handle | undefined;
  readonly hovered$: Observable<Handle | undefined>;

  readonly selection: Handle[];
  readonly selection$: Observable<Handle[]>;

  readonly dropCase: DropCase | undefined;
  readonly dropCase$: Observable<DropCase | undefined>;

  readonly dropTarget: Handle | undefined;
  readonly dropTarget$: Observable<Handle | undefined>;

  focus(handle: Handle): void;
  blur(handle: Handle): void;

  hover(handle: Handle): void;
  unhover(handle: Handle): void;

  select(handles: Handle[], options?: { toggle?: boolean }): void;
  deselect(handles: Handle[]): void;
  clearSelection(): void;
  clearFocus(): void;

  setDropCase(dropCase: DropCase): void;
  clearDropCase(): void;
}
