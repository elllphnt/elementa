import { Fragment } from "@elllphnt/elementa-core";
import { combineLatestOrEmpty, reconcileList } from "@elllphnt/elementa-utils";
import {
  BehaviorSubject,
  Observable,
  combineLatest,
  map,
  switchMap,
} from "rxjs";
import { ElementInstance } from "../elements/_.js";
import { createElementInstance } from "../elements/_element.js";
import { ElementaInstanceType, Instance } from "../instance.js";
import { ModelInstance } from "../model.js";
import { SlotInstance } from "../slot/slot.js";
import { ChildFragmentEnvironment } from "./environment/child_environment.js";
import { FragmentEnvironment } from "./environment/environment.js";
import { FragmentInputResolver } from "./input_resolver/_.js";

export class FragmentFragmentEnvironment extends ChildFragmentEnvironment {
  readonly fragment: Fragment;

  get fragmentStack(): string[] {
    return [...this.parent.fragmentStack, this.fragment.id];
  }
  get fragmentStack$(): Observable<string[]> {
    return this.parent.fragmentStack$.pipe(
      map((stack) => [...stack, this.fragment.id])
    );
  }

  constructor({
    parent,
    fragment,
  }: {
    parent: FragmentEnvironment;
    fragment: Fragment;
  }) {
    super({ parent });
    this.fragment = fragment;
  }
}

export class FragmentInstance extends ModelInstance<Fragment> {
  readonly environment: FragmentEnvironment;

  private _content$ = new BehaviorSubject<ElementInstance[]>([]);
  private _slots$ = new BehaviorSubject<SlotInstance[]>([]);
  private _recursion$ = new BehaviorSubject<string | undefined>(undefined);

  get content$(): Observable<ElementInstance[]> {
    return this._content$.asObservable();
  }
  get content(): ElementInstance[] {
    return this._content$.value;
  }

  get slots$(): Observable<SlotInstance[]> {
    return this._slots$.asObservable();
  }
  get slots(): SlotInstance[] {
    return this._slots$.value;
  }

  get recursion$() {
    return this._recursion$.asObservable();
  }
  get recursion() {
    return this._recursion$.value;
  }

  get diagnosticLevel(): number {
    return Math.max(
      this.ownDiagnosticLevel,
      ...this.content.map((c) => c.diagnosticLevel),
      ...this.slots.map((s) => s.diagnosticLevel)
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
      this.slots$.pipe(
        switchMap((slots) =>
          combineLatestOrEmpty(slots.map((s) => s.diagnosticLevel$))
        )
      ),
    ]).pipe(
      map(([own, elementLevels, slotLevels]) =>
        Math.max(own, ...elementLevels, ...slotLevels)
      )
    );
  }

  constructor({
    model,
    inputResolver,
    parent,
  }: {
    model: Fragment;
    inputResolver: FragmentInputResolver;
    parent?: Instance;
  }) {
    super({
      model,
      type: ElementaInstanceType.Fragment,
      runtime: inputResolver.environment.runtime,
      parent,
    });
    this.environment = new FragmentFragmentEnvironment({
      parent: inputResolver.environment,
      fragment: model,
    });

    const contentSubscription = combineLatest([
      this.model.content$,
      this.environment.fragmentStack$,
    ]).subscribe(([content, fragmentStack]) => {
      const recursion = this.resolveRecursion(fragmentStack);
      const [newContent, removed] = reconcileList({
        sources: recursion ? [] : content,
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
      this._recursion$.next(recursion);
      removed.forEach((instance) => {
        instance.dispose();
      });
    });

    const slotsSubscription = this.model.slotIds$.subscribe((slots) => {
      const [newSlots, removed] = reconcileList({
        targets: this.slots,
        sources: slots,
        sourceRef: (s) => s,
        targetRef: (s) => s.slotId,
        create: (slot) =>
          new SlotInstance({
            slotId: slot,
            environment: this.environment,
            parent: this,
          }),
      });
      this._slots$.next(newSlots);
      removed.forEach((instance) => {
        instance.dispose();
      });
    });

    this.addDisposer(() => {
      contentSubscription.unsubscribe();
      this.content.forEach((instance) => instance.dispose());
      this._content$.next([]);
      this._content$.complete();

      slotsSubscription.unsubscribe();
      this.slots.forEach((instance) => instance.dispose());
      this._slots$.next([]);
      this._slots$.complete();
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
