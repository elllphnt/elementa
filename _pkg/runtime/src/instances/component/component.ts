import { Component } from "@elllphnt/elementa-models";
import { FragmentInstance } from "../fragment/_";
import { ElementaInstanceType, Instance } from "../instance";
import { ComponentInstanceFragmentEnvironment } from "./fragment_environment";
import { ComponentInputResolver } from "./input_resolver/input_resolver";

export class ComponentInstance extends Instance {
  readonly component: Component;
  readonly fragmentEnvironment: ComponentInstanceFragmentEnvironment;
  readonly template: FragmentInstance;

  constructor({
    component,
    propResolver,
    parent,
  }: {
    component: Component;
    propResolver: ComponentInputResolver;
    parent?: Instance;
  }) {
    super({
      type: ElementaInstanceType.Component,
      runtime: propResolver.environment.runtime,
      parent,
    });
    this.component = component;
    this.fragmentEnvironment = new ComponentInstanceFragmentEnvironment({
      componentInstance: this,
      propResolver,
    });

    this.template = new FragmentInstance({
      environment: this.fragmentEnvironment,
      fragment: component.template,
    });
  }
}
