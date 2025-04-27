import { IdentifiableData } from "../../_shared/identifiable.js";

export type BaseStateData = IdentifiableData & {
  type: string;
  name?: string;
  varName?: string;
};
