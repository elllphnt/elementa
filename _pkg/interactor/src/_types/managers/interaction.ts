import { Disposable } from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import { IHandle } from "../handles/handle";

export type DropCase = {
  target: IHandle;
  datatypes: string[];
};

export interface IInteractionManager extends Disposable {
  readonly focused: IHandle | undefined;
  readonly focused$: Observable<IHandle | undefined>;

  readonly hovered: IHandle | undefined;
  readonly hovered$: Observable<IHandle | undefined>;

  readonly selection: IHandle[];
  readonly selection$: Observable<IHandle[]>;

  readonly dropCase: DropCase | undefined;
  readonly dropCase$: Observable<DropCase | undefined>;

  readonly dropTarget: IHandle | undefined;
  readonly dropTarget$: Observable<IHandle | undefined>;

  focus(handle: IHandle): void;
  blur(handle: IHandle): void;

  hover(handle: IHandle): void;
  unhover(handle: IHandle): void;

  select(handles: IHandle[], options?: { toggle?: boolean }): void;
  deselect(handles: IHandle[]): void;
  clearSelection(): void;
  clearFocus(): void;

  setDropCase(dropCase: DropCase): void;
  clearDropCase(): void;
}
