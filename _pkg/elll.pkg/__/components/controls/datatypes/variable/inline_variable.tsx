import {
  Control,
  ControlProps,
  elllIcons16,
  FullControlEntry,
  Icon,
  ScrollArea,
  useControlMenu,
  useControlValue,
} from "@repo/components";
import { isVarRef, Theme, Variable, VarRef } from "@repo/elementa";
import { useObservable } from "@repo/utils";
import { useState } from "react";
import { useElllProject } from "../../../../hooks/project/project";
import { useProjectVariables } from "../../../../hooks/project/variables";
import {
  Datatype,
  datatypeControlMap,
  datatypeVarRefFormatMap,
} from "../../../../libs/datatypes";
import { variableControlViews } from "./_views";
import { NewVariableEntry } from "./new_variable_entry";
import { VariableEntry } from "./variable_entry";

export function InlineVariableControl({
  value$,
  value,
  onChange,
  settings,
}: ControlProps<
  any,
  {
    allowedTypes?: string[];
    newEntry?: boolean;
    onNewEntryComplete?: (variable?: Variable) => void;
    theme?: Theme;
  }
>) {
  const { openMenu } = useControlMenu();
  const currentValue = useControlValue(value$, value);
  const project = useElllProject();
  const variables = useProjectVariables({
    types: settings?.allowedTypes,
  });
  const [search, setSearch] = useState("");

  let currentVariable: Variable | undefined;

  if (isVarRef(currentValue)) {
    currentVariable = variables.find(
      (variable) => variable.id === currentValue.__var,
    );
  }

  const datatype = useObservable(
    currentVariable?.datatype$,
    currentVariable?.datatype,
  );
  const format = datatype
    ? datatypeVarRefFormatMap[datatype as Datatype]
    : undefined;

  let head: JSX.Element | null = null;

  if (settings?.newEntry) {
    head = (
      <NewVariableEntry
        onCompleted={(name) => {
          const trimmedName = name.trim();
          if (!trimmedName) {
            settings?.onNewEntryComplete?.();
            return;
          }

          const variable = new Variable({ project });
          variable.setName(name);
          variable.setDatatype(settings?.allowedTypes?.[0]);
          project.variableStore.addVariable(variable);
          settings?.onNewEntryComplete?.(variable);
        }}
      />
    );
  } else if (currentVariable) {
    head = (
      <>
        <div className="el-flex el-gap-1">
          <div className="el-grow">
            <VariableEntry
              active
              variable={currentVariable}
              actions={[
                {
                  icon: <Icon name={elllIcons16.cross} />,
                  handler: () => {
                    if (isVarRef(currentValue)) {
                      onChange?.(currentValue.fallback);
                    } else {
                      onChange?.(undefined);
                    }
                  },
                },
              ]}
              onClick={(e) => {
                openMenu({
                  anchor: e.currentTarget,
                  viewId: variableControlViews.editor.id,
                  title: "Variable",
                  props: {
                    variable: currentVariable,
                    theme: settings?.theme,
                  },
                });
              }}
            />
          </div>
        </div>
        {format?.options?.map((option) => {
          const control =
            option.control || datatypeControlMap[option.datatype as Datatype];
          if (!control) {
            return null;
          }
          return (
            <FullControlEntry key={option.key} label={option.name}>
              <Control
                value={currentValue?.format?.options?.[option.key]}
                onChange={(value) => {
                  if (isVarRef(currentValue)) {
                    onChange?.({
                      ...currentValue,
                      format: {
                        ...currentValue.format,
                        type: format.type,
                        options: {
                          ...currentValue.format?.options,
                          [option.key]: value,
                        },
                      },
                    });
                  }
                }}
                settings={option.controlSettings}
                type={control}
              />
            </FullControlEntry>
          );
        })}
      </>
    );
  }

  return (
    <div className="el-space-y-2">
      {head ? (
        <>
          {head} <hr />
        </>
      ) : (
        <></>
      )}
      <input
        type="text"
        className="el-h-7 el-rounded-md el-border el-px-2 el-w-full"
        placeholder="Search variables..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          outline: "none",
        }}
      />
      <div
        className="el-w-full el-overflow-hidden"
        style={{
          height: 200,
        }}
      >
        <ScrollArea scrollY>
          {variables.map((variable) => (
            <VariableEntry
              key={variable.key}
              variable={variable}
              onClick={() => {
                let nextValue: VarRef;
                if (isVarRef(currentValue)) {
                  nextValue = {
                    ...currentValue,
                    __var: variable.id,
                  };
                } else {
                  nextValue = {
                    __var: variable.id,
                    fallback: currentValue,
                  };
                }
                onChange?.(nextValue);
              }}
              filter={search}
            />
          ))}
        </ScrollArea>
      </div>
    </div>
  );
}
