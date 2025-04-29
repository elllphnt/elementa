import { Component } from "@elllphnt/elementa-models";
import { FragmentInstance, Instance } from "../_";
import { FragmentEnvironment } from "../fragment/environment/environment";
import { ComponentInstanceFragmentEnvironment } from "./fragment_environment";
import { ComponentPropResolver } from "./prop_resolver";

export class ComponentInstance extends Instance {
  readonly environment: FragmentEnvironment;
  readonly template: FragmentInstance;

  constructor({
    component,
    propResolver,
  }: {
    component: Component;
    propResolver: ComponentPropResolver;
  }) {
    super(propResolver.environment.elementa);
    this.environment = new ComponentInstanceFragmentEnvironment({
      component,
      propResolver,
    });

    this.template = new FragmentInstance({
      environment: this.environment,
      fragment: component.template,
    });
  }
}
