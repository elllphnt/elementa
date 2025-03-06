import { TreeEntry } from "@repo/components";
import { Variable } from "@repo/elementa";
import { useObservable } from "@repo/utils";
import React from "react";
import { VariableIcon } from "./variable_icon";

export function VariableEntry({
  variable,
  onClick,
  active,
  actions,
  filter,
}: {
  variable: Variable;
  active?: boolean;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  actions?: {
    icon: React.ReactNode;
    handler?: ((event: React.MouseEvent) => void) | undefined;
  }[];
  filter?: string;
}) {
  const name = useObservable(variable.name$, variable.name);

  if (filter && !name?.toLowerCase().includes(filter.toLowerCase())) {
    return null;
  }

  return (
    <TreeEntry
      active={active}
      accent={active}
      icon={<VariableIcon variable={variable} />}
      key={variable.key}
      onClick={onClick}
      actions={actions}
    >
      {name}
    </TreeEntry>
  );
}
