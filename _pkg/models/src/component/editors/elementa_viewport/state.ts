import {
  CornerData,
  CornerName,
  ElementaViewerComponentStateData,
} from "@elllphnt/elementa-base";
import { attachReactiveMap, Extendable } from "@elllphnt/elementa-utils";
import { distinctUntilChanged, map, Observable } from "rxjs";
import * as y from "yjs";
import { Component } from "../../component";
import {
  RenderingContextModel,
  withRenderingContextBehavior,
} from "../elementa/rendering_context";

export type ElementaViewerComponentStateModel = ReturnType<
  typeof attachReactiveMap<ElementaViewerComponentStateData>
> & {
  renderingContext: RenderingContextModel;

  corners: CornerData<number> | undefined;
  corners$: Observable<CornerData<number> | undefined>;

  corner(name: CornerName): number | undefined;
  corner$(name: CornerName): Observable<number | undefined>;

  setCorner(name: CornerName, value: number | undefined): void;
  setCorners(corners: CornerData<number> | undefined): void;
};

/**
 * Attach ElementaViewerComponentState behavior to a y.Map
 */
export function withElementaViewerComponentStateBehavior(
  ymap: y.Map<any>,
  component: Component
): ElementaViewerComponentStateModel {
  const state = attachReactiveMap<ElementaViewerComponentStateData>(
    ymap as Extendable<y.Map<any>>
  ) as Extendable<ElementaViewerComponentStateModel>;

  state.renderingContext = withRenderingContextBehavior(ymap, component);

  // Corners accessor
  Object.defineProperty(state, "corners", {
    get() {
      return state.value.corners;
    },
    set(value) {
      state.set("corners", value);
    },
  });

  state.corners$ = state.observable$.pipe(
    map((value) => value.corners),
    distinctUntilChanged()
  );

  state.corner = (name: CornerName) => {
    const corners = state.corners;
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
  };

  state.corner$ = (name: CornerName) => {
    return state.corners$.pipe(
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
    );
  };

  state.setCorner = (name: CornerName, value: number | undefined) => {
    const newCorner = { ...(state.corners ?? {}) };
    switch (name) {
      case "top-left":
        newCorner.topLeft = value;
        break;
      case "top-right":
        newCorner.topRight = value;
        break;
      case "bottom-left":
        newCorner.bottomLeft = value;
        break;
      case "bottom-right":
        newCorner.bottomRight = value;
        break;
    }
    state.set("corners", newCorner);
  };

  state.setCorners = (corners: CornerData<number> | undefined) => {
    state.set("corners", corners);
  };

  const baseDispose = (state as any).dispose?.bind(state);
  state.dispose = () => {
    state.renderingContext.dispose();
    if (baseDispose) baseDispose();
  };

  return state as ElementaViewerComponentStateModel;
}

/**
 * Create a new local ElementaViewerComponentState model
 */
export function createElementaViewerComponentStateModel(
  component: Component
): ElementaViewerComponentStateModel {
  const ymap = new y.Map<any>();
  return withElementaViewerComponentStateBehavior(ymap, component);
}
