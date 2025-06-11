import { CornerName, ElementaPreviewData } from "@elllphnt/elementa-base";
import {
  assert,
  attachReactiveMap,
  getOrCreateYMap,
  setEnhancer,
  setObjectGetter,
  setObjectProperty,
  setReactiveMapGetters,
} from "@elllphnt/elementa-utils";
import { distinctUntilChanged, map, Observable } from "rxjs";
import * as y from "yjs";
import { Project } from "../../../../../../infrastructure/_.js";
import {
  ElementaPreview,
  RenderableContent,
  RenderingContext,
} from "../../../../../_.js";
import { attachRenderableContent } from "./renderable_content/_.js";
import { attachRenderingContext } from "./rendering_context.js";

export function attachElementaViewerComponentState(
  preview: y.Map<any>,
  project: Project
): preview is y.Map<any> & ElementaPreview {
  assert(attachReactiveMap<ElementaPreviewData>(preview));
  assert(setReactiveMapGetters(preview, ["corners"]));
  assert(setObjectProperty(preview, "project", project));

  const renderingContext = getOrCreateYMap(preview, "renderingContext");
  assert(attachRenderingContext(renderingContext, project));
  assert(
    setObjectProperty(preview, "context", renderingContext as RenderingContext)
  );

  const renderableContent = getOrCreateYMap(preview, "renderableContent");
  assert(attachRenderableContent(renderableContent, project));
  assert(
    setObjectProperty(
      preview,
      "content",
      renderableContent as RenderableContent
    )
  );

  // corners$
  assert(
    setObjectProperty(
      preview,
      "corners$",
      preview.items$.pipe(
        map((v) => v.corners),
        distinctUntilChanged()
      )
    )
  );

  // corner(name)
  assert(
    setObjectGetter(preview, "corner", () => (name: CornerName) => {
      const corners = preview.corners;
      switch (name) {
        case "top-left":
          return corners?.topLeft;
        case "top-right":
          return corners?.topRight;
        case "bottom-left":
          return corners?.bottomLeft;
        case "bottom-right":
          return corners?.bottomRight;
      }
    })
  );

  // corner$(name)
  assert(
    setObjectProperty(
      preview,
      "corner$",
      (name: CornerName): Observable<number | undefined> =>
        preview.corners$.pipe(
          map((corners) => {
            switch (name) {
              case "top-left":
                return corners?.topLeft;
              case "top-right":
                return corners?.topRight;
              case "bottom-left":
                return corners?.bottomLeft;
              case "bottom-right":
                return corners?.bottomRight;
            }
          })
        )
    )
  );

  const baseDispose = (preview as any).dispose?.bind(preview);
  (preview as any).dispose = () => {
    baseDispose?.();
  };

  return setEnhancer<ElementaPreview>(
    preview,
    attachElementaViewerComponentState
  );
}
