import { Observable } from "rxjs";
import { Project } from "../../../../../infrastructure/_.js";
import { ElementaFrame } from "./frame.js";

export interface ElementaStage {
  project: Project;

  frames: ElementaFrame[];
  frames$: Observable<ElementaFrame[]>;
}
