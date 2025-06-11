import { Observable } from "rxjs";
import { Project } from "~/project/_.js";
import { Identifiable } from "../_shared/_.js";
import { StyleFragmentRegistry } from "./stylesheet/_.js";
import { Style } from "./stylesheet/style.js";

export interface Keyframe {
  style: Style;

  offset: number | undefined;
  offset$: Observable<number | undefined>;

  setOffset(offset: number | undefined): void;
}

export interface KeyframeSet extends Identifiable {
  style: Style;
  fragmentRegistry: StyleFragmentRegistry;

  keyframes: Keyframe[];
  keyframes$: Observable<Keyframe[]>;

  addKeyframe(keyframe: Keyframe): void;
  removeKeyframe(index: number): void;
}

export interface KeyframeSheet {
  project: Project;

  keyframeSets: KeyframeSet[];
  keyframeSets$: Observable<KeyframeSet[]>;

  keyframeSet(id: string): KeyframeSet | undefined;
  keyframeSet$(id: string): Observable<KeyframeSet | undefined>;

  addKeyframeSet(keyframe: KeyframeSet): void;
  removeKeyframeSet(id: string): void;
}
