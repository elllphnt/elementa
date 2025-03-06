import _ from "lodash";
import { fillControlViews } from "./properties/fill/_views/_";
import { framePresetControlViews } from "./properties/frame_preset/_views/_";

export const controlViews = {
  ..._.mapKeys(fillControlViews, (__, key) => `fill${_.capitalize(key)}`),
  ..._.mapKeys(
    framePresetControlViews,
    (__, key) => `framePreset${_.capitalize(key)}`,
  ),
};
