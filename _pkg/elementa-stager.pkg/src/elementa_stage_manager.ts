import { Elementa, ModuleManager } from "@repo/elementa";
import { DomStyleSheetManager } from "@repo/elementa-renderer/dist/style/dom/manager";
import { ElementaStager } from "./elementa_stager";
import { css, Theme } from "./stylesheet";

export class ElementaStageManager {
  readonly root: HTMLElement;
  readonly moduleManager: ModuleManager;
  readonly stylesheetManager: DomStyleSheetManager;
  readonly theme: Theme;

  counter = 0;
  stages = new Map<
    number,
    {
      instance: ElementaStager;
      root: HTMLElement;
    }
  >();
  activeStageKey: number | undefined;

  constructor({
    root,
    moduleManager,
    stylesheetManager,
    theme,
  }: {
    root: HTMLElement;
    moduleManager: ModuleManager;
    stylesheetManager: DomStyleSheetManager;
    theme: Theme;
  }) {
    this.root = root;
    this.moduleManager = moduleManager;
    this.stylesheetManager = stylesheetManager;
    this.theme = theme;
    this.setupStylesheet(document);
  }

  setupStylesheet(document: Document) {
    const stylesheetId = "elementa-stylesheet";
    const existing = document.head.querySelector(`style#${stylesheetId}`);
    if (existing) return;

    const stylesheet = document.createElement("style");
    stylesheet.id = stylesheetId;
    stylesheet.innerHTML = css(this.theme);
    document.head.appendChild(stylesheet);
  }
  createStage() {
    const elementa = new Elementa({
      moduleManager: this.moduleManager,
    });
    const stage = new ElementaStager({
      elementa,
      stylesheetManager: this.stylesheetManager,
    });

    const stageRoot = document.createElement("div");
    stageRoot.classList.add("elementa-stage");
    this.root.appendChild(stageRoot);

    const key = this.counter++;
    stageRoot.id = "elementa-stage-" + key;
    this.stages.set(key, { instance: stage, root: stageRoot });
    stage.mount(stageRoot);

    return [stage, key] as const;
  }
  getStage(key: number) {
    return this.stages.get(key)?.instance;
  }
  disposeStage(key: number) {
    const stage = this.stages.get(key);
    if (stage) {
      stage.instance.dispose();
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
        stage.instance.setVisible(true);
        stage.root.style.display = "";
      } else {
        stage.root.style.display = "none";
        stage.instance.setVisible(false);
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
      stage.instance.setVisible(false);
    }
  }
}
