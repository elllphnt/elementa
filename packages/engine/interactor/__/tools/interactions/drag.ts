import { combineLatestOrEmpty } from "@elllphnt/elementa-lang-utils";
import type { PointData } from "@elllphnt/elementa-math-utils";
import _ from "lodash";
import type { ElementaInteractor } from "~/_types/interactor.js";
import type { ElementHandle } from "~/handles/renderables/elements/element.js";
import { MouseInteraction } from "./mouse.js";
import { createDragImages } from "./utils.js";

export type RectDrawInteraction = {
  run(window: Window, start: PointData): void;
};

let _key = 0;

export function createDragInteraction({
  interactor,
  draggables,
  onStart,
  onUpdate,
  onDrop,
}: {
  interactor: ElementaInteractor;
  draggables: ElementHandle[];
  onStart?: () => void;
  onUpdate?: (
    position: PointData,
    keys: { shift: boolean; ctrl: boolean; alt: boolean }
  ) => void;
  onDrop?: (position: PointData) => void | boolean;
}) {
  const key = _key++;
  const mouseInteraction = new MouseInteraction();

  const currentDraggables = [...draggables];

  mouseInteraction.on("start", () => {
    interactor.setFlag("dragging", true);
    interactor.setFlag("dropping", true);
    // create drag images and set instance as placeholders
    const images: HTMLElement[] = [];

    currentDraggables.forEach((handle) => {
      const elements = handle.renderable.htmlElements;
      if (_.isEmpty(elements)) return;

      images.push(...createDragImages(handle));
      handle.instance.setFlag("placeholder", true);
    });

    // update images on mouse position update
    const deltaSubscription = combineLatestOrEmpty([
      mouseInteraction.deltaPosition$,
      mouseInteraction.shiftKey$,
      mouseInteraction.ctrlKey$,
      mouseInteraction.altKey$,
    ]).subscribe(([delta, shiftKey, ctrlKey, altKey]) => {
      const interfaceDelta =
        interactor.interface.vectorWindowToInterface(delta);
      const stagerDelta =
        interactor.interface.vectorInteractorToStager(interfaceDelta);
      const contentDelta =
        interactor.stager.viewport.vectorWindowToContent(stagerDelta);
      images.forEach((image) => {
        image.style.transform = `translate(${contentDelta.x}px, ${contentDelta.y}px)`;
      });

      const interfacePosition = interactor.interface.windowToInterface(
        mouseInteraction.endPosition
      );

      onUpdate?.(interfacePosition, {
        shift: shiftKey,
        ctrl: ctrlKey,
        alt: altKey,
      });
    });

    // remove images, clear placeholders
    mouseInteraction?.on("stop", () => {
      deltaSubscription?.unsubscribe();
      mouseInteraction?.dispose();

      const interfacePosition = interactor.interface.windowToInterface(
        mouseInteraction.endPosition
      );
      onDrop?.(interfacePosition);

      // remove images
      images.forEach((image) => {
        image.remove();
      });

      // clear placeholders
      currentDraggables.forEach((handle) => {
        handle.instance.setFlag("placeholder", false);
      });

      // clear dragging flag
      setTimeout(() => {
        interactor.setFlag("dragging", false);
        interactor.setFlag("dropping", false);
      });
    });

    onStart?.();
  });

  function run(window: Window, start: PointData) {
    mouseInteraction.run(window, start);
  }

  return {
    run,
  };
}
