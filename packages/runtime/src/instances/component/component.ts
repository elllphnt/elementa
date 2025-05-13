import { Component } from "@elllphnt/elementa-models";
import { Observable, combineLatest, map } from "rxjs";
import { FragmentInstance } from "../fragment/_.js";
import { ElementaInstanceType, Instance } from "../instance.js";
import { ModelInstance } from "../model.js";
import { ComponentInstanceFragmentEnvironment } from "./fragment_environment.js";
import { ComponentInputResolver } from "./input_resolver/input_resolver.js";

export class ComponentInstance extends ModelInstance<Component> {
  readonly fragmentEnvironment: ComponentInstanceFragmentEnvironment;
  readonly template: FragmentInstance;

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

    this.template = new FragmentInstance({
      environment: this.fragmentEnvironment,
      model: model.template,
    });
  }

  get diagnosticLevel(): number {
    return Math.max(this.ownDiagnosticLevel, this.template.diagnosticLevel);
  }

  get diagnosticLevel$(): Observable<number> {
    return combineLatest([
      this.ownDiagnosticLevel$,
      this.template.diagnosticLevel$,
    ]).pipe(map(([own, template]) => Math.max(own, template)));
  }
}
