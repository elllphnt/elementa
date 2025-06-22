import { VectorNodeData } from "@elllphnt/elementa-base";
import { Observable } from "rxjs";
import { BaseElement } from "./_base.js";

export interface VectorElement extends BaseElement<"vector"> {
  content: VectorNodeData[] | undefined;
  content$: Observable<VectorNodeData[] | undefined>;
}
