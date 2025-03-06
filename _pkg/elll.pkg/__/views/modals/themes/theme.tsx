import { useObservable } from "@repo/utils";
import TabContainer from "../../../components/tab/tab_container";
import { ElllTheme } from "../../../libs/project/themes/theme";
import { modalViews } from "../_";

export function ThemeView({ theme }: { theme: ElllTheme }): JSX.Element {
  const name = useObservable(theme.name$, theme.name);

  return (
    <div
      style={{
        height: 600,
        minWidth: 320,
        pointerEvents: "auto",
        display: "flex",
        flexDirection: "column",
      }}
      className="el-space-y-2"
    >
      <div className="el-text-fg-800 el-font-bold el-text-lg">{name}</div>
      <div className="el-grow el-overflow-hidden">
        <TabContainer
          stateKey={["elll", "modals", "collection", "tabs"]}
          tabs={[
            {
              key: "values",
              viewId: modalViews.themeValues.id,
              name: "Values",
            },
            {
              key: "settings",
              viewId: modalViews.themeSettings.id,
              name: "Settings",
            },
          ]}
          trimFirst
          props={{ theme }}
          hr
          containerClassName="el-pt-3"
        />
      </div>
    </div>
  );
}
