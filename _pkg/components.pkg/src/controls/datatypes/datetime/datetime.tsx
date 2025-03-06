import { useControlValue } from "../../_hooks/value";
import { ControlProps } from "../../_type";
import { mixed } from "../../_utils/mixed";
import { MenuButtonControl } from "../../ui/menu_button/menu_button";

export function DateTimeControl({
  value,
  value$,
  onChange,
  settings,
}: ControlProps<
  Date | undefined,
  {
    title?: string;
  }
>) {
  const currentValue = useControlValue(value$, value);
  let text = currentValue === mixed ? "mixed" : currentValue?.toLocaleString();

  return (
    <MenuButtonControl
      value={value}
      value$={value$}
      onChange={onChange}
      settings={{
        label: text,
        menu: {
          title: settings?.title ?? "Date Time",
        },
      }}
    />
  );
}
