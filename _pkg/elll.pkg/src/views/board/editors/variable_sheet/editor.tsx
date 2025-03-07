import { baseSelector } from "@elllphnt/elll-element";
import { elllIcons16, Icon, ScrollArea } from "@repo/components";
import { useObservable } from "@repo/utils";
import { StyleModifierDefinition } from "~/src/modules/elementa/project/style_manager/style_modifiers/style_modifier";
import { StyleVariable } from "~/src/modules/elementa/project/style_manager/style_variables/style_variable";
import { StyleVariableSet } from "~/src/modules/elementa/project/style_manager/style_variables/style_variable_set";
import { StyleVariableSheet } from "~/src/modules/elementa/project/style_manager/style_variables/variable_sheet";

function AddVariableSetButton({ sheet }: { sheet: StyleVariableSheet }) {
  return (
    <button className="el-border el-border-dashed el-w-full el-rounded el-p-2 el-text-fg-300 el-flex el-items-center el-justify-center el-gap-2 hover:el-bg-fg/5 hover:el-border-transparent">
      <Icon name={elllIcons16.plus} className="el-translate-y-[-1px]" />
      <span>Add Variable Set</span>
    </button>
  );
}

function TitleInput({ set }: { set: StyleVariableSet }) {
  const name = useObservable(set.name$, set.name);
  return (
    <input
      className="el-w-full el-font-semibold el-text-lg el-p-2"
      value={name}
      onChange={(e) => set.setName(e.target.value)}
    />
  );
}

function VariableTableRow({
  variable,
  modes,
}: {
  variable: StyleVariable;
  modes: StyleModifierDefinition[];
}) {
  const name = useObservable(variable.name$, variable.name);
  const values = useObservable(variable.values$, variable.values);
  const defaultValue = values[baseSelector];

  return (
    <tr className="el-border-b">
      <td className="el-border-r el-px-2 el-py-1">{name}</td>
      <td className="el-border-r el-px-2 el-py-1">{defaultValue}</td>
      {modes.map((mode) => {
        const value = values[mode.id];
        return (
          <td key={mode.id} className="el-border-r el-px-2 el-py-1">
            {value}
          </td>
        );
      })}
    </tr>
  );
}

function ModeHeader({ mode }: { mode: StyleModifierDefinition }) {
  const name = useObservable(mode.name$, mode.name);
  return <td className="el-border-r el-px-2 el-py-1 el-text-fg-300">{name}</td>;
}

function VariableTable({ set }: { set: StyleVariableSet }) {
  const variables = useObservable(set.variables$, set.variables);
  const modes = useObservable(set.modes$, set.modes);

  return (
    <table className="el-w-full el-table-fixed el-border-t">
      <tr className="el-border-b">
        <td className="el-text-left el-border-r el-px-2 el-py-1 el-text-fg-300">
          Name
        </td>
        <td className="el-text-left el-border-r el-px-2 el-py-1 el-text-fg-300">
          Default
        </td>
        {modes.map((mode) => (
          <ModeHeader key={mode.id} mode={mode} />
        ))}
      </tr>
      {variables.map((variable) => (
        <VariableTableRow key={variable.id} variable={variable} modes={modes} />
      ))}
    </table>
  );
}

function VariableSetSheet({ set }: { set: StyleVariableSet }) {
  return (
    <div className="">
      <TitleInput set={set} />
      <VariableTable set={set} />
    </div>
  );
}

const VariableSheetEditor = ({ sheet }: { sheet: StyleVariableSheet }) => {
  const sets = useObservable(sheet.sets$, sheet.sets);
  const modes = useObservable(
    sheet.styleManager.modifierSheet.modifiers$,
    sheet.styleManager.modifierSheet.modifiers,
  );

  return (
    <ScrollArea scrollY containerClassName="el-p-4 el-space-y-8">
      {sets.map((set) => (
        <VariableSetSheet key={set.id} set={set} />
      ))}

      <AddVariableSetButton sheet={sheet} />
    </ScrollArea>
  );
};

export default VariableSheetEditor;
