import { setEnhancer } from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import * as y from "yjs";
import { Component } from "./component";
import { Fragment, FragmentVariant, attachFragment } from "./fragment";

export type Template = Fragment & {
  name: string;
  name$: Observable<string>;
};

export function attachTemplate(
  ymap: y.Map<any>,
  component: Component
): Template {
  const template = attachFragment(
    ymap,
    component,
    FragmentVariant.Template
  ) as Template;

  Object.defineProperty(template, "name", {
    get() {
      return template.component.name;
    },
  });

  template.name$ = template.component.name$;

  setEnhancer(template, attachTemplate);
  return template;
}

export function createTemplate(component: Component): Template {
  const ymap = new y.Map<any>();
  return attachTemplate(ymap, component);
}
