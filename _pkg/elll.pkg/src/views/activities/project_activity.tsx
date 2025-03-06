import { DrawerContainer } from "@repo/shell";
import { drawerViews } from "../drawers/_";

export function ProjectActivityView(): JSX.Element {
  return (
    <DrawerContainer
      stateKey={["elll", "activities", "project", "drawers"]}
      drawers={[
        {
          key: "elll.drawer.projectActivity.project",
          viewId: drawerViews.project.id,
          title: "Project",
        },
        {
          key: "elll.drawer.projectActivity.danger",
          viewId: drawerViews.danger.id,
          title: "Danger",
        },
      ]}
    />
  );
}
