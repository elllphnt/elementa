import { IFileDrive } from "@repo/backend";
import { Project } from "@repo/elementa-models";
import { IElll } from "~/src/types/elll";
import { IElllStyleManager } from "./style_manager/_types";

export interface IElllElementaProject extends Project {
  elll: IElll;
  drive: IFileDrive;
  styleManager: IElllStyleManager;
}
