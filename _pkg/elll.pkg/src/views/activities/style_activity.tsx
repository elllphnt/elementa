import { DrawerContainer } from "@repo/shell";
import { keys } from "~/src/libs/keys";

export function StyleActivityView(): JSX.Element {
  return (
    <DrawerContainer
      stateKey={["elll", "activities", "styles", "drawers"]}
      drawers={[
        {
          key: "elll.drawer.projectActivity.system",
          viewId: keys.views.drawers.style_system,
          title: "Style System",
        },
        {
          key: "elll.drawer.projectActivity.assets",
          viewId: keys.views.drawers.style_assets,
          title: "Style Assets",
        },
      ]}
    />
  );
}
