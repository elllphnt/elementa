import { StylePropertyName } from "@elllphnt/elll-element";
import { elllIcons16 } from "@repo/components";
import { Style } from "@repo/elementa-models";
import TabContainer from "~/src/components/tab_container/tab_container";
import { styleControlViews } from "../_views";

export function StylePropertyMenuView({
  styles,
  properties,
}: {
  styles: Style[];
  properties: StylePropertyName[];
}) {
  return (
    <div
      style={{
        height: 240,
        width: 240,
      }}
      className="-el-mt-2"
    >
      <TabContainer
        useIcon
        stateKey={["control", "style", "menu"]}
        containerClassName="el-pt-1"
        tabs={[
          {
            key: "variable",
            name: "Variable",
            icon: elllIcons16.variable,
            viewId: styleControlViews.variable.id,
          },
          {
            key: "expression",
            name: "Expression",
            icon: elllIcons16.model,
            viewId: styleControlViews.expression.id,
          },
        ]}
        props={{
          styles,
          properties,
        }}
      />
    </div>
  );
}
