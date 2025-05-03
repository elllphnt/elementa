import { Component } from "@elllphnt/elementa-models";
import { FragmentInstance } from "../fragment/_";
import { Instance, InstanceType } from "../instance";
import { ComponentInstanceFragmentEnvironment } from "./fragment_environment";
import { ComponentPropResolver } from "./prop_resolver/prop_resolver";

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
    propResolver: ComponentPropResolver;
    parent?: Instance;
  }) {
    super({
      type: InstanceType.Component,
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
