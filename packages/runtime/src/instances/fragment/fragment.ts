import { Fragment } from "@elllphnt/elementa-models";
import { reconcileList } from "@elllphnt/elementa-utils";
import { BehaviorSubject, combineLatest, Observable } from "rxjs";
import { createElementInstance } from "../elements/_element.js";
import { ElementInstance } from "../elements/element.js";
import { ElementaInstanceType, Instance } from "../instance.js";
import { ModelInstance } from "../model.js";
import { SlotInstance } from "../slot/slot.js";
import { FragmentEnvironment } from "./environment/environment.js";

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

  constructor({
    model,
    environment,
    parent,
  }: {
    model: Fragment;
    environment: FragmentEnvironment;
    parent?: Instance;
  }) {
    super({
      model,
      type: ElementaInstanceType.Fragment,
      runtime: environment.runtime,
      parent,
    });
    this.environment = environment;

    const contentSubscription = combineLatest([
      this.model.content$,
      this.environment.fragmentStack$,
    ]).subscribe(([content, componentStack]) => {
      console.log({ content, componentStack });
      const recursion = this.resolveRecursion(componentStack);
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
