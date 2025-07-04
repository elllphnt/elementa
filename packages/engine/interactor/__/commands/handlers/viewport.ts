import { Rect } from "@elllphnt/elementa-math-utils";
import type { CommandHandler } from "~/_types/managers/command";

export const fitIntoViewport: CommandHandler = (interactor) => {
  const contentRect = Rect.union(
    interactor.frames.map((widget) => widget.contentRect)
  );
  const vRect = interactor.stager.viewport.rect;
  const viewportRect = vRect.inset(Math.min(vRect.width, vRect.height) / 10);
  interactor.stager.viewport.fitContentRect(contentRect, viewportRect);
};

export const zoomIn: CommandHandler = (interactor) => {
  interactor.stager.viewport.scaleTo(interactor.stager.viewport.scale * 1.05);
};

export const zoomOut: CommandHandler = (interactor) => {
  interactor.stager.viewport.scaleTo(interactor.stager.viewport.scale / 1.05);
};
