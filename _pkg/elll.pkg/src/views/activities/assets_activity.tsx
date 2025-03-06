import { DrawerContainer } from "@repo/shell";

export function AssetsActivityView(): JSX.Element {
  return (
    <DrawerContainer
      stateKey={["elll", "activities", "assets", "drawers"]}
      drawers={[
        {
          key: "elll.drawer.projectActivity.style",
          viewId: "",
          title: "Palettes",
        },
        {
          key: "elll.drawer.projectActivity.typefaces",
          viewId: "",
          title: "Typefaces",
        },
        {
          key: "elll.drawer.projectActivity.animations",
          viewId: "",
          title: "Animations",
        },
      ]}
    />
  );
}
