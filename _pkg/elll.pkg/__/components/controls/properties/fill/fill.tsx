import { ControlProps, MenuButtonControl, MixedType } from "@repo/components";
import { FillData } from "@repo/elementa";
import { fillControlViews } from "./_views/_";
import { FillIcon } from "./fill_icon";
import { FillLabel } from "./fill_label";

export function FillControl({
  value,
  value$,
  onChange,
  settings,
}: ControlProps<
  FillData | MixedType | undefined,
  {
    title?: string;
  }
>) {
  return (
    <MenuButtonControl
      value$={value$}
      value={value}
      onChange={onChange}
      settings={{
        label: <FillLabel value={value} value$={value$} />,
        prefix: <FillIcon value={value} value$={value$} />,
        menu: {
          title: settings?.title ?? "Fill",
          viewId: fillControlViews.menu.id,
        },
      }}
    />
  );
}
