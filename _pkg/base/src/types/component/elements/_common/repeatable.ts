import { Evaluable } from "../../../_.js";

export type RepeatMode = "fixed" | "dynamic";
export type ElementRepeatData = {
  mode?: RepeatMode;
  count?: Evaluable<number>;
  dataset?: Evaluable<any[]>;
};

export type RepeatableData = {
  repeat?: ElementRepeatData;
};
