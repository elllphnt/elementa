import { VectorElementData, VectorNodeData } from "@elllphnt/elementa-base";
import { setModelFields } from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import * as y from "yjs";
import { Fragment } from "../fragment";
import { attachBaseElement, Element } from "./element";

export type VectorElement = Element<VectorElementData> & {
  content: VectorNodeData[] | undefined;
  content$: Observable<VectorNodeData[] | undefined>;
};

export function attachVectorElement(
  ymap: y.Map<unknown>,
  fragment: Fragment
): ymap is VectorElement {
  ymap.set("type", "vector");
  if (!attachBaseElement(ymap as y.Map<unknown>, fragment)) {
    throw new Error("Failed to attach base element to ymap");
  }
  const element = ymap as VectorElement;
  setModelFields(element, ["content"]);
  return true;
}

export function createVectorElement(fragment: Fragment): VectorElement {
  const ymap = new y.Map<unknown>();
  if (!attachVectorElement(ymap, fragment)) {
    throw new Error("Failed to create VectorElement");
  }
  return ymap as VectorElement;
}
