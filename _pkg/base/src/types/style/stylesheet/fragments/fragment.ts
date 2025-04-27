import { AnimationData } from "./animation.js";
import { BackgroundLayerData } from "./background_layer.js";
import { FilterData } from "./filter.js";

export enum StyleFragmentType {
  Animation = "animation",
  BackgroundLayer = "backgroundLayer",
  Filter = "filter",
}

export type StyleFragmentDataTypeMap = {
  [StyleFragmentType.Animation]: AnimationData;
  [StyleFragmentType.BackgroundLayer]: BackgroundLayerData;
  [StyleFragmentType.Filter]: FilterData;
};

export type StyleFragmentData<T extends StyleFragmentType = StyleFragmentType> =
  {
    id: string;
    type: string;
    data: StyleFragmentDataTypeMap[T];
  };
