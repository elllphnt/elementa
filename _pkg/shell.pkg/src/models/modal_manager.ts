import { Context } from "react";
import { BehaviorSubject, map } from "rxjs";

export type ModalAffinity = "workspace" | "context" | "activity" | "appbar";

export type Modal = {
  key: number;
  affinity: ModalAffinity;
  viewId: string;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  onClose?: () => void;
  props?: Record<string, any>;
  anchor?: HTMLElement;
  permanent?: boolean;
  contexts?: [Context<any>, any][];
};

export type ModalOption = Omit<Modal, "key">;

export class ModalManager {
  static modalKey = 0;
  private _modal$ = new BehaviorSubject<Modal | undefined>(undefined);

  modal(affinity: ModalAffinity) {
    const modal = this._modal$.value;
    return modal?.affinity === affinity ? modal : undefined;
  }
  modal$(affinity: ModalAffinity) {
    return this._modal$.pipe(
      map((modal) => (modal?.affinity === affinity ? modal : undefined)),
    );
  }

  showModal(options: ModalOption) {
    const key = ModalManager.modalKey++;
    this._modal$.next({
      ...options,
      key,
    });
    return key;
  }

  hideModal(key?: number) {
    const modal = this._modal$.value;
    if (key === undefined) {
      this._modal$.next(undefined);
      modal?.onClose?.();
    } else {
      if (this._modal$.value?.key === key) {
        this._modal$.next(undefined);
        modal?.onClose?.();
      }
    }
  }

  clear() {
    this._modal$.next(undefined);
  }
}
