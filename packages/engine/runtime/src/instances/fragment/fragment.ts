import { reconcileList } from "@elllphnt/elementa-kernel";
import { combineLatestOrEmpty } from "@elllphnt/elementa-lang-utils";
import type { Fragment } from "@elllphnt/elementa-models";
import type { Observable } from "rxjs";
import { BehaviorSubject, combineLatest, map, switchMap } from "rxjs";
import type { ElementInstance } from "../elements/_element.js";
import { createElementInstance } from "../elements/_element.js";
import { ChildElementRuntimeEnvironment } from "../elements/_environment/child_environment.js";
import type { ElementRuntimeEnvironment } from "../elements/_environment/environment.js";
import type { Instance } from "../instance.js";
import { ElementaInstanceType } from "../instance.js";
import { ModelInstance } from "../model.js";

export class FragmentFragmentEnvironment extends ChildElementRuntimeEnvironment {
  readonly fragment: Fragment;

  get fragmentStack(): string[] {
    return [...this.parent.fragmentStack, this.fragment.id];
  }

  constructor({
    parent,
    fragment,
  }: {
    parent: ElementRuntimeEnvironment;
    fragment: Fragment;
  }) {
    super({ parent });
    this.fragment = fragment;
  }
}

export class FragmentInstance extends ModelInstance<Fragment> {
  readonly environment: ElementRuntimeEnvironment;
  readonly recursive: boolean;
  private _content$ = new BehaviorSubject<ElementInstance[]>([]);

  get content$(): Observable<ElementInstance[]> {
    return this._content$.asObservable();
  }
  get content(): ElementInstance[] {
    return this._content$.value;
  }

  get diagnosticLevel(): number {
    return Math.max(
      this.ownDiagnosticLevel,
      ...this.content.map((c) => c.diagnosticLevel)
    );
  }
  get diagnosticLevel$(): Observable<number> {
    return combineLatest([
      this.ownDiagnosticLevel$,
      this.content$.pipe(
        switchMap((elements) =>
          combineLatestOrEmpty(elements.map((e) => e.diagnosticLevel$))
        )
      ),
    ]).pipe(map(([own, elementLevels]) => Math.max(own, ...elementLevels)));
  }

  constructor({
    model,
    environment,
    parent,
  }: {
    model: Fragment;
    environment: ElementRuntimeEnvironment;
    parent?: Instance;
  }) {
    super({
      model,
      type: ElementaInstanceType.Fragment,
      runtime: environment.runtime,
      parent,
    });
    this.environment = new FragmentFragmentEnvironment({
      parent: environment,
      fragment: model,
    });
    this.addLifecycle(this.environment);

    if (!this.environment.isFragmentRecursive()) {
      const contentSubscription = combineLatest([
        this.model.content$,
      ]).subscribe(([content]) => {
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

      this.addDisposer(() => {
        contentSubscription.unsubscribe();
      });
    } else {
      this.recursive = true;
    }

    this.addDisposer(() => {
      this.content.forEach((instance) => {
        this.removeLifecycle(instance);
        instance.dispose();
      });
      this._content$.next([]);
      this._content$.complete();
    });
  }

  private resolveRecursion(fragmentStack: string[]) {
    const set = new Set<string>();
    for (const fragment of fragmentStack) {
      if (set.has(fragment)) {
        return fragment;
      }
      set.add(fragment);
    }

    return undefined;
  }
}
