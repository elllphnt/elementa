import { PointData } from "@elllphnt/elementa-utils";
import { Handle } from "../_types/handles/handle.js";
import { ElementaInteractor } from "../_types/interactor.js";

export type PointerEvent = {
  interactor: ElementaInteractor;
  target: Handle;
  position: PointData;
  keys: {
    shift: boolean;
    ctrl: boolean;
    alt: boolean;
  };
};

export class Tool {
  readonly name: string;

  constructor(options: { name: string }) {
    this.name = options.name;
  }

  down(event: PointerEvent): boolean | void {
    return false;
  }
  tap(event: PointerEvent): boolean | void {
    return false;
  }
}
