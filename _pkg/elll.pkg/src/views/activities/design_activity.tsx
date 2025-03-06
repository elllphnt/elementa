import { DrawerContainer } from "@repo/shell";
import { drawerViews } from "../drawers/_";

export function DesignActivityView(): JSX.Element {
  return (
    <DrawerContainer
      stateKey={["elll", "activities", "design", "drawers"]}
      drawers={[
        {
          key: "elll.drawer.designActivity.files",
          viewId: drawerViews.files.id,
          title: "Files",
        },
        {
          key: "elll.drawer.designActivity.outline",
          viewId: drawerViews.outline.id,
          title: "Outline",
        },
      ]}
    />
  );
}
