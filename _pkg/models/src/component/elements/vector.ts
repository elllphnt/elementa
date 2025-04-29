import { VectorElementData, VectorNodeData } from "@elllphnt/elementa-base";
import { Extendable, setModelFields } from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import * as y from "yjs";
import { Fragment } from "../fragment";
import { attachBaseElement, Element } from "./element";

export type VectorElement = Element<VectorElementData> & {
  content: VectorNodeData[] | undefined;
  content$: Observable<VectorNodeData[] | undefined>;
};

export function attachVectorElement(
  ymap: y.Map<any>,
  fragment: Fragment
): VectorElement {
  ymap.set("type", "vector");
  const element = attachBaseElement(
    ymap,
    fragment
  ) as Extendable<VectorElement>;
  setModelFields(element, ["content"]);
  return element as VectorElement;
}

export function createVectorElement(fragment: Fragment): VectorElement {
  const ymap = new y.Map<any>();
  return attachVectorElement(ymap, fragment);
}
