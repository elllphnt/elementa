import { View } from "@repo/components";
import { VariableControlMenu } from "./inline_variable";
import { VariableEditor } from "./variable_editor";

export const variableControlViews = {
  menu: {
    id: "controls.datatypes.variable.menu",
    render: VariableControlMenu,
  },
  editor: {
    id: "controls.datatypes.variable.editor",
    render: VariableEditor,
  },
} satisfies Record<string, View>;
