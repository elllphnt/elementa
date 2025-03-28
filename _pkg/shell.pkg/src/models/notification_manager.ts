import { BehaviorSubject } from "rxjs";

export type Notification = {
  key: number;
  title?: string;
  message: string;
  viewId?: string;
  props?: Record<string, any>;
  actions?: {
    label: string;
    handler: () => void;
    primary?: boolean;
  }[];
  duration?: number;
  progress?: boolean;
};

export class NotificationManager {
  static notificationKey = 0;
  private _notifications$ = new BehaviorSubject<Notification[]>([]);

  get notifications() {
    return this._notifications$.value;
  }
  get notifications$() {
    return this._notifications$.asObservable();
  }

  constructor() {
    this._notifications$ = new BehaviorSubject<Notification[]>([]);
  }

  showNotification(notification: Omit<Notification, "key">) {
    const key = NotificationManager.notificationKey++;
    this._notifications$.next([
      ...this._notifications$.value,
      { ...notification, key },
    ]);

    return key;
  }
  hideNotification(key: number) {
    this._notifications$.next(
      this._notifications$.value.filter(
        (notification) => notification.key !== key,
      ),
    );
  }

  clear() {
    this._notifications$.next([]);
  }
}
