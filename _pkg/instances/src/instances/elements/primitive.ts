import { PrimitiveConfig } from "@elllphnt/elementa-base";
import { PrimitiveElement } from "@elllphnt/elementa-models";
import {
  BehaviorSubject,
  combineLatest,
  filter,
  first,
  map,
  Observable,
  of,
  switchMap,
} from "rxjs";
import { updateInstanceList } from "~/src/_lib/instances";
import { makeElementInstance } from "~/src/_lib/make_element_instance";
import { FragmentEnvironment } from "../fragment/environment";
import { Instance } from "../instance";
import { ElementInstance } from "./element";

export class PrimitiveElementInstance extends ElementInstance<PrimitiveElement> {
  private _content$ = new BehaviorSubject<ElementInstance[]>([]);

  get content$(): Observable<ElementInstance[]> {
    return this._content$;
  }
  get content(): ElementInstance[] {
    return this._content$.value;
  }

  get module() {
    if (!this.entity.absoluteModuleUrl) return undefined;
    return this.elementa.moduleManager.module(this.entity.absoluteModuleUrl);
  }
  get module$() {
    return this.entity.absoluteModuleUrl$.pipe(
      switchMap((url) => {
        return url ? this.elementa.moduleManager.module$(url) : of(undefined);
      })
    );
  }

  get localComponent() {
    return this.module?.default;
  }
  get localComponent$() {
    return this.module$.pipe(
      map((module) => {
        return module?.default;
      })
    );
  }

  get config(): PrimitiveConfig | undefined {
    return this.module?.config;
  }
  get config$(): Observable<PrimitiveConfig | undefined> {
    return this.module$.pipe(
      map((module) => {
        return module?.config;
      })
    );
  }

  get isContainer() {
    return this.config?.container ?? false;
  }
  get isContainer$() {
    return this.config$.pipe(
      map((config) => {
        return config?.container ?? false;
      })
    );
  }

  constructor({
    element,
    environment,
    parent,
  }: {
    element: PrimitiveElement;
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
        map((config) => config?.initializer),
        filter(Boolean),
        first()
      )
      .subscribe((init) => {
        if (!this.entity.initialized) {
          this.entity.restore({
            ...this.entity.data,
            ...init,
            initialized: true,
            moduleUrl: this.entity.moduleUrl,
          });
        }
      });

    const contentSubscription = combineLatest([
      this.entity.content$,
      this.entity.contentExpression$,
      this.isContainer$,
    ]).subscribe(([_content, contentExpression, isContainer]) => {
      let content = isContainer ? (contentExpression ? [] : _content) : [];

      const newContent = updateInstanceList({
        instances: this.content,
        entities: content,
        createInstance: (element) =>
          makeElementInstance({
            element,
            environment: this.environment,
            parent: this,
          }),
      });
      this._content$.next(newContent);
    });

    this.addDisposer(() => {
      configSubscription.unsubscribe();
      contentSubscription.unsubscribe();

      this.content.forEach((instance) => instance.dispose());
      this._content$.next([]);
      this._content$.complete();
    });
  }
}
