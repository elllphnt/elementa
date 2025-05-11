import { Component } from "@elllphnt/elementa-models";
import { FragmentInstance } from "../fragment/_.js";
import { ElementaInstanceType, Instance } from "../instance.js";
import { ComponentInstanceFragmentEnvironment } from "./fragment_environment.js";
import { ComponentInputResolver } from "./input_resolver/input_resolver.js";

export class ComponentInstance extends Instance {
  readonly component: Component;
  readonly fragmentEnvironment: ComponentInstanceFragmentEnvironment;
  readonly template: FragmentInstance;

  constructor({
    component,
    inputResolver,
    parent,
  }: {
    component: Component;
    inputResolver: ComponentInputResolver;
    parent?: Instance;
  }) {
    super({
      type: ElementaInstanceType.Component,
      runtime: inputResolver.environment.runtime,
      parent,
    });
    this.component = component;
    this.fragmentEnvironment = new ComponentInstanceFragmentEnvironment({
      componentInstance: this,
      propResolver: inputResolver,
    });

    this.template = new FragmentInstance({
      environment: this.fragmentEnvironment,
      fragment: component.template,
    });
  }
}
