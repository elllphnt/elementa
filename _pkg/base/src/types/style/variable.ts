import { StyleDataType } from "../_.js";
import { ElllSelectorData } from "./modifier.js";

export type StyleVariableData = {
  name?: string;
  values?: Record<string, any>;
};

export type StyleVariableSetData = {
  id: string;
  name: string;
  datatype?: StyleDataType;
  modes?: ElllSelectorData[];
  variables: StyleVariableData[];
};
