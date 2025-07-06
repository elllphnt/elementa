import { resetCss } from "@elllphnt/elementa-css";
import type { ElementaPreview, ElementaStage } from "@elllphnt/elementa-models";
import type { Runtime } from "@elllphnt/elementa-runtime";
import {
  ElementaPreviewInstance,
  ElementaStageInstance,
} from "@elllphnt/elementa-runtime";
import type React from "react";
import { createElement } from "react";
import { createRoot } from "react-dom/client";
import ElementaPreviewComponent from "../components/elementa/preview.js";
import { ElementaStageComponent } from "../components/elementa/stage.js";
import { ElementaPreviewRenderable } from "../renderables/elementa/preview/preview.js";
import { ElementaStageRenderable } from "../renderables/elementa/stage/stage.js";
import type { Renderable } from "../renderables/renderable.js";
import type { Scene } from "../scene/scene.js";

export class ElementaRenderableManager {
  readonly root: HTMLElement;
  readonly runtime: Runtime;
  readonly scene: Scene;

  private _mounted = false;

  counter = 0;
  renderables = new Map<
    number,
    {
      renderable: Renderable;
      root: HTMLElement;
    }
  >();
  activeStageKey: number | undefined;

  constructor({
    root,
    runtime,
    scene,
  }: {
    root: HTMLElement;
    runtime: Runtime;
    scene: Scene;
  }) {
    this.root = root;
    this.runtime = runtime;
    this.scene = scene;
  }

  mount() {
    const head = this.root.ownerDocument.head;
    const style = document.createElement("style");
    style.textContent = resetCss();
    style.id = "elementa-reset-css";
    head.appendChild(style);
    this._mounted = true;
  }

  addRenderable<R extends Renderable>({
    renderable,
    render,
    type,
  }: {
    renderable: R;
    render: (renderable: R) => React.ReactNode;
    type: string;
  }) {
    if (!this._mounted) {
      this.mount();
    }
    // create root element
    const rootElement = document.createElement("div");
    rootElement.style.display = "none";
    this.root.appendChild(rootElement);

    // register root element
    const key = this.counter++;
    rootElement.id = "elementa-stage-" + key;
    rootElement.classList.add(`elementa-root-${type}`);
    this.renderables.set(key, { renderable, root: rootElement });

    // mount
    const reactRoot = createRoot(rootElement);
    reactRoot.render(render(renderable));

    return [renderable, key] as const;
  }

  addStage(stage: ElementaStage) {
    // create renderable
    const renderable = new ElementaStageRenderable({
      scene: this.scene,
      instance: new ElementaStageInstance({
        runtime: this.runtime,
        model: stage,
      }),
    });

    return this.addRenderable({
      type: "stage",
      renderable,
      render: (renderable) =>
        createElement(ElementaStageComponent, { stage: renderable }),
    });
  }
  addPreview(preview: ElementaPreview) {
    // create renderable
    const renderable = new ElementaPreviewRenderable({
      scene: this.scene,
      instance: new ElementaPreviewInstance({
        runtime: this.runtime,
        model: preview,
      }),
    });

    return this.addRenderable({
      type: "preview",
      renderable,
      render: (renderable) =>
        createElement(ElementaPreviewComponent, { preview: renderable }),
    });
  }

  getStage(key: number) {
    return this.renderables.get(key)?.renderable;
  }
  disposeStage(key: number) {
    const stage = this.renderables.get(key);
    if (stage) {
      stage.renderable.dispose();
      stage.root.remove();
      this.renderables.delete(key);
    }
  }

  getActiveRenderable() {
    return this.activeStageKey !== undefined
      ? this.getStage(this.activeStageKey)
      : undefined;
  }
  activateRenderable(key: number) {
    this.activeStageKey = key;
    this.renderables.forEach((stage, k) => {
      if (k === key) {
        stage.root.style.display = "";
      } else {
        stage.root.style.display = "none";
      }
    });
  }
  deactivateRenderable(key: number) {
    if (this.activeStageKey === key) {
      this.activeStageKey = undefined;
    }
    const stage = this.renderables.get(key);
    if (stage) {
      stage.root.style.display = "none";
    }
  }
}
