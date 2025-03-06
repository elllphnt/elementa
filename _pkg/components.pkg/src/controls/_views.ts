import _ from "lodash";
import { View } from "../view/_types";
import { colorControlViews } from "./datatypes/color/_views";
import { expressionControlViews } from "./datatypes/expression/_views";

export const baseControlViews = {
  ..._.mapKeys(expressionControlViews, (v, k) => `expression.${k}`),
  ..._.mapKeys(colorControlViews, (v, k) => `color.${k}`),
} satisfies Record<string, View>;
