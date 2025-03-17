import { isVarRef } from "@elllphnt/elll-element";
import {
  ColorAccent,
  ControlProps,
  elllIcons16,
  Icon,
  MenuButtonControl,
  mixed,
  useControlValue,
} from "@repo/components";
import React from "react";
import { useProjectVariable } from "~/src/hooks/project/variables";
import { variableControlViews } from "../../../views/modals/style_variable/_views";

export function ReferenceControl({
  value,
  value$,
  onChange,
  settings,
}: ControlProps<
  any,
  {
    title?: string;
  }
>) {
  const currentValue = useControlValue(value$, value);
  const isVar = isVarRef(currentValue);
  const name = isVar ? currentValue.__var : "";
  const variable = useProjectVariable(name);
  let text: React.ReactNode;
  let accent: ColorAccent = "yellow";

  const isUnset = !name;
  const isNotFound = isVar && !variable;
  const isMixed = value === mixed;

  if (isUnset) {
    text = "unset";
    accent = "yellow";
  } else if (isNotFound) {
    text = "Not found";
    accent = "red";
  } else if (isVar) {
    text = name ?? <span className="el-text-fg-400">unnamed</span>;
    accent = "purple";
  } else if (isMixed) {
    text = <span className="el-text-fg-400">mixed</span>;
    accent = "purple";
  }

  return (
    <MenuButtonControl
      value={value}
      value$={value$}
      onChange={onChange}
      settings={{
        label: text,
        prefix: <Icon name={elllIcons16.variable} />,
        menu: {
          title: settings?.title ?? "Variable",
          viewId: variableControlViews.menu.id,
        },
        accent,
        action: {
          icon: elllIcons16.cross,
          label: "Clear",
          handler: () => {
            if (isVarRef(value)) {
              onChange?.(value.fallback);
            } else {
              onChange?.(undefined);
            }
          },
        },
      }}
    />
  );
}
