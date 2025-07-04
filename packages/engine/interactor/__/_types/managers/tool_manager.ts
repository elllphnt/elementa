import type { Lifecycle } from "@elllphnt/elementa-utils";
import type { Observable } from "rxjs";
import type { Tool } from "~/primitives/tool";

export interface IToolManager extends Lifecycle {
  get tool(): Tool;
  get tool$(): Observable<Tool>;

  setTool(tool: Tool | string): void;
}
