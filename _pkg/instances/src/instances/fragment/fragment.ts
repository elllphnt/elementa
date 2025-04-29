import { Fragment } from "@elllphnt/elementa-models";
import { reconcileList } from "@elllphnt/elementa-utils";
import { BehaviorSubject, combineLatest, Observable } from "rxjs";
import { makeElementInstance } from "~/src/instances/elements/_create";
import { ElementInstance } from "../elements/element";
import { Instance, InstanceType } from "../instance";
import { SlotInstance } from "../slot/slot";
import { FragmentEnvironment } from "./environment/environment";

export class FragmentInstance extends Instance {
  readonly fragment: Fragment;
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

  constructor({
    fragment,
    environment,
    parent,
  }: {
    fragment: Fragment;
    environment: FragmentEnvironment;
    parent?: Instance;
  }) {
    super({
      type: InstanceType.Fragment,
      runtime: environment.runtime,
      parent,
    });
    this.fragment = fragment;
    this.environment = environment;

    const contentSubscription = combineLatest([
      this.fragment.content.observable$,
      this.environment.componentStack$,
    ]).subscribe(([content, componentStack]) => {
      const recursion = this.resolveRecursion(componentStack);
      const [newContent, removed] = reconcileList({
        sources: recursion ? [] : content,
        targets: this.content,
        sourceRef: (e) => e,
        targetRef: (i) => i.element,
        create: (element) =>
          makeElementInstance({
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

    const slotsSubscription = this.fragment.slotIds$.subscribe((slots) => {
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

  private resolveRecursion(componentStack: string[]) {
    const set = new Set<string>();
    for (const component of componentStack) {
      if (set.has(component)) {
        return component;
      }
      set.add(component);
    }

    return undefined;
  }
}
