import {
  CornerData,
  CornerName,
  ElementaViewerComponentStateData,
} from "@elllphnt/elementa-base";
import { MapCRDTModel } from "@elllphnt/elementa-utils";
import { distinctUntilChanged, map } from "rxjs";
import * as y from "yjs";
import { Component } from "../../component";
import { RenderingContext } from "../elementa/rendering_context";

export class ElementaViewerComponentState extends MapCRDTModel<ElementaViewerComponentStateData> {
  readonly renderingContext: RenderingContext;

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

  constructor(ymap: y.Map<any>, component: Component) {
    super(ymap);

    this.renderingContext = new RenderingContext(this.ymap, component);

    this.addDisposer(() => {
      this.renderingContext.dispose();
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
}
