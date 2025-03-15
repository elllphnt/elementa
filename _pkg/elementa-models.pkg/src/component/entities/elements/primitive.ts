import {
  entityTypes,
  Evaluable,
  PrimitiveElementData,
} from "@elllphnt/elll-element";
import {
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
  of,
  switchMap,
} from "rxjs";
import { Component } from "../../component";
import { ElementElementContainer } from "./_common/container";

export class PrimitiveElement extends ElementElementContainer<PrimitiveElementData> {
  private _initialized$ = new BehaviorSubject<boolean | undefined>(undefined);
  private _moduleUrl$ = new BehaviorSubject<string | undefined>(undefined);
  private _props$ = new BehaviorSubject<Record<string, Evaluable<any>>>({});

  get initialized() {
    return this._initialized$.value;
  }
  get initialized$() {
    return this._initialized$.asObservable();
  }

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

  get standardModuleUrl() {
    return this.absoluteModuleUrl
      ? this.component.project.infrastructure.fileSystem.getStandardFileUrl(
          this.absoluteModuleUrl,
        )
      : undefined;
  }
  get standardModuleUrl$() {
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

  get moduleName() {
    if (!this.standardModuleUrl) return undefined;
    return this.project.infrastructure.fileSystem.fileName(
      this.standardModuleUrl,
    );
  }
  get moduleName$() {
    return this.standardModuleUrl$.pipe(
      switchMap((url) => {
        return url
          ? this.project.infrastructure.fileSystem.fileName$(url)
          : of(undefined);
      }),
    );
  }

  get props() {
    return this._props$.value;
  }
  get props$() {
    return this._props$.asObservable();
  }

  prop(key: string) {
    return this._props$.value[key];
  }
  prop$(key: string) {
    return this._props$.asObservable().pipe(map((props) => props[key]));
  }

  get data(): PrimitiveElementData {
    return {
      ...super._data,
      initialized: this.initialized,
      moduleUrl: this.moduleUrl,
      props: this.props,
    };
  }
  get data$(): Observable<PrimitiveElementData> {
    return combineLatest([
      super._data$,
      this.initialized$,
      this.moduleUrl$,
      this.props$,
    ]).pipe(
      map(([data, initialized, moduleUrl, props]) => ({
        ...data,
        initialized,
        moduleUrl,
        props,
      })),
    );
  }

  constructor({ id, component }: { id?: string; component: Component }) {
    super({ id, type: entityTypes.elements.primitive, component });
  }

  setModuleUrl(moduleUrl: string | undefined) {
    this._moduleUrl$.next(moduleUrl);
  }

  setProp(key: string, value: Evaluable<any> | undefined) {
    const newProps = {
      ...this._props$.value,
    };

    if (value === undefined) {
      delete newProps[key];
    } else {
      newProps[key] = value;
    }

    this._props$.next(newProps);
  }

  restore(data: PrimitiveElementData) {
    super.restore(data);

    this._initialized$.next(data.initialized);
    this._moduleUrl$.next(data.moduleUrl);
    this._props$.next(data.props ?? {});
  }
}
