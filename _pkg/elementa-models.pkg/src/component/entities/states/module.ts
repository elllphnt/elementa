import {
  Expression,
  ModuleStateData,
  entityTypes,
} from "@elllphnt/elll-element";
import { combineLatestOrEmpty } from "@repo/utils";
import { BehaviorSubject, Observable, map } from "rxjs";
import { Component } from "../../component";
import { State } from "./state";

export class ModuleState extends State<ModuleStateData> {
  private _moduleUrl$ = new BehaviorSubject<string | undefined>(undefined);
  private _args$ = new BehaviorSubject<Expression[]>([]);

  get moduleUrl() {
    return this._moduleUrl$.value;
  }
  get moduleUrl$() {
    return this._moduleUrl$.asObservable();
  }

  get absoluteModuleUrl() {
    return this.moduleUrl
      ? this.component.project.infrastructure.fileSystem.getAbsoluteFileUrl(
          this.component.url,
          this.moduleUrl,
        )
      : undefined;
  }
  get absoluteModuleUrl$() {
    return this.moduleUrl$.pipe(
      map((url) => {
        return url
          ? this.component.project.infrastructure.fileSystem.getAbsoluteFileUrl(
              this.component.url,
              url,
            )
          : undefined;
      }),
    );
  }

  get standardComponentUrl() {
    return this.absoluteModuleUrl
      ? this.component.project.infrastructure.fileSystem.getStandardFileUrl(
          this.absoluteModuleUrl,
        )
      : undefined;
  }
  get standardComponentUrl$() {
    return this.absoluteModuleUrl$.pipe(
      map((url) => {
        return url
          ? this.component.project.infrastructure.fileSystem.getStandardFileUrl(
              url,
            )
          : undefined;
      }),
    );
  }

  get args() {
    return this._args$.value;
  }
  get args$() {
    return this._args$.asObservable();
  }

  arg(index: number) {
    return this.args[index];
  }
  arg$(index: number) {
    return this.args$.pipe(map((parameters) => parameters[index]));
  }

  get data(): ModuleStateData {
    return {
      ...super._data,
      moduleUrl: this.moduleUrl,
      type: this.type,
      args: this.args,
    };
  }
  get data$(): Observable<ModuleStateData> {
    return combineLatestOrEmpty([
      super._data$,
      this.moduleUrl$,
      this.args$,
    ]).pipe(
      map(([data, moduleUrl, parameters]) => ({
        ...data,
        moduleUrl,
        parameters,
      })),
    );
  }

  constructor({ id, component }: { id?: string; component: Component }) {
    super({
      id,
      component,
      type: entityTypes.states.module,
    });

    this.addDisposer(() => {
      this._args$.complete();
      this._moduleUrl$.complete();
    });
  }

  setArg(index: number, parameter: Expression) {
    const parameters = this.args;
    parameters[index] = parameter;
    this._args$.next(parameters);
  }
  setModuleUrl(moduleUrl: string | undefined) {
    this._moduleUrl$.next(moduleUrl);
  }

  restore(data: ModuleStateData) {
    super.restore(data);
    this._moduleUrl$.next(data.moduleUrl);
    this._args$.next(data.args ?? []);
  }
}
