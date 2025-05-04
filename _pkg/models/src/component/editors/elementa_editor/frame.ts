import { CornerData, ElementaFrameData } from "@elllphnt/elementa-base";
import { setEnhancer, setModelFields } from "@elllphnt/elementa-utils";
import { Observable, of, switchMap } from "rxjs";
import * as y from "yjs";
import { attachIdentifiable, Identifiable } from "../../identifiable";
import {
  attachRenderingContext,
  RenderingContext,
} from "../elementa/rendering_context";
import { ElementaEditorComponentState } from "./state";

export type ElementaFrame = Identifiable<ElementaFrameData> & {
  componentState: ElementaEditorComponentState;
  renderingContext: RenderingContext;

  name: string | undefined;
  name$: Observable<string | undefined>;

  fragmentId: string | undefined;
  fragmentId$: Observable<string | undefined>;

  fragment: unknown;
  fragment$: Observable<unknown>;

  x: number | undefined;
  x$: Observable<number | undefined>;

  y: number | undefined;
  y$: Observable<number | undefined>;

  height: number | undefined;
  height$: Observable<number | undefined>;

  width: number | undefined;
  width$: Observable<number | undefined>;

  corners: CornerData<number> | undefined;
  corners$: Observable<CornerData<number> | undefined>;

  remove(): void;
  cloneIds(clone: y.Map<unknown>): void;
};

/**
 * Attach ElementaFrame behavior to a y.Map
 */
export function attachElementaFrame(
  ymap: y.Map<unknown>,
  componentState: ElementaEditorComponentState
): ElementaFrame {
  const identifiable = attachIdentifiable<ElementaFrameData>(
    ymap as y.Map<unknown>
  );
  const frame = identifiable as ElementaFrame;

  frame.componentState = componentState;
  frame.renderingContext = attachRenderingContext(
    ymap,
    componentState.component
  );

  setModelFields(identifiable, [
    "name",
    "fragmentId",
    "x",
    "y",
    "height",
    "width",
    "corners",
  ]);

  // Fragment dynamic lookup
  Object.defineProperty(frame, "fragment", {
    get() {
      return frame.fragmentId
        ? frame.componentState.component.fragment(frame.fragmentId)
        : frame.componentState.component.template;
    },
  });
  frame.fragment$ = frame.fragmentId$.pipe(
    switchMap((fragmentId) => {
      return fragmentId
        ? frame.componentState.component.fragment$(fragmentId)
        : of(frame.componentState.component.template);
    })
  );

  // Methods
  frame.cloneIds = (clone: y.Map<unknown>) => {
    frame.cloneOwnId(clone);
  };

  frame.remove = () => {
    const index = frame.componentState.frames.toArray().indexOf(frame);
    frame.componentState.frames.delete(index);
  };

  setEnhancer(frame, attachElementaFrame);
  return frame;
}

export function createElementaFrame(
  componentState: ElementaEditorComponentState
): ElementaFrame {
  const ymap = new y.Map<unknown>();
  return attachElementaFrame(ymap, componentState);
}
