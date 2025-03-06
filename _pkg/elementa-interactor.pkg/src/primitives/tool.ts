import { PointData } from "@repo/utils";
import { IHandle } from "../_types/handles/handle";
import { IElementaInteractor } from "../_types/interactor";

export type PointerEvent = {
  interactor: IElementaInteractor;
  target: IHandle;
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
