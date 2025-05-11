import { VectorNodeData } from "@elllphnt/elementa-base";
import { Observable } from "rxjs";
import { Element } from "./element.js";

export interface VectorElement extends Element {
  content: VectorNodeData[] | undefined;
  content$: Observable<VectorNodeData[] | undefined>;
}
