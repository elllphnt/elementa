import { StyleData } from "./stylesheet/_.js";
import { StyleFragmentData } from "./stylesheet/fragments/fragment.js";

export type KeyFrameData = {
  key?: string;
  offset?: number;
  style?: StyleData;
};
export type KeyframeSetData = {
  id?: string;
  name?: string;
  keyframes?: KeyFrameData[];
  styleFragments?: StyleFragmentData[];
};
