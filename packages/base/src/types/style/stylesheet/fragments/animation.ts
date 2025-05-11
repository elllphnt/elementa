import { DurationData } from "../../../_primitives/style/datatypes.js";
import { Variable } from "../../../_primitives/style/variable.js";

export type AnimationData = {
  keyframe?: Variable<string>;
  duration?: Variable<DurationData>;
  timingFunction?: Variable<string>;
  delay?: Variable<DurationData>;
  iterations?: Variable<number>;
  direction?: Variable<string>;
  fillMode?: Variable<string>;
  playState?: Variable<string>;
};
