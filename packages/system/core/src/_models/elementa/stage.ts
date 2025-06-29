import { ElementaFrameData } from "@elllphnt/elementa-base";
import { Observable } from "rxjs";
import { ElementaEnvironment } from "./environment.js";
import { ElementaFrame } from "./frame.js";

export interface ElementaStage {
  environment: ElementaEnvironment;

  frames: ElementaFrame[];
  frames$: Observable<ElementaFrame[]>;

  addFrame(frame: ElementaFrameData): void;
  removeFrame(frame: ElementaFrame): void;
}
