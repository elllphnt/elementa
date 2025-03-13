import { View } from "@repo/components";
import { InlineExpressionControl } from "./menu/expression";
import { StylePropertyInfo } from "./menu/info";
import { StylePropertyMenuView } from "./menu/style_property_menu";
import { VariableMenu } from "./menu/variable";

export const styleControlViews = {
  menu: {
    id: "controls.style.property.menu",
    render: StylePropertyMenuView,
  },
  variable: {
    id: "controls.style.property.menu.variable",
    render: VariableMenu,
  },
  expression: {
    id: "controls.style.property.menu.expression",
    render: InlineExpressionControl,
  },
  info: {
    id: "controls.style.property.menu.info",
    render: StylePropertyInfo,
  },
} satisfies Record<string, View>;
