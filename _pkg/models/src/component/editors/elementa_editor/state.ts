import { ElementaEditorComponentStateData } from "@elllphnt/elementa-base";
import { CRDTModelList, MapCRDTModel } from "@elllphnt/elementa-utils";
import * as y from "yjs";
import { Component } from "../../component";
import { ElementaFrame } from "./frame";

export class ElementaEditorComponentState extends MapCRDTModel<ElementaEditorComponentStateData> {
  readonly component: Component;
  readonly frames: CRDTModelList<ElementaFrame>;

  constructor(ymap: y.Map<any>, component: Component) {
    super(ymap);
    this.component = component;
    this.frames = new CRDTModelList<ElementaFrame>(
      this.getOrCreateArray("frames"),
      (map) => new ElementaFrame(map, this)
    );

    this.addDisposer(() => {
      this.frames.dispose();
    });
  }
}
