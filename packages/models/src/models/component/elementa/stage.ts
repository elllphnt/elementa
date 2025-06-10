import { ElementaFrameData } from "@elllphnt/elementa-base";
import { Observable } from "rxjs";
import { ElementaFrame } from "./frame.js";
import { Project } from "~/project/_.js";

export interface ElementaStage {
  project: Project;

  frames: ElementaFrame[];
  frames$: Observable<ElementaFrame[]>;

  addFrame(frame: ElementaFrameData): void;
  removeFrame(frame: ElementaFrame): void;
}
