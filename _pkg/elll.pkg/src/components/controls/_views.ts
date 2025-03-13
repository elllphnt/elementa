import _ from "lodash";
import { variableControlViews } from "./datatypes/variable/_views";
import { styleControlViews } from "./infrastructure/style/_views";
import { fillControlViews } from "./properties/fill/_views/_";
import { framePresetControlViews } from "./properties/frame_preset/_views/_";

export const controlViews = {
  ..._.mapKeys(fillControlViews, (__, key) => `fill${_.capitalize(key)}`),
  ..._.mapKeys(
    variableControlViews,
    (__, key) => `variable${_.capitalize(key)}`,
  ),
  ..._.mapKeys(styleControlViews, (__, key) => `style${_.capitalize(key)}`),
  ..._.mapKeys(
    framePresetControlViews,
    (__, key) => `framePreset${_.capitalize(key)}`,
  ),
};
