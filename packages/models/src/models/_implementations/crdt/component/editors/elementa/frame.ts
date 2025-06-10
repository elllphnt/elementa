import { ElementaFrameData } from "@elllphnt/elementa-base";
import {
  assert,
  getOrCreateYMap,
  setEnhancer,
  setObjectProperty,
  setReactiveMapGetters,
  setReactiveMapSetters,
} from "@elllphnt/elementa-utils";
import * as y from "yjs";
import {
  ElementaFrame,
  ElementaStage,
  RenderableContent,
  RenderingContext,
} from "../../../../../_.js";
import { attachIdentifiable } from "../../identifiable.js";
import { attachRenderableContent } from "./_.js";
import { attachRenderingContext } from "./rendering_context.js";

export function attachElementaFrame(
  frame: y.Map<any>,
  stage: ElementaStage
): frame is y.Map<any> & ElementaFrame {
  assert(attachIdentifiable<ElementaFrameData>(frame));

  assert(
    setReactiveMapGetters(frame, [
      "name",
      "x",
      "y",
      "height",
      "width",
      "corners",
    ])
  );

  assert(
    setReactiveMapSetters(frame, [
      ["setName", "name"],
      ["setX", "x"],
      ["setY", "y"],
      ["setHeight", "height"],
      ["setWidth", "width"],
      ["setCorners", "corners"],
    ] as const)
  );

  assert(setObjectProperty(frame, "stage", stage));

  const renderingContext = getOrCreateYMap(frame, "renderingContext");
  assert(attachRenderingContext(renderingContext, stage.project));
  assert(
    setObjectProperty(frame, "context", renderingContext as RenderingContext)
  );

  const renderableContent = getOrCreateYMap(frame, "renderableContent");
  assert(attachRenderableContent(renderableContent, stage.project));
  assert(
    setObjectProperty(frame, "content", renderableContent as RenderableContent)
  );

  assert(
    setObjectProperty(frame, "remove", () => {
      // todo: remove from stage
    })
  );

  return setEnhancer<ElementaFrame>(frame, attachElementaFrame);
}
