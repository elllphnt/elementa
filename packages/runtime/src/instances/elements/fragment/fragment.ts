import { FragmentElement } from "@elllphnt/elementa-core";
import {
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
  of,
  switchMap,
} from "rxjs";
import { FragmentInstance } from "~/instances/_.js";
import { FragmentEnvironment } from "../../fragment/environment/environment.js";
import { Instance } from "../../instance.js";
import { BaseElementInstance } from "../_base.js";
import { FragmentElementFragmentInputResolver } from "./fragment_input_resolver.js";

export class FragmentElementInstance extends BaseElementInstance<FragmentElement> {
  readonly fragmentPropsResolver: FragmentElementFragmentInputResolver;
  private _fragment$ = new BehaviorSubject<FragmentInstance | undefined>(
    undefined
  );

  get fragment$() {
    return this._fragment$.asObservable();
  }
  get fragment() {
    return this._fragment$.value;
  }

  get diagnosticLevel(): number {
    return Math.max(super.diagnosticLevel, this.fragment?.diagnosticLevel ?? 0);
  }

  get diagnosticLevel$(): Observable<number> {
    return combineLatest([
      super.diagnosticLevel$,
      this.fragment$.pipe(
        switchMap((fragment) => fragment?.diagnosticLevel$ ?? of(0))
      ),
    ]).pipe(map(([own, fragment]) => Math.max(own, fragment)));
  }

  constructor({
    element,
    environment,
    parent,
  }: {
    element: FragmentElement;
    environment: FragmentEnvironment;
    parent?: Instance;
  }) {
    super({
      element,
      environment,
      parent,
    });

    this.fragmentPropsResolver = new FragmentElementFragmentInputResolver(this);

    const fragmentSubscription = this.element.fragment$.subscribe(
      (fragment) => {
        if (fragment) {
          const currentFragment = this.fragment;
          const fragmentInstance = new FragmentInstance({
            model: fragment,
            inputResolver: this.fragmentPropsResolver,
          });
          this._fragment$.next(fragmentInstance);
          if (currentFragment) {
            currentFragment.dispose();
          }
        } else {
          this._fragment$.next(undefined);
        }
      }
    );

    this.addDisposer(() => {
      fragmentSubscription.unsubscribe();
    });
  }
}
