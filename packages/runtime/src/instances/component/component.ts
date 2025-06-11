import { Component } from "@elllphnt/elementa-core";
import {
  BehaviorSubject,
  Observable,
  combineLatest,
  map,
  of,
  switchMap,
} from "rxjs";
import {
  ExpressionElementInstance,
  FragmentElementInstance,
} from "../elements/_.js";
import { ElementaInstanceType, Instance } from "../instance.js";
import { ModelInstance } from "../model.js";
import { ComponentInstanceFragmentEnvironment } from "./fragment_environment.js";
import { ComponentInputResolver } from "./input_resolver/input_resolver.js";

export class ComponentInstance extends ModelInstance<Component> {
  readonly fragmentEnvironment: ComponentInstanceFragmentEnvironment;

  readonly _template$ = new BehaviorSubject<
    FragmentElementInstance | ExpressionElementInstance | undefined
  >(undefined);

  get template() {
    return this._template$.value;
  }
  get template$() {
    return this._template$.asObservable();
  }

  constructor({
    model,
    inputResolver,
    parent,
  }: {
    model: Component;
    inputResolver: ComponentInputResolver;
    parent?: Instance;
  }) {
    super({
      model,
      type: ElementaInstanceType.Component,
      runtime: inputResolver.environment.runtime,
      parent,
    });
    this.fragmentEnvironment = new ComponentInstanceFragmentEnvironment({
      componentInstance: this,
      propResolver: inputResolver,
    });

    const templateSubscription = this.model.template$.subscribe((template) => {
      const prev = this._template$.value;
      if (template) {
        switch (template.type) {
          case "fragment":
            this._template$.next(
              new FragmentElementInstance({
                element: template,
                environment: this.fragmentEnvironment,
                parent: this,
              })
            );
            break;
          case "expression":
            this._template$.next(
              new ExpressionElementInstance({
                element: template,
                environment: this.fragmentEnvironment,
                parent: this,
              })
            );
            break;
          default:
            throw new Error(`Unknown template type ${(template as any).type}`);
        }
      } else {
        this._template$.next(undefined);
      }
      prev?.dispose();
    });

    this.addDisposer(() => {
      templateSubscription.unsubscribe();
      this._template$.complete();
    });
  }

  get diagnosticLevel(): number {
    return Math.max(
      this.ownDiagnosticLevel,
      this.template?.diagnosticLevel ?? 0
    );
  }

  get diagnosticLevel$(): Observable<number> {
    return combineLatest([
      this.ownDiagnosticLevel$,
      this.template$.pipe(
        switchMap((template) => template?.diagnosticLevel$ ?? of(0))
      ),
    ]).pipe(map(([own, template]) => Math.max(own, template)));
  }
}
