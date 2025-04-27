import { DataInputData } from "../_shared/data_input.js";
import { IdentifiableData } from "../_shared/identifiable.js";
import { ElementContainerData } from "./_.js";

export type FragmentData = IdentifiableData &
  ElementContainerData & {
    params?: DataInputData[];
  };
