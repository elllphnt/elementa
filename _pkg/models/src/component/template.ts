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
): ymap is Template {
  if (!attachFragment(ymap, component, FragmentVariant.Template)) {
    throw new Error("Failed to attach fragment to ymap");
  }
  const template = ymap as Template;

  Object.defineProperty(template, "name", {
    get() {
      return template.component.name;
    },
  });

  template.name$ = template.component.name$;

  setEnhancer(template, attachTemplate);
  return true;
}

export function createTemplate(component: Component): Template {
  const ymap = new y.Map<any>();
  if (!attachTemplate(ymap, component)) {
    throw new Error("Failed to create Template");
  }
  return ymap as Template;
}
