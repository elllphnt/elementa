import type { PointData } from "@elllphnt/elementa-utils";
import type { Handle } from "../handles/handle.js";
import type { ElementaInteractor } from "../interactor.js";
import { Tool } from "../primitives/tool.js";

export type PointerEvent = {
  editor: ElementaInteractor;
  target: Handle;
  position: PointData;
  keys: {
    shift: boolean;
    ctrl: boolean;
    alt: boolean;
  };
};

export class EntityTool extends Tool {
  readonly entityType: string;

  constructor(options: { name: string; entityType: string }) {
    super({ name: options.name });
    this.entityType = options.entityType;
  }
}
