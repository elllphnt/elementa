import { TreeEntry } from "@repo/components";
import React from "react";
import { VariableIcon } from "./variable_icon";

export function VariableEntry({
  variable,
  onClick,
  active,
  actions,
  filter,
}: {
  variable: any;
  active?: boolean;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  actions?: {
    icon: React.ReactNode;
    handler?: ((event: React.MouseEvent) => void) | undefined;
  }[];
  filter?: string;
}) {
  const name = variable.name;

  if (filter && !name?.toLowerCase().includes(filter.toLowerCase())) {
    return null;
  }

  return (
    <TreeEntry
      active={active}
      accent={active}
      icon={<VariableIcon variable={variable} />}
      onClick={onClick}
      actions={actions}
    >
      {name}
    </TreeEntry>
  );
}
