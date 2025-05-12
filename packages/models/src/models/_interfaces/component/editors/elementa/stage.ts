import { ElementaFrameData } from "@elllphnt/elementa-base";
import { Observable } from "rxjs";
import { Project } from "../../../../../infrastructure/_.js";
import { ElementaFrame } from "./frame.js";

export interface ElementaStage {
  project: Project;

  frames: ElementaFrame[];
  frames$: Observable<ElementaFrame[]>;

  addFrame(frame: ElementaFrameData): void;
  removeFrame(frame: ElementaFrame): void;
}
