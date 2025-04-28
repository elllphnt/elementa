import * as y from "yjs";
import { Component } from "./component";
import {
  FragmentModel,
  FragmentVariant,
  withFragmentBehavior,
} from "./fragment";

export type TemplateModel = FragmentModel & {
  name: string;
  name$: ReturnType<Component["name$"]>;
};

/**
 * Attach Template behavior to a y.Map
 */
export function withTemplateBehavior(
  ymap: y.Map<any>,
  component: Component
): TemplateModel {
  const template = withFragmentBehavior(
    ymap,
    component,
    FragmentVariant.Template
  ) as TemplateModel;

  Object.defineProperty(template, "name", {
    get() {
      return template.component.name;
    },
  });

  template.name$ = template.component.name$;

  return template;
}

/**
 * Create a new local Template
 */
export function createTemplateModel(component: Component): TemplateModel {
  const ymap = new y.Map<any>();
  return withTemplateBehavior(ymap, component);
}
