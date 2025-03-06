import TabContainer from "~/src/components/tab_container/tab_container";
import { modalViews } from "../_";

export function PackageBrowser(): JSX.Element {
  return (
    <div
      style={{
        height: 360,
      }}
    >
      <TabContainer
        stateKey={["elll.package.browser", "tab"]}
        tabs={[
          {
            key: "npm",
            name: "NPM",
            viewId: modalViews.npmPackageBrowser.id,
          },
        ]}
        containerClassName="el-pt-2"
      />
    </div>
  );
}
