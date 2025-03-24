import { DrawerContainer } from "@repo/shell";
import { drawerViews } from "../drawers/_";

export function ResourcesActivityView(): JSX.Element {
  return (
    <DrawerContainer
      stateKey={["elll", "activities", "resources", "drawers"]}
      drawers={[
        {
          key: "elll.drawer.developmentActivity.storage",
          viewId: drawerViews.storage.id,
          title: "Storage",
        },
        {
          key: "elll.drawer.developmentActivity.packages",
          viewId: drawerViews.packages.id,
          title: "Packages",
        },
        // {
        //   key: "elll.drawer.developmentActivity.libraries",
        //   viewId: drawerViews.libraries.id,
        //   title: "Libraries",
        // },
      ]}
    />
  );
}
