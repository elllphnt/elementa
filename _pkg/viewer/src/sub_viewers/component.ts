import { ComponentData } from "@elllphnt/elementa-base";
import { attachComponent } from "@elllphnt/elementa-models";
import {
  ComponentInstance,
  StaticComponentPropResolver,
} from "@elllphnt/elementa-runtime";
import { updateYMap } from "@elllphnt/elementa-utils";
import { createElement } from "react";
import { ViewerContext } from "../_context";
import { createSubViewerController } from "./_controller";
import { SubViewer } from "./sub_viewer";

export class ComponentViewer extends SubViewer {
  private renderable?: ComponentRenderable;

  constructor(
    readonly context: ViewerContext,
    { id }: { id: string } = { id: "component-viewer" }
  ) {
    super({ id });

    this.url$.subscribe((url) => {
      if (!url) return;
      const componentId = url.replace(/^component:/, "");
      this._loadComponent(componentId);
    });
  }

  private _loadComponent(componentId: string) {
    const data = this.context.infrastructure.get(
      "component",
      componentId
    ) as ComponentData;
    if (!data) return;

    const ydoc = new y.Doc();
    const ymap = ydoc.getMap("component");
    updateYMap(ymap, data);

    const attached = attachComponent(ymap, this.context.infrastructure.project);
    if (!attached) return;

    const instance = new ComponentInstance({
      component: ymap,
      propResolver: new StaticComponentPropResolver({
        environment: this.context.environment,
      }),
    });

    this.renderable?.dispose();
    this.renderable = new ComponentRenderable({
      scene: this.context.scene,
      instance,
    });

    this.context.scene.render(this.renderable);
  }

  render() {
    return this.renderable
      ? createElement(ComponentComponent, { component: this.renderable })
      : null;
  }

  override dispose(): void {
    super.dispose();
    this.renderable?.dispose();
  }
}

export function createComponentSubViewer() {
  return createSubViewerController({
    pattern: /^component:/,
    create: (context) => new ComponentViewer(context),
  });
}
