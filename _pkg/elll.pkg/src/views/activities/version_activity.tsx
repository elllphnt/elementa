import { DrawerContainer } from "@repo/shell";
import { drawerViews } from "../drawers/_";

export function VersionActivityView(): JSX.Element {
  return (
    <DrawerContainer
      stateKey={["elll", "activities", "version", "drawers"]}
      drawers={[
        {
          key: "elll.drawer.versionActivity.changes",
          viewId: drawerViews.changes.id,
          title: "Changes",
        },
        {
          key: "elll.drawer.versionActivity.commits",
          viewId: drawerViews.commits.id,
          title: "Commits",
        },
        // {
        //   key: "elll.drawer.versionActivity.tags",
        //   viewId: drawerViews.tags.id,
        //   title: "Versions",
        // },
      ]}
    />
  );
}
