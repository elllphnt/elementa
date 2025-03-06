import { BehaviorSubject } from "rxjs";
import { Disposable } from "@repo/utils";

export class DragDropManager extends Disposable {
  private _dragData$ = new BehaviorSubject<Record<string, any> | undefined>(
    undefined,
  );
  private _dropTarget$ = new BehaviorSubject<HTMLElement | undefined>(
    undefined,
  );

  get dropTarget$() {
    return this._dropTarget$;
  }
  get dropTarget() {
    return this._dropTarget$.value;
  }

  get dragData$() {
    return this._dragData$;
  }
  get dragData() {
    return this._dragData$.value;
  }

  constructor() {
    super();

    this.addDisposer(() => {
      this._dropTarget$.complete();
    });
  }

  setDropTarget(target: HTMLElement | undefined) {
    this._dropTarget$.next(target);
  }
  setDragData(data: Record<string, any> | undefined) {
    this._dragData$.next(data);
  }
}
