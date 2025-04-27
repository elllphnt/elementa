import { RouteData } from "@elllphnt/elll-element";
import { CRDTModel } from "@repo/utils";
import { distinctUntilChanged, map } from "rxjs";
import * as y from "yjs";
import { genId } from "../_lib/id";
import { App } from "./app";

export class Route extends CRDTModel<RouteData> {
  readonly app: App;

  get id() {
    return this.state.id;
  }

  get path() {
    return this.state.path;
  }
  get path$() {
    return this.state$.pipe(
      map((data) => data.path),
      distinctUntilChanged(),
    );
  }

  get parentId() {
    return this.state.parentId;
  }
  get parentId$() {
    return this.state$.pipe(
      map((data) => data.parentId),
      distinctUntilChanged(),
    );
  }

  get mainViewUrl() {
    return this.state.mainViewUrl;
  }
  get mainViewUrl$() {
    return this.state$.pipe(
      map((data) => data.mainViewUrl),
      distinctUntilChanged(),
    );
  }

  get errorViewUrl() {
    return this.state.errorViewUrl;
  }
  get errorViewUrl$() {
    return this.state$.pipe(
      map((data) => data.errorViewUrl),
      distinctUntilChanged(),
    );
  }

  get pendingViewUrl() {
    return this.state.pendingViewUrl;
  }
  get pendingViewUrl$() {
    return this.state$.pipe(
      map((data) => data.pendingViewUrl),
      distinctUntilChanged(),
    );
  }

  get notFoundViewUrl() {
    return this.state.notFoundViewUrl;
  }
  get notFoundViewUrl$() {
    return this.state$.pipe(
      map((data) => data.notFoundViewUrl),
      distinctUntilChanged(),
    );
  }

  get loaderUrl() {
    return this.state.loaderUrl;
  }
  get loaderUrl$() {
    return this.state$.pipe(
      map((data) => data.loaderUrl),
      distinctUntilChanged(),
    );
  }

  get handlerUrl() {
    return this.state.handlerUrl;
  }
  get handlerUrl$() {
    return this.state$.pipe(
      map((data) => data.handlerUrl),
      distinctUntilChanged(),
    );
  }

  constructor({ ymap, app }: { ymap: y.Map<any>; app: App }) {
    super(ymap);
    if (!this.id) {
      this.patch({
        id: genId(),
      });
    }

    this.app = app;
  }
}
