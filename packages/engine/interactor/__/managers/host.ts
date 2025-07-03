import { Lifecycle } from "@elllphnt/elementa-kernel";
import { PointData } from "@elllphnt/elementa-math-utils";
import { BehaviorSubject, distinctUntilChanged } from "rxjs";
import { Handle } from "~/handles/handle.js";

export type ContextMenuOption = {
  label: string;
  icon?: string;
} & (
  | {
      action: () => void;
    }
  | {
      submenu: ContextMenuOption[][];
    }
);

export abstract class Host extends Lifecycle {
  private _dropTarget$ = new BehaviorSubject<Handle | undefined>(undefined);
  private _isDragging$ = new BehaviorSubject<boolean>(false);

  get isDragging() {
    return this._isDragging$.value;
  }
  get isDragging$() {
    return this._isDragging$.asObservable().pipe(distinctUntilChanged());
  }

  constructor() {
    super();

    this.addDisposer(() => {
      this._dropTarget$.complete();
    });
  }

  // navigation
  abstract goTo(url: string): void;

  //  context menu
  abstract showContextMenu(
    position: PointData,
    options: ContextMenuOption[][]
  ): void;
  abstract hideContextMenu(): void;

  // drag and drop
  get dropTarget$() {
    return this._dropTarget$.asObservable();
  }
  get dropTarget() {
    return this._dropTarget$.value;
  }

  abstract handleDragEnter(event: DragEvent, handle: Handle): void;
  abstract handleDragLeave(event: DragEvent, handle: Handle): void;
  abstract handleDrop(event: DragEvent, handle: Handle): void;
  abstract handleDragOver(event: DragEvent): void;

  setDropTarget(handle: Handle | undefined) {
    this._dropTarget$.next(handle);
  }
  setDragging(isDragging: boolean) {
    this._isDragging$.next(isDragging);
  }

  abstract toast(message: string): void;
}
