import { Component, Element } from "@elllphnt/elementa-models";
import { PointData, Rect, RectData } from "@elllphnt/elementa-utils";
import { Handle } from "../_types/_.js";
import { ElementHandle } from "../handles/_.js";
import { ElementaInteractor, tools } from "../index.js";
import { PointerEvent } from "../primitives/tool.js";
import { EntityTool } from "./entity.js";
import { createRectDrawInteraction } from "./interactions/rect_draw.js";

export abstract class ElementTool extends EntityTool {
  constructor({ name, entityType }: { name: string; entityType: string }) {
    super({
      name,
      entityType,
    });
  }

  abstract createElement({
    component,
    punctual,
  }: {
    component: Component;
    punctual?: boolean;
  }): Element;

  onCreated(element: ElementHandle): void {}

  down(event: PointerEvent) {
    const { interactor, position } = event;
    const component = interactor.stager.elementa.component;
    if (!component) return;
    const positionStrategy = event.keys.ctrl ? "absolute" : "static";

    const interaction = createRectDrawInteraction({
      interactor: interactor as ElementaInteractor,
      onEnd: (viewportRect: RectData) => {
        const stagerRect =
          interactor.interface.rectInteractorToStager(viewportRect);
        const rect = interactor.stager.viewport.rectWindowToContent(stagerRect);
        const element = this.createElement({
          component,
        });

        const style = element.stylesheet.baseStyle(true);

        style.setProperty("height", {
          value: rect.height,
          unit: "px",
        });
        style.setProperty("width", {
          value: rect.width,
          unit: "px",
        });

        this.insertElement({
          interactor: interactor as ElementaInteractor,
          element,
          target: event.target,
          position: rect.topLeft,
          positionStrategy,
        });
      },
      proportionalOnShift: true,
    });

    interaction.run(window, position);

    return true;
  }

  tap(event: PointerEvent) {
    const { interactor, position } = event;
    const component = interactor.stager.elementa.component;
    if (!component) return;
    const positionStrategy = event.keys.ctrl ? "absolute" : "static";

    const stagerPosition = interactor.interface.interactorToStager(position);
    const contentPosition =
      interactor.stager.viewport.windowToContent(stagerPosition);

    const element = this.createElement({
      component,
      punctual: true,
    });

    this.insertElement({
      interactor: interactor as ElementaInteractor,
      element,
      target: event.target,
      position: contentPosition,
      positionStrategy,
    });

    return true;
  }

  insertElement({
    interactor,
    element,
    positionStrategy,
    target,
    position,
  }: {
    interactor: ElementaInteractor;
    element: Element;
    target: Handle;
    position: PointData;
    positionStrategy: string;
  }) {
    const style = element.stylesheet.baseStyle(true);
    if (positionStrategy === "absolute") {
      const containerRect = target.contentRect ?? new Rect();
      style.setProperty("position", "absolute");
      const top = position.y - containerRect.y;
      const left = position.x - containerRect.x;
      style.setProperty("top", {
        value: top,
        unit: "px",
      });
      style.setProperty("left", {
        value: left,
        unit: "px",
      });

      // ensure the parent is positioned
      if (target instanceof ElementHandle) {
        const position = target.style.resolvedPropertyValue("position");
        if (!position || position === "static") {
          target.style.setProperty("position", "relative");
        }
      }
    }

    target.handleEntityDrop([element], {
      position,
    });

    interactor.toolManager.setTool(tools.Select);
    const newElementInstance = target.entityHandle(element) as ElementHandle;
    if (newElementInstance) {
      newElementInstance.select();
      this.onCreated(newElementInstance);
    }
  }
}
