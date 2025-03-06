import { DropOptions, IHandle, IHost } from "@repo/elementa-interactor";
import { IElll } from "~/src/types/elll";
import { DragAndDropManager } from "./drag_and_drop_manager";

export class ElementaHost implements IHost {
  elll: IElll;

  dragAndDropManager: DragAndDropManager;

  constructor({ elll }: { elll: IElll }) {
    this.elll = elll;
    this.dragAndDropManager = new DragAndDropManager({
      elll,
    });
  }

  acceptDrop(
    handle: IHandle,
    {
      datatypes,
    }: {
      datatypes: string[];
    },
  ) {
    return this.dragAndDropManager.acceptDrop(handle, { datatypes });
  }
  handleDrop(
    handle: IHandle,
    data: Record<string, any>,
    options?: DropOptions,
  ) {
    return this.dragAndDropManager.handleDrop(handle, data, options);
  }
}
