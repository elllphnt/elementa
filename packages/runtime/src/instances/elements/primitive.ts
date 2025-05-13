import {
  PrimitiveConfig,
  primitiveConfigSchema,
} from "@elllphnt/elementa-base";
import { PrimitiveElement } from "@elllphnt/elementa-models";
import { combineLatestOrEmpty, reconcileList } from "@elllphnt/elementa-utils";
import {
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
  of,
  switchMap,
} from "rxjs";
import { DiagnosticLevel } from "../../_shared/diagnosticable.js";
import { Module } from "../../runtime/module_manager/_.js";
import { FragmentEnvironment } from "../fragment/environment/environment.js";
import { Instance } from "../instance.js";
import { createElementInstance } from "./_element.js";
import { ElementInstance } from "./element.js";

export class PrimitiveElementInstance extends ElementInstance<PrimitiveElement> {
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
          this.element.project.absoluteFileUrl(this.element.primitiveUrl)
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
    environment: FragmentEnvironment;
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

    const configSubscription = this.module$
      .pipe(switchMap((m) => m?.value$ || of(undefined)))
      .subscribe((value) => {
        this.extractConfig(value);
      });

    this.addDisposer(() => {
      contentSubscription.unsubscribe();
      configSubscription.unsubscribe();

      this.content.forEach((instance) => instance.dispose());
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

  async initialize() {
    if (this.config?.init) {
      this.element.initialize(this.config?.init);
    }
  }
}
