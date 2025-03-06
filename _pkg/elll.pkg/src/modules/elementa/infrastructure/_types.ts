import { Infrastructure } from "@repo/elementa-models";
import { IElll } from "~/src/types/elll";

export interface IElllElementaInfrastructure extends Infrastructure {
  elll: IElll;
}
