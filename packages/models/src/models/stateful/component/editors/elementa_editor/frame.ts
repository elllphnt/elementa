import { CornerData, ElementaFrameData } from "@elllphnt/elementa-base";
import {
  assert,
  getOrCreateYMap,
  setEnhancer,
  setModelFields,
} from "@elllphnt/elementa-utils";
import { Observable, of, switchMap } from "rxjs";
import * as y from "yjs";
import { attachIdentifiable, Identifiable } from "../../identifiable.js";
import { createRenderableContent, RenderableContent } from "../elementa/_.js";
import {
  attachRenderingContext,
  RenderingContext,
} from "../elementa/rendering_context.js";
import { ElementaStage } from "./stage.js";

export type ElementaFrame = Identifiable<ElementaFrameData> & {
  componentState: ElementaStage;
  renderingContext: RenderingContext;
  content: RenderableContent;

  name: string | undefined;
  name$: Observable<string | undefined>;

  fragmentId: string | undefined;
  fragmentId$: Observable<string | undefined>;

  fragment: any;
  fragment$: Observable<any>;

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
  cloneIds(clone: y.Map<any>): void;
};

/**
 * Attach ElementaFrame behavior to a y.Map
 */
export function attachElementaFrame(
  ymap: y.Map<any>,
  componentState: ElementaStage
): ymap is ElementaFrame {
  attachIdentifiable<ElementaFrameData>(ymap as y.Map<any>);
  const frame = ymap as ElementaFrame;

  frame.componentState = componentState;

  setModelFields(frame, ["name", "x", "y", "height", "width", "corners"]);

  const renderingContext = getOrCreateYMap(frame, "renderingContext");
  assert(attachRenderingContext(renderingContext, componentState.component));
  frame.renderingContext = renderingContext;

  const renderableContent = getOrCreateYMap(frame, "renderableContent");
  assert(createRenderableContent(renderableContent, componentState.component));
  frame.content = renderableContent;

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
  frame.cloneIds = (clone: y.Map<any>) => {
    frame.cloneOwnId(clone);
  };

  frame.remove = () => {
    const index = frame.componentState.frames.toArray().indexOf(frame);
    frame.componentState.frames.delete(index);
  };

  setEnhancer(frame, attachElementaFrame);
  return true;
}

export function createElementaFrame(
  componentState: ElementaStage
): ElementaFrame {
  const ymap = new y.Map<any>();
  attachElementaFrame(ymap, componentState);
  return ymap as ElementaFrame;
}
