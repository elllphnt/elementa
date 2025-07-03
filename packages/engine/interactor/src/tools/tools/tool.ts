import type { PointData } from "@elllphnt/elementa-math-utils";
import type { Handle } from "~/handles/handle.js";
import type { ElementaInteractor } from "~/interactor.js";

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

  down(event: PointerEvent): boolean | void;
  down(): boolean | void {
    return false;
  }
  tap(event: PointerEvent): boolean | void;
  tap(): boolean | void {
    return false;
  }
}
