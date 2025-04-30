import { PrimitiveConfig, PrimitiveElementData } from "@elllphnt/elementa-base";
import { PrimitiveElement } from "@elllphnt/elementa-models";
import { reconcileList } from "@elllphnt/elementa-utils";
import { BehaviorSubject, combineLatest, map, Observable, of } from "rxjs";
import { FragmentEnvironment } from "../fragment/environment/environment";
import { Instance } from "../instance";
import { ElementInstance } from "./element";
import { createElementInstance } from "./_create";

export class PrimitiveElementInstance extends ElementInstance<PrimitiveElement> {
  private _content$ = new BehaviorSubject<ElementInstance[]>([]);

  get content$(): Observable<ElementInstance[]> {
    return this._content$;
  }
  get content(): ElementInstance[] {
    return this._content$.value;
  }

  get module() {
    if (!this.element.absoluteModuleUrl) return undefined;
    return this.runtime.moduleManager.module(this.element.absoluteModuleUrl);
  }

  get localComponent() {
    return this.module?.value.default;
  }
  get localComponent$() {
    return (
      this.module?.value$.pipe(
        map((module) => {
          return module?.default;
        })
      ) ?? of(undefined)
    );
  }

  get config(): PrimitiveConfig | undefined {
    return this.module?.value.config;
  }
  get config$(): Observable<PrimitiveConfig | undefined> {
    return (
      this.module?.value$.pipe(
        map((value) => {
          return value.config;
        })
      ) ?? of(undefined)
    );
  }

  get isContainer() {
    return this.config?.isContainer ?? false;
  }
  get isContainer$() {
    return this.config$.pipe(
      map((config) => {
        return config?.isContainer ?? false;
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
    parent?: Instance;
  }) {
    super({
      element,
      environment,
      parent,
    });

    const contentSubscription = combineLatest([
      this.element.content.observable$,
      this.isContainer$,
    ]).subscribe(([_content, isContainer]) => {
      let content = isContainer ? _content : [];

      const [newContent, removed] = reconcileList({
        sources: content,
        targets: this.content,
        sourceRef: (e) => e,
        targetRef: (i) => i.element,
        create: (element) =>
          createElementInstance({
            element,
            environment: this.environment,
            parent: this,
          }),
      });
      this._content$.next(newContent);
      removed.forEach((instance) => {
        instance.dispose();
      });
    });

    this.addDisposer(() => {
      contentSubscription.unsubscribe();

      this.content.forEach((instance) => instance.dispose());
      this._content$.complete();
      this._content$.next([]);
    });
  }

  async initialize() {
    const moduleUrl = this.element.absoluteModuleUrl;
    if (!moduleUrl) return;
    const module = await this.runtime.moduleManager.getModule<{
      config?: PrimitiveConfig;
    }>(moduleUrl);
    const init = module?.config?.init;
    if (init) {
      const data = this.element.toJSON() as PrimitiveElementData;
      this.element.restore({
        ...data,
        ...init,
        id: this.element.id,
        type: this.element.type,
      });
    }
  }
}
