import {
  assert,
  setEnhancer,
  setObjectGetter,
  setObjectProperty,
} from "@elllphnt/elementa-utils";
import * as y from "yjs";
import { Component } from "../../../_.js";
import { Template } from "../../_interfaces/component/template.js";
import { FragmentVariant, attachFragment } from "./fragment.js";

export function attachTemplate(
  template: y.Map<any>,
  component: Component
): template is y.Map<any> & Template {
  assert(attachFragment(template, component, FragmentVariant.Template));

  assert(setObjectGetter(template, "name", () => template.component.name));

  assert(setObjectProperty(template, "name$", template.component.name$));

  const baseDispose = (template as any).dispose?.bind(template);
  (template as any).dispose = () => {
    baseDispose?.();
  };

  return setEnhancer<Template>(template, attachTemplate);
}
