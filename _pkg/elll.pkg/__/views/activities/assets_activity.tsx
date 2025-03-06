import { DrawerContainer } from "@repo/shell";
import { drawerViews } from "../drawers/_";

export function AssetsActivityView(): JSX.Element {
  return (
    <DrawerContainer
      stateKey={["elll", "activities", "assets", "drawers"]}
      drawers={[
        {
          key: "elll.drawer.projectActivity.themes",
          viewId: drawerViews.themes.id,
          title: "Themes",
        },
        {
          key: "elll.drawer.developmentActivity.packages",
          viewId: drawerViews.packages.id,
          title: "Packages",
        },
      ]}
    />
  );
}
