import { Disposable } from "@repo/utils";
import { Observable } from "rxjs";
import { Tool } from "~/src/primitives/tool";

export interface IToolManager extends Disposable {
  get tool(): Tool;
  get tool$(): Observable<Tool>;

  setTool(tool: Tool | string): void;
}
