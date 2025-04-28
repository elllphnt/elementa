import {
  CornerData,
  CornerName,
  ElementaFrameData,
} from "@elllphnt/elementa-base";
import { Extendable } from "@elllphnt/elementa-utils";
import { distinctUntilChanged, map, Observable, of, switchMap } from "rxjs";
import * as y from "yjs";
import { withIdentifiableModelBehavior } from "../../identifiable";
import {
  RenderingContextModel,
  withRenderingContextBehavior,
} from "../elementa/rendering_context";
import { ElementaEditorComponentStateModel } from "./state";

export type ElementaFrameModel = ReturnType<
  typeof withIdentifiableModelBehavior<ElementaFrameData>
> & {
  componentState: ElementaEditorComponentStateModel;
  renderingContext: RenderingContextModel;

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

  setName(name: string | undefined): void;
  setFragmentId(fragmentId: string | undefined): void;
  setX(x: number | undefined): void;
  setY(y: number | undefined): void;
  setHeight(height: number | undefined): void;
  setWidth(width: number | undefined): void;
  setCorner(name: CornerName, value: number | undefined): void;
  setCorners(corners: CornerData<number> | undefined): void;
  remove(): void;
  cloneIds(clone: y.Map<any>): void;
};

/**
 * Attach ElementaFrame behavior to a y.Map
 */
export function withElementaFrameBehavior(
  ymap: y.Map<any>,
  componentState: ElementaEditorComponentStateModel
): ElementaFrameModel {
  const frame = withIdentifiableModelBehavior<ElementaFrameData>(
    ymap as Extendable<y.Map<any>>
  ) as Extendable<ElementaFrameModel>;

  frame.componentState = componentState;
  frame.renderingContext = withRenderingContextBehavior(
    ymap,
    componentState.component
  );

  // Name
  Object.defineProperty(frame, "name", {
    get() {
      return frame.value.name;
    },
    set(value) {
      frame.set("name", value);
    },
  });
  frame.name$ = frame.observable$.pipe(
    map((value) => value.name),
    distinctUntilChanged()
  );

  // Fragment ID
  Object.defineProperty(frame, "fragmentId", {
    get() {
      return frame.value.fragmentId;
    },
    set(value) {
      frame.set("fragmentId", value);
    },
  });
  frame.fragmentId$ = frame.observable$.pipe(
    map((value) => value.fragmentId),
    distinctUntilChanged()
  );

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

  // Position & Size
  const fields = ["x", "y", "height", "width", "corners"] as const;

  for (const field of fields) {
    Object.defineProperty(frame, field, {
      get() {
        return frame.value[field];
      },
      set(value) {
        frame.set(field, value);
      },
    });

    (frame as any)[`${field}$`] = frame.observable$.pipe(
      map((value) => value[field]),
      distinctUntilChanged()
    );
  }

  // Methods
  frame.setName = (name: string | undefined) => {
    frame.set("name", name);
  };

  frame.setFragmentId = (fragmentId: string | undefined) => {
    frame.set("fragmentId", fragmentId);
  };

  frame.setX = (x: number | undefined) => {
    frame.set("x", x !== undefined ? Math.round(x) : undefined);
  };

  frame.setY = (y: number | undefined) => {
    frame.set("y", y !== undefined ? Math.round(y) : undefined);
  };

  frame.setHeight = (height: number | undefined) => {
    frame.set("height", height !== undefined ? Math.round(height) : undefined);
  };

  frame.setWidth = (width: number | undefined) => {
    frame.set("width", width !== undefined ? Math.round(width) : undefined);
  };

  frame.setCorner = (name: CornerName, value: number | undefined) => {
    const newCorners = { ...(frame.corners ?? {}) };
    switch (name) {
      case "top-left":
        newCorners.topLeft = value;
        break;
      case "top-right":
        newCorners.topRight = value;
        break;
      case "bottom-left":
        newCorners.bottomLeft = value;
        break;
      case "bottom-right":
        newCorners.bottomRight = value;
        break;
    }
    frame.set("corners", newCorners);
  };

  frame.setCorners = (corners: CornerData<number> | undefined) => {
    frame.set("corners", corners);
  };

  frame.cloneIds = (clone: y.Map<any>) => {
    frame.cloneOwnId(clone);
  };

  frame.remove = () => {
    frame.componentState.frames.remove(frame);
  };

  return frame as ElementaFrameModel;
}

/**
 * Create a new local ElementaFrame model
 */
export function createElementaFrameModel(
  componentState: ElementaEditorComponentStateModel
): ElementaFrameModel {
  const ymap = new y.Map<any>();
  return withElementaFrameBehavior(ymap, componentState);
}
