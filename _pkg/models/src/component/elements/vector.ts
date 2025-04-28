import { VectorElementData, VectorNodeData } from "@elllphnt/elementa-base";
import { Extendable, setModelFields } from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import * as y from "yjs";
import { Component } from "../component";
import { attachBaseElement, Element } from "./element";

export type VectorElement = Element<VectorElementData> & {
  content: VectorNodeData[] | undefined;
  content$: Observable<VectorNodeData[] | undefined>;
};

export function attachVectorElement(
  ymap: y.Map<any>,
  component: Component
): VectorElement {
  const element = attachBaseElement(
    ymap,
    component
  ) as Extendable<VectorElement>;
  setModelFields(element, ["content"]);
  return element as VectorElement;
}

export function createVectorElement(component: Component): VectorElement {
  const ymap = new y.Map<any>();
  return attachVectorElement(ymap, component);
}
