import {
  ControlProps,
  elllIcons16,
  Icon,
  MenuButtonControl,
  mixed,
  useControlValue,
} from "@repo/components";
import { isVarRef, VarRef } from "@repo/elementa";
import { useObservable } from "@repo/utils";
import React from "react";
import { useProjectVariable } from "../../../../hooks/project/variables";
import { variableControlViews } from "./_views";

export function VariableControl({
  value,
  value$,
  onChange,
  settings,
}: ControlProps<
  VarRef | undefined,
  {
    title?: string;
  }
>) {
  const currentValue = useControlValue(value$, value);
  const isVar = isVarRef(currentValue);
  const variable = useProjectVariable(isVar ? currentValue.__var : undefined);
  let text: React.ReactNode;
  const name = useObservable(variable?.name$, variable?.name);

  const isNotFound = isVar && !variable;
  const isMixed = value === mixed;

  if (isNotFound) {
    text = "Not found";
  } else if (isVar) {
    text = name ?? <span className="el-text-fg-400">unnamed</span>;
  } else if (isMixed) {
    text = <span className="el-text-fg-400">mixed</span>;
  } else {
    text = <span className="el-text-fg-400">none</span>;
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
        accent: isNotFound ? "red" : "green",
        action: {
          icon: elllIcons16.cross,
          label: "Clear",
          handler: () => {
            if (isVarRef(currentValue)) {
              onChange?.(currentValue.fallback);
            } else {
              onChange?.(undefined);
            }
          },
        },
      }}
    />
  );
}
