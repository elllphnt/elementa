import { DrawerContainer } from "@repo/shell";
import { drawerViews } from "../drawers/_";

export function WorkspaceActivityView(): JSX.Element {
  return (
    <DrawerContainer
      stateKey={["elll", "activities", "workspace", "drawers"]}
      drawers={[
        {
          key: "elll.drawer.workspaceActivity.workspace",
          viewId: drawerViews.workspace.id,
          title: "Workspace",
        },
        {
          key: "elll.drawer.workspaceActivity.files",
          viewId: drawerViews.files.id,
          title: "Files",
        },
        {
          key: "elll.drawer.workspaceActivity.danger",
          viewId: drawerViews.danger.id,
          title: "Danger",
        },
      ]}
    />
  );
}
