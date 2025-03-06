import { BehaviorSubject, distinctUntilChanged } from "rxjs";
import { ContextMenu } from "../_types";

export class ContextMenuManager {
  static menuKey = 0;
  private _contextMenu$: BehaviorSubject<ContextMenu | undefined>;

  get menu() {
    return this._contextMenu$.value;
  }
  get menu$() {
    return this._contextMenu$.pipe(distinctUntilChanged());
  }

  constructor() {
    this._contextMenu$ = new BehaviorSubject<ContextMenu | undefined>(
      undefined,
    );
  }

  showMenu(menu: Omit<ContextMenu, "key">) {
    this._contextMenu$.next({
      ...menu,
      key: ContextMenuManager.menuKey++,
    });
  }
  hideMenu() {
    this._contextMenu$.next(undefined);
  }
}
