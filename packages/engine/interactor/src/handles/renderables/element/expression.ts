import type { ExpressionElementRenderable } from "@elllphnt/elementa-scene";
import type { Handle } from "~/handles/handle.js";
import type { ElementaInteractor } from "~/interactor.js";
import { BaseElementHandle } from "./_base.js";

export class ExpressionElementHandle extends BaseElementHandle<ExpressionElementRenderable> {
  constructor({
    renderable,
    interactor,
    parent,
  }: {
    renderable: ExpressionElementRenderable;
    interactor: ElementaInteractor;
    parent: Handle | null;
  }) {
    super({ renderable, interactor, parent });
  }
}
