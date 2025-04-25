import { RouteData } from "@elllphnt/elll-element";
import { Disposable } from "@repo/utils";
import { BehaviorSubject, map } from "rxjs";
import { Entity } from "../component/_";
import { App } from "./app";

export class Route extends Disposable {
  readonly app: App;
  readonly id: string;

  private _data$ = new BehaviorSubject<Omit<RouteData, "id"> | undefined>(
    undefined,
  );

  get data() {
    return {
      ...this._data$.value,
      id: this.id,
    };
  }
  get data$() {
    return this._data$.asObservable().pipe(
      map((data) => ({
        ...data,
        id: this.id,
      })),
    );
  }

  get path() {
    return this.data?.path;
  }
  get path$() {
    return this.data$.pipe(map((data) => data.path));
  }

  get parentId() {
    return this.data?.parentId;
  }
  get parentId$() {
    return this.data$.pipe(map((data) => data.parentId));
  }

  get viewUrl() {
    return this.data?.viewUrl;
  }
  get viewUrl$() {
    return this.data$.pipe(map((data) => data.viewUrl));
  }

  get view() {
    return this.viewUrl
      ? this.app.project.componentManager.component(this.viewUrl)
      : undefined;
  }
  get view$() {
    return this.viewUrl$.pipe(
      map((viewUrl) => {
        if (!viewUrl) return undefined;
        return this.app.project.componentManager.component(viewUrl);
      }),
    );
  }

  get layoutUrl() {
    return this.data?.layoutUrl;
  }
  get layoutUrl$() {
    return this.data$.pipe(map((data) => data.layoutUrl));
  }
  get layout() {
    return this.layoutUrl
      ? this.app.project.componentManager.component(this.layoutUrl)
      : undefined;
  }
  get layout$() {
    return this.layoutUrl$.pipe(
      map((layoutUrl) => {
        if (!layoutUrl) return undefined;
        return this.app.project.componentManager.component(layoutUrl);
      }),
    );
  }

  constructor({ id, app }: { id?: string; app: App }) {
    super();
    this.app = app;
    this.id = id ?? Entity.createId();
  }

  update(update: Partial<RouteData>) {
    this._data$.next({
      ...this.data,
      ...update,
    });
  }

  restore({ id, ...data }: RouteData) {
    if (id !== this.id) {
      throw new Error("Route id mismatch");
    }
    this._data$.next(data);
  }
}
