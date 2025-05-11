import { VectorElementData, VectorNodeData } from "@elllphnt/elementa-base";
import { setReactiveMapGetters } from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import * as y from "yjs";
import { Fragment } from "../fragment.js";
import { attachBaseElement, Element } from "./element.js";

export type VectorElement = Element<VectorElementData> & {
  content: VectorNodeData[] | undefined;
  content$: Observable<VectorNodeData[] | undefined>;
};

export function attachVectorElement(
  ymap: y.Map<any>,
  fragment: Fragment
): ymap is VectorElement {
  ymap.set("type", "vector");
  if (!attachBaseElement(ymap as y.Map<any>, fragment)) {
    throw new Error("Failed to attach base element to ymap");
  }
  const element = ymap as VectorElement;
  setReactiveMapGetters(element, ["content"]);
  return true;
}

export function createVectorElement(fragment: Fragment): VectorElement {
  const ymap = new y.Map<any>();
  if (!attachVectorElement(ymap, fragment)) {
    throw new Error("Failed to create VectorElement");
  }
  return ymap as VectorElement;
}
