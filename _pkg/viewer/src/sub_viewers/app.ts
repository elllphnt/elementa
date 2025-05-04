import { AppData } from "@elllphnt/elementa-base";
import { attachApp } from "@elllphnt/elementa-models";
import { AppComponent } from "@elllphnt/elementa-react";
import { AppRenderable } from "@elllphnt/elementa-scene";
import { updateYMap } from "@elllphnt/elementa-utils";
import { createElement } from "react";
import * as y from "yjs";
import { ViewerContext } from "../_context";
import { SubViewer } from "./sub_viewer";

export class AppViewer extends SubViewer {
  private renderable?: AppRenderable;

  constructor(
    readonly context: ViewerContext,
    { id }: { id: string } = { id: "app-viewer" }
  ) {
    super({ id });

    this.url$.subscribe((url) => {
      if (!url) return;
      const appId = url.replace(/^app:/, "").split("?")[0];
      this._loadApp(appId);
    });
  }

  private _loadApp(appId: string) {
    const data = this.context.infrastructure.get("app", appId) as AppData;
    if (!data) return;

    const ydoc = new y.Doc();
    const ymap = ydoc.getMap("app");
    updateYMap(ymap, data);

    const app = attachApp(ymap, this.context.infrastructure.project);
    if (!app) return;

    this.renderable?.dispose();
    this.renderable = new AppRenderable({
      scene: this.context.scene,
      instance: app,
    });

    this.context.scene.render(this.renderable);
  }

  render() {
    return this.renderable
      ? createElement(AppComponent, { app: this.renderable })
      : null;
  }

  override dispose(): void {
    super.dispose();
    this.renderable?.dispose();
  }
}
