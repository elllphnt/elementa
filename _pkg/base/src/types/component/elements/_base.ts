import { IdentifiableData } from "../../_shared/identifiable.js";
import {
  AccessibleData,
  ConditionalData,
  InteractiveData,
  LinkableData,
  RepeatableData,
  StylableData,
} from "./_common/_.js";

export type BaseElementData = IdentifiableData &
  StylableData &
  RepeatableData &
  ConditionalData &
  InteractiveData &
  LinkableData &
  AccessibleData & {
    type: string;
    name?: string;
    tag?: string;
  };
