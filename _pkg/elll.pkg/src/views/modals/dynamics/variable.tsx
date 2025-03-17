import {
  isVarRef,
  StylePropertyName,
  StyleVariableData,
  VarRef,
} from "@elllphnt/elll-element";
import { ScrollArea, TreeEntry, TreeHeading } from "@repo/components";
import { Style } from "@repo/elementa-models";
import { useManyObservables, useObservable } from "@repo/utils";
import { useState } from "react";
import { useProjectVariableSets } from "~/src/hooks/project/variables";
import { StyleVariableSet } from "~/src/modules/elementa/project/style_manager/style_variables/style_variable_set";
import { ColorIcon } from "../../../components/ui/controls/_uncertain/fill/color_icon";
import {
  handlePropertyChange,
  useStyleControlEntry,
} from "../../../components/ui/controls/style_property";

function VariableEntry({
  variable,
  active,
  onClick,
}: {
  variable: StyleVariableData;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <TreeEntry
      title={variable.name}
      icon={<ColorIcon color={variable.values?.__base__} />}
      active={active}
      onClick={onClick}
    >
      {variable.name}
    </TreeEntry>
  );
}

function VariableSetSection({
  variableSet,
  active,
  onSelect,
}: {
  variableSet: StyleVariableSet;
  active: string;
  onSelect: (name: string) => void;
}) {
  const name = useObservable(variableSet.name$, variableSet.name);
  const variables = useObservable(
    variableSet.variables$,
    variableSet.variables,
  ).filter((v) => v.name);

  return (
    <>
      <TreeHeading>{name}</TreeHeading>
      {variables.map((variable, index) => (
        <VariableEntry
          key={index}
          variable={variable}
          onClick={() => onSelect(variable.name!)}
          active={variable.name === active}
        />
      ))}
    </>
  );
}

export function VariableTab({
  styles,
  properties,
}: {
  styles: Style[];
  properties: StylePropertyName[];
}) {
  const sets = useProjectVariableSets();
  const variables = useManyObservables(
    sets.map((s) => s.variables$),
    sets.map((s) => s.variables),
    sets.map((s) => s.id).join(":"),
  ).flat();
  const [search, setSearch] = useState("");
  const key = [properties, styles.map((style) => "st-" + style.key)].join(":");
  const [_value$, _value] = useStyleControlEntry(styles, properties, key);
  const value = useObservable(_value$, _value);

  const filteredVariables = variables.filter((variable) =>
    variable.name?.toLowerCase().includes(search.toLocaleLowerCase()),
  );

  return (
    <div className="el-h-full el-w-full el-space-y-2 el-flex el-flex-col">
      <div>
        <input
          className="el-h-7 el-border el-rounded el-w-full el-px-2"
          placeholder="Variable name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="el-grow el-overflow-hidden">
        <ScrollArea scrollY containerClassName="el-space-y-1">
          {filteredVariables.map((variable, index) => {
            const active = isVarRef(value) && value.__var === variable.name;
            return (
              <VariableEntry
                key={index}
                variable={variable}
                active={active}
                onClick={() => {
                  handlePropertyChange(properties, styles, {
                    __var: variable.name,
                    fallback: isVarRef(value) ? value.fallback : value,
                  } as VarRef);
                }}
              />
            );
          })}
        </ScrollArea>
      </div>
    </div>
  );
}
