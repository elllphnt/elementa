import { AppVariableData } from "@elllphnt/elementa-base";
import { MapCRDTModel } from "@elllphnt/elementa-utils";
import { distinctUntilChanged, map } from "rxjs";
import * as y from "yjs";
import { App } from "./app";

export class AppVariable extends MapCRDTModel<AppVariableData> {
  readonly app: App;

  get varName() {
    return this.state.varName;
  }
  get varName$() {
    return this.state$.pipe(
      map((data) => data.varName),
      distinctUntilChanged()
    );
  }

  get name() {
    return this.state.name;
  }
  get name$() {
    return this.state$.pipe(
      map((data) => data.name),
      distinctUntilChanged()
    );
  }

  get tsType() {
    return this.state.tsType;
  }
  get tsType$() {
    return this.state$.pipe(
      map((data) => data.tsType),
      distinctUntilChanged()
    );
  }

  get scope() {
    return this.state.scope;
  }
  get scope$() {
    return this.state$.pipe(
      map((data) => data.scope),
      distinctUntilChanged()
    );
  }

  get description() {
    return this.state.description;
  }
  get description$() {
    return this.state$.pipe(
      map((data) => data.description),
      distinctUntilChanged()
    );
  }

  constructor({ ymap, app }: { ymap: y.Map<any>; app: App }) {
    super(ymap);
    this.app = app;
  }
}
