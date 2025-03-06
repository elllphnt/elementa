import { Expression } from "@elllphnt/elll-element";
import { elllIcons16 } from "~/src/icons/elll_icons";
import Icon from "~/src/icons/icon";
import { useControlValue } from "../../_hooks/value";
import { ControlProps } from "../../_type";
import { mixed } from "../../_utils/mixed";
import { MenuButtonControl } from "../../ui/menu_button/menu_button";
import { expressionControlViews } from "./_views";

export function ExpressionControl({
  value,
  value$,
  onChange,
  settings,
}: ControlProps<
  Expression | undefined,
  {
    title?: string;
  }
>) {
  const currentValue = useControlValue(value$, value);
  let text =
    currentValue === mixed ? "mixed" : currentValue?.__expression?.slice(0, 20);

  return (
    <MenuButtonControl
      value={value}
      value$={value$}
      onChange={onChange}
      settings={{
        label: text,
        prefix: <Icon name={elllIcons16.state} />,
        accent: "purple",
        menu: {
          viewId: expressionControlViews.menu.id,
          title: settings?.title ?? "Expression",
        },
        action: {
          icon: elllIcons16.cross,
          label: "Remove Expression",
          handler: () => {
            onChange?.(undefined);
          },
        },
      }}
    />
  );
}
