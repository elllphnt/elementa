import _ from "lodash";
import { propControlViews } from "./assets/prop/_views";
import { animationControlViews } from "./datatypes/animation/_view";
import { borderControlViews } from "./datatypes/border/_views";
import { cornerControlViews } from "./datatypes/corner/_";
import { effectControlViews } from "./datatypes/effect/_view";
import { paddingControlViews } from "./datatypes/padding/_views";
import { transitionControlViews } from "./datatypes/transition/_view";
import { typefaceControlViews } from "./datatypes/typeface/_views";
import { variableControlViews } from "./datatypes/variable/_views";
import { styleControlViews } from "./infrastructure/style/_views/_";
import { fillControlViews } from "./properties/fill/_views/_";
import { framePresetControlViews } from "./properties/frame_preset/_views/_";

export const controlViews = {
  ..._.mapKeys(fillControlViews, (__, key) => `fill${_.capitalize(key)}`),
  ..._.mapKeys(
    framePresetControlViews,
    (__, key) => `framePreset${_.capitalize(key)}`,
  ),
  ..._.mapKeys(styleControlViews, (__, key) => `style${_.capitalize(key)}`),
  ..._.mapKeys(
    variableControlViews,
    (__, key) => `variable${_.capitalize(key)}`,
  ),
  ..._.mapKeys(borderControlViews, (__, key) => `border${_.capitalize(key)}`),
  ..._.mapKeys(effectControlViews, (__, key) => `effect${_.capitalize(key)}`),
  ..._.mapKeys(cornerControlViews, (__, key) => `corner${_.capitalize(key)}`),
  ..._.mapKeys(paddingControlViews, (__, key) => `padding${_.capitalize(key)}`),
  ..._.mapKeys(
    transitionControlViews,
    (__, key) => `transition${_.capitalize(key)}`,
  ),
  ..._.mapKeys(
    typefaceControlViews,
    (__, key) => `typeface${_.capitalize(key)}`,
  ),
  ..._.mapKeys(propControlViews, (__, key) => `prop${_.capitalize(key)}`),
  ..._.mapKeys(
    animationControlViews,
    (__, key) => `animation${_.capitalize(key)}`,
  ),
};
