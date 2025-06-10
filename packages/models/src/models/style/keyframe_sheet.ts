import { Observable } from "rxjs";
import { Project } from "~/project/_.js";
import { Identifiable } from "../_shared/_.js";
import { Style } from "./stylesheet/style.js";

export interface Keyframe extends Identifiable {
  style: Style;
  style$: Observable<Style>;

  offset: number | undefined;
  offset$: Observable<number | undefined>;

  setOffset(offset: number | undefined): void;
}

export interface KeyframeSheet {
  project: Project;

  keyframes: Keyframe[];
  keyframes$: Observable<Keyframe[]>;

  keyframe(id: string): Keyframe | undefined;
  keyframe$(id: string): Observable<Keyframe | undefined>;

  addKeyframe(keyframe: Keyframe): void;
  removeKeyframe(id: string): void;
}
