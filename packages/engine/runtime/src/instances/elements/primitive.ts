import type { PrimitiveConfig } from "@elllphnt/elementa-base";
import { primitiveConfigSchema } from "@elllphnt/elementa-base";
import { reconcileList } from "@elllphnt/elementa-kernel";
import { combineLatestOrEmpty } from "@elllphnt/elementa-lang-utils";
import type { PrimitiveElement } from "@elllphnt/elementa-models";
import type { Observable } from "rxjs";
import { BehaviorSubject, combineLatest, map, of, switchMap } from "rxjs";
import type { Module } from "~/runtime/module_manager/module.js";
import { DiagnosticLevel } from "../../_shared/diagnosticable.js";
import type { Instance } from "../instance.js";
import { BaseElementInstance } from "./_base.js";
import type { ElementInstance } from "./_element.js";
import { createElementInstance } from "./_element.js";
import type { ElementRuntimeEnvironment } from "./_environment/environment.js";

export class PrimitiveElementInstance extends BaseElementInstance<PrimitiveElement> {
  private _content$ = new BehaviorSubject<ElementInstance[]>([]);
  private _config$ = new BehaviorSubject<PrimitiveConfig | undefined>(
    undefined
  );

  get content$(): Observable<ElementInstance[]> {
    return this._content$;
  }
  get content(): ElementInstance[] {
    return this._content$.value;
  }

  get module(): Module | undefined {
    return this.element.primitiveUrl
      ? this.runtime.moduleManager.module(
          this.element.environment.project.absoluteFileUrl(
            this.element.primitiveUrl
          )
        )
      : undefined;
  }
  get module$(): Observable<Module | undefined> {
    return this.element.primitiveUrl$.pipe(
      map((url) => (url ? this.runtime.moduleManager.module(url) : undefined))
    );
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
    return this._config$.value;
  }
  get config$(): Observable<PrimitiveConfig | undefined> {
    return this._config$.asObservable();
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

  get diagnosticLevel(): number {
    return Math.max(
      super.diagnosticLevel,
      ...this.content.map((c) => c.diagnosticLevel)
    );
  }

  get diagnosticLevel$(): Observable<number> {
    return combineLatest([
      super.diagnosticLevel$,
      this.content$.pipe(
        switchMap((elements) =>
          combineLatestOrEmpty(elements.map((e) => e.diagnosticLevel$))
        )
      ),
    ]).pipe(map(([own, contentLevels]) => Math.max(own, ...contentLevels)));
  }

  constructor({
    element,
    environment,
    parent,
  }: {
    element: PrimitiveElement;
    environment: ElementRuntimeEnvironment;
    parent?: Instance;
  }) {
    super({
      element,
      environment,
      parent,
    });

    const contentSubscription = combineLatest([
      this.element.content$,
      this.isContainer$,
    ]).subscribe(([_content, isContainer]) => {
      const content = isContainer ? _content : [];

      const [newContent, removed] = reconcileList({
        sources: content,
        targets: this.content,
        sourceRef: (e) => e,
        targetRef: (i) => i.element,
        create: (element) => {
          const instance = createElementInstance({
            element,
            environment: this.environment,
            parent: this,
          });
          this.addLifecycle(instance);
          return instance;
        },
      });
      this._content$.next(newContent);
      removed.forEach((instance) => {
        this.removeLifecycle(instance);
        instance.dispose();
      });
    });

    const configSubscription = this.module$
      .pipe(switchMap((m) => m?.value$ || of(undefined)))
      .subscribe((value) => {
        this.extractConfig(value);
      });

    this.addDisposer(() => {
      contentSubscription.unsubscribe();
      configSubscription.unsubscribe();

      this.content.forEach((instance) => {
        this.removeLifecycle(instance);
        instance.dispose();
      });
      this._content$.complete();
      this._content$.next([]);
    });
  }

  private extractConfig(moduleValue: unknown) {
    const diagnosticKey = "config-extraction";
    if (
      typeof moduleValue === "object" &&
      moduleValue !== null &&
      "config" in moduleValue
    ) {
      const { error, data: config } = primitiveConfigSchema.safeParse(
        moduleValue.config
      );
      if (error) {
        this._config$.next(undefined);
        this.setDiagnostic(diagnosticKey, {
          level: DiagnosticLevel.Error,
          message: "Invalid Primitive Config",
          entries: error.issues.map((i) => ({
            level: DiagnosticLevel.Error,
            message: i.message,
          })),
        });
      } else {
        this._config$.next(config);
        this.clearDiagnostic(diagnosticKey);
      }
    } else {
      this._config$.next(undefined);
    }
  }
}
