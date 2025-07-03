import { Lifecycle } from "@elllphnt/elementa-kernel";
import { BehaviorSubject } from "rxjs";
import type { Tool } from "~/tools/tools/tool.js";
import { tools } from "~/tools/tools/tools.js";

const toolMap = {
  [tools.Select.name]: tools.Select,
  [tools.Frame.name]: tools.Frame,
  // [tools.Container.name]: tools.Container,
  // [tools.ContainerFilled.name]: tools.ContainerFilled,
  // [tools.Slot.name]: tools.Slot,
  // [tools.Text.name]: tools.Text,
  // [tools.Vector.name]: tools.Vector,
  // [tools.Media.name]: tools.Media,
};

export class ToolManager extends Lifecycle implements ToolManager {
  private _tool$ = new BehaviorSubject<Tool>(tools.Select);

  get tool() {
    return this._tool$.value;
  }
  get tool$() {
    return this._tool$.asObservable();
  }

  setTool(tool: Tool | string) {
    let _tool: Tool;
    if (typeof tool === "string") {
      _tool = toolMap[tool as keyof typeof toolMap] || tools.Select;
    } else {
      _tool = tool;
    }
    this._tool$.next(_tool);
  }

  constructor() {
    super();

    this.addDisposer(() => {
      this._tool$.complete();
    });
  }
}
