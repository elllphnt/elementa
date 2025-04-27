import {
  CornerData,
  CornerName,
  ElementaFrameData,
} from "@elllphnt/elementa-base";
import { distinctUntilChanged, map, of, switchMap } from "rxjs";
import * as y from "yjs";
import { IdentifiableModel } from "../../identifiable";
import { RenderingContext } from "../elementa/rendering_context";
import { ElementaEditorComponentState } from "./state";

export class ElementaFrame extends IdentifiableModel<ElementaFrameData> {
  readonly componentState: ElementaEditorComponentState;
  readonly renderingContext: RenderingContext;

  get name() {
    return this.state.name;
  }
  get name$() {
    return this.state$.pipe(
      map((state) => state.name),
      distinctUntilChanged()
    );
  }

  get fragmentId() {
    return this.state.fragmentId;
  }
  get fragmentId$() {
    return this.state$.pipe(
      map((state) => state.fragmentId),
      distinctUntilChanged()
    );
  }

  get fragment() {
    return this.fragmentId
      ? this.componentState.component.fragment(this.fragmentId)
      : this.componentState.component.template;
  }
  get fragment$() {
    return this.fragmentId$.pipe(
      switchMap((fragmentId) => {
        return fragmentId
          ? this.componentState.component.fragment$(fragmentId)
          : of(this.componentState.component.template);
      })
    );
  }

  get x() {
    return this.state.x;
  }
  get x$() {
    return this.state$.pipe(
      map((state) => state.x),
      distinctUntilChanged()
    );
  }

  get y() {
    return this.state.y;
  }
  get y$() {
    return this.state$.pipe(
      map((state) => state.y),
      distinctUntilChanged()
    );
  }

  get height() {
    return this.state.height;
  }
  get height$() {
    return this.state$.pipe(
      map((state) => state.height),
      distinctUntilChanged()
    );
  }
  get width() {
    return this.state.width;
  }
  get width$() {
    return this.state$.pipe(
      map((state) => state.width),
      distinctUntilChanged()
    );
  }

  get corners() {
    return this.state.corners;
  }
  get corners$() {
    return this.state$.pipe(
      map((state) => state.corners),
      distinctUntilChanged()
    );
  }

  corner<C extends CornerName>(name: C) {
    switch (name) {
      case "top-left":
        return this.corners?.topLeft;
      case "top-right":
        return this.corners?.topRight;
      case "bottom-left":
        return this.corners?.bottomLeft;
      case "bottom-right":
        return this.corners?.bottomRight;
    }
  }
  corner$<C extends CornerName>(name: C) {
    return this.corners$.pipe(
      map((corner) => {
        switch (name) {
          case "top-left":
            return corner?.topLeft;
          case "top-right":
            return corner?.topRight;
          case "bottom-left":
            return corner?.bottomLeft;
          case "bottom-right":
            return corner?.bottomRight;
        }
      })
    );
  }

  constructor(ymap: y.Map<any>, componentState: ElementaEditorComponentState) {
    super(ymap);

    this.componentState = componentState;
    this.renderingContext = new RenderingContext(
      this.ymap,
      componentState.component
    );

    this.addDisposer(() => {
      this.renderingContext.dispose();
    });
  }

  cloneIds(clone: y.Map<any>): void {
    this.cloneOwnId(clone);
  }

  setName(name: string | undefined) {
    this.patch({
      name: name,
    });
  }

  setFragmentId(fragmentId: string | undefined) {
    this.patch({
      fragmentId: fragmentId,
    });
  }

  setX(x: number | undefined) {
    this.patch({
      x: x !== undefined ? Math.round(x) : undefined,
    });
  }
  setY(y: number | undefined) {
    this.patch({
      y: y !== undefined ? Math.round(y) : undefined,
    });
  }
  setHeight(height: number | undefined) {
    this.patch({
      height: height !== undefined ? Math.round(height) : undefined,
    });
  }
  setWidth(width: number | undefined) {
    this.patch({
      width: width !== undefined ? Math.round(width) : undefined,
    });
  }

  setCorner(name: CornerName, value: number | undefined) {
    const newCorner = {
      ...this.corners,
    };

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

    this.patch({
      corners: newCorner,
    });
  }
  setCorners(corners: CornerData<number> | undefined) {
    this.patch({
      corners: corners,
    });
  }

  remove() {
    this.componentState.frames.remove(this);
  }
}
