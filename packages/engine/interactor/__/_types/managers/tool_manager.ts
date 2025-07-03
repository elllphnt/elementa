import { Lifecycle } from "@elllphnt/elementa-utils";
import { Observable } from "rxjs";
import { Tool } from "~/primitives/tool";

export interface IToolManager extends Lifecycle {
  get tool(): Tool;
  get tool$(): Observable<Tool>;

  setTool(tool: Tool | string): void;
}
