import { elllIcons16 } from "@repo/components";
import React from "react";
import { Observable } from "rxjs";
import TabContainer, { TabData } from "~/src/components/ui/tabs/tab_container";
import { DynamicType } from "./_dynamics";
import { ExpressionTab } from "./expression";
import { DriveFileTab } from "./drive_file";

const dynamicTabMap: Record<
  string | number,
  {
    name: string;
    view: React.FC;
    icon: string;
  }
> = {
  [DynamicType.Expression]: {
    name: "Expression",
    view: ExpressionTab,
    icon: elllIcons16.model,
  },
  [DynamicType.DriveFile]: {
    name: "Drive File",
    view: DriveFileTab,
    icon: elllIcons16.drive,
  },
};

export function DynamicControlMenuView({
  value$,
  value,
  onChange,
  dynamics,
}: {
  value$?: Observable<any>;
  value?: any;
  onChange?: (value: any) => void;
  dynamics?: Record<DynamicType, any>;
}) {
  const tabs: TabData<{
    value$?: Observable<any>;
    value?: any;
    onChange?: (value: any) => void;
  }>[] = [];

  if (dynamics) {
    for (const [type, options] of Object.entries(dynamics)) {
      const tab = dynamicTabMap[type];
      if (!tab) continue;
      tabs.push({
        key: type,
        name: tab.name,
        view: (props) => (
          <tab.view
            {...({
              ...props,
              options: typeof options === "object" ? options : {},
            } as any)}
          />
        ),
        icon: tab.icon,
      });
    }
  }

  return (
    <div
      style={{
        width: 260,
        height: 300,
      }}
    >
      <TabContainer
        useIcon
        stateKey={["modal", "control-menu", "menu"]}
        tabs={tabs}
        props={{
          value$,
          value,
          onChange,
        }}
      />
    </div>
  );
}
