import {
  ControlButton,
  elllIcons16,
  Icon,
  useControlMenu,
} from "@repo/components";
import { Prop } from "@repo/elementa";
import { propControlViews } from "./_views";

export function PropControl({ prop }: { prop: Prop }) {
  const { openMenu } = useControlMenu();

  return (
    <ControlButton
      prefix={<Icon name={elllIcons16.model} className="el-h-4 el-w-4" />}
      label={prop.name}
      onClick={(e) => {
        openMenu({
          anchor: e.currentTarget,
          title: "Prop",
          viewId: propControlViews.menu.id,
          props: {
            prop,
          },
        });
      }}
    />
  );
}
