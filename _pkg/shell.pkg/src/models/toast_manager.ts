import { BehaviorSubject } from "rxjs";

export type Toast = {
  key: number;
  message: string;
  duration: number;
};
export type ToastOption = Pick<Toast, "message"> &
  Partial<Pick<Toast, "duration">>;

const DEFAULT_TOAST_DURATION = 3000;

export class ToastManager {
  static toastKey = 0;

  private _toasts$ = new BehaviorSubject<Toast[]>([]);

  get toasts() {
    return this._toasts$.value;
  }
  get toasts$() {
    return this._toasts$.asObservable();
  }

  addToast(options: Toast) {
    this._toasts$.next([...this._toasts$.value, options]);
  }
  removeToast(key: number) {
    this._toasts$.next(this._toasts$.value.filter((t) => t.key !== key));
  }

  toast(toast: ToastOption | string) {
    const key = ToastManager.toastKey++;
    let _toast: Toast;
    if (typeof toast === "string") {
      _toast = {
        key,
        message: toast,
        duration: DEFAULT_TOAST_DURATION,
      };
    } else {
      _toast = {
        key,
        message: toast.message,
        duration: toast.duration ?? DEFAULT_TOAST_DURATION,
      };
    }
    this.addToast(_toast);

    setTimeout(() => {
      this.removeToast(key);
    }, _toast.duration);
  }

  clear() {
    this._toasts$.next([]);
  }
}
