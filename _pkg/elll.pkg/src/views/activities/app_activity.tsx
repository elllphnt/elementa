import { DrawerContainer } from "@repo/shell";
import { drawerViews } from "../drawers/_";

export function AppActivityView(): JSX.Element {
  return (
    <DrawerContainer
      stateKey={["elll", "activities", "app", "drawers"]}
      drawers={[
        {
          key: "elll.drawer.projectActivity.app",
          viewId: drawerViews.app.id,
          title: "Application",
        },
      ]}
    />
  );
}
