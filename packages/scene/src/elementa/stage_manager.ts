import { ElementaStage } from "@elllphnt/elementa-models";
import { ElementaStageInstance, Runtime } from "@elllphnt/elementa-runtime";
import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { ElementaStageComponent } from "../components/_.js";
import { ElementaStageRenderable } from "../renderables/elementa/editor_state.js";
import { Scene } from "../scene/scene.js";

export class ElementaStageManager {
  readonly root: HTMLElement;
  readonly runtime: Runtime;
  readonly scene: Scene;

  counter = 0;
  stages = new Map<
    number,
    {
      renderable: ElementaStageRenderable;
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

  addStage(stage: ElementaStage) {
    // create renderable
    const renderable = new ElementaStageRenderable({
      scene: this.scene,
      instance: new ElementaStageInstance({
        runtime: this.runtime,
        model: stage,
      }),
    });

    // create root element
    const rootElement = document.createElement("div");
    rootElement.style.display = "none";
    this.root.appendChild(rootElement);

    // register root element
    const key = this.counter++;
    rootElement.id = "elementa-stage-" + key;
    this.stages.set(key, { renderable: renderable, root: rootElement });

    // mount
    const reactRoot = createRoot(rootElement);
    reactRoot.render(createElement(ElementaStageComponent, { renderable }));

    return [renderable, key] as const;
  }
  getStage(key: number) {
    return this.stages.get(key)?.renderable;
  }
  disposeStage(key: number) {
    const stage = this.stages.get(key);
    if (stage) {
      stage.renderable.dispose();
      stage.root.remove();
      this.stages.delete(key);
    }
  }

  getActiveStage() {
    return this.activeStageKey !== undefined
      ? this.getStage(this.activeStageKey)
      : undefined;
  }
  activateStage(key: number) {
    this.activeStageKey = key;
    this.stages.forEach((stage, k) => {
      if (k === key) {
        stage.root.style.display = "";
      } else {
        stage.root.style.display = "none";
      }
    });
  }
  deactivateStage(key: number) {
    if (this.activeStageKey === key) {
      this.activeStageKey = undefined;
    }
    const stage = this.stages.get(key);
    if (stage) {
      stage.root.style.display = "none";
    }
  }
}
