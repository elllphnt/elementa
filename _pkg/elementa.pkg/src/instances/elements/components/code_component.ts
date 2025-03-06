import { CodeComponentElement } from "@repo/elementa-models";
import { filter, first, map, Observable, of, switchMap } from "rxjs";
import { FragmentEnvironment } from "../../fragment/environment";
import { Instance } from "../../instance";
import { ComponentElementInstance } from "./component";

export class CodeComponentElementInstance extends ComponentElementInstance<CodeComponentElement> {
  get module() {
    if (!this.entity.absoluteComponentUrl) return undefined;
    return this.elementa.moduleManager.module(this.entity.absoluteComponentUrl);
  }
  get module$() {
    return this.entity.absoluteComponentUrl$.pipe(
      switchMap((url) => {
        return url ? this.elementa.moduleManager.module$(url) : of(undefined);
      }),
    );
  }

  get localComponent() {
    return this.module?.default;
  }
  get localComponent$() {
    return this.module$.pipe(
      map((module) => {
        return module?.default;
      }),
    );
  }

  get config(): CodeComponentConfig | undefined {
    return this.module?.config;
  }
  get config$(): Observable<CodeComponentConfig | undefined> {
    return this.module$.pipe(
      map((module) => {
        return module?.config;
      }),
    );
  }

  get isContainer() {
    return this.config?.isContainer ?? false;
  }
  get isContainer$() {
    return this.config$.pipe(
      map((config) => {
        return config?.isContainer ?? false;
      }),
    );
  }

  get isUnwrappable() {
    return this.config?.isUnwrappable ?? false;
  }
  get isUnwrappable$() {
    return this.config$.pipe(
      map((config) => {
        return config?.isUnwrappable ?? false;
      }),
    );
  }

  constructor({
    element,
    environment,
    parent,
  }: {
    element: CodeComponentElement;
    environment: FragmentEnvironment;
    parent: Instance | null;
  }) {
    super({
      element,
      environment,
      parent,
    });

    // on config ready, if not already initialized, initialize with config
    const configSubscription = this.config$
      .pipe(
        map((config) => config?.init),
        filter(Boolean),
        first(),
      )
      .subscribe((init) => {
        if (!this.entity.initialized) {
          console.log("Initializing with config", init);
          this.entity.restore({
            ...this.entity.data,
            ...init,
            initialized: true,
            componentUrl: this.entity.componentUrl,
          });
        }
      });

    this.watchContent();

    this.addDisposer(() => {
      configSubscription.unsubscribe();
    });
  }
}
