import TabContainer from "../../../../tab/tab_container";
import { typefaceControlViews } from "../_views";

export function TypefaceBrowser({
  onTypeface,
}: {
  onTypeface?: (typeface: any) => void;
}): JSX.Element {
  return (
    <div
      style={{
        height: 360,
        width: 540,
      }}
    >
      <TabContainer
        stateKey={["elll.elementa.typeface.browser", "tab"]}
        tabs={[
          {
            key: "google",
            name: "Google Fonts",
            viewId: typefaceControlViews.googleBrowser.id,
          },
        ]}
        props={{
          onTypeface,
        }}
        containerClassName="el-pt-2"
      />
    </div>
  );
}
