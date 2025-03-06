import { PointData } from "@repo/utils";
import { ElementaInteractor } from "../elementa_interactor";
import { Handle } from "../handles/handle";
import { Tool } from "../primitives/tool";

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
