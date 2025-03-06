import { View } from "~/src/view/_types";
import { InlineExpressionControl } from "./inline";

export const expressionControlViews = {
  menu: {
    id: "controls.datatypes.expression.menu",
    render: InlineExpressionControl,
  },
} satisfies Record<string, View>;
