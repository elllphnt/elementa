import { Observable } from "rxjs";
import { ElementaFrame } from "./frame.js";

export interface ElementaStage {
  frames: ElementaFrame[];
  frames$: Observable<ElementaFrame[]>;
}
