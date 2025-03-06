import {
  Control,
  ControlMenuAffinityProvider,
  elllIcons16,
  FullControlEntry,
  Icon,
  ScrollArea,
  useControlMenu,
} from "@repo/components";
import { Variable } from "@repo/elementa";
import { useObservable } from "@repo/utils";
import cx from "classnames";
import { editorControlMap } from "../../../components/controls/control_map";
import { useElllProject } from "../../../hooks/project/project";
import { useWorkspaceState } from "../../../hooks/shell/workspace";
import { Datatype, datatypeControlMap } from "../../../libs/datatypes";
import { ElllTheme } from "../../../libs/project/themes/theme";
import { VariableGroup } from "../../../libs/project/variables/variable_group";
import { modalViews } from "../_";

function ThemeValueEntry({
  variable,
  theme,
}: {
  variable: Variable;
  theme: ElllTheme;
}): JSX.Element {
  const name = useObservable(variable.name$, variable.name);
  const datatype = useObservable(variable.datatype$, variable.datatype);
  const value = useObservable(
    theme.value$(variable.id),
    theme.value(variable.id),
  );

  const control = datatype ? datatypeControlMap[datatype as Datatype] : null;

  if (control) {
    return (
      <FullControlEntry
        label={name || variable.id}
        active={value !== undefined}
        onRemove={
          value !== undefined
            ? () => theme.setValue(variable.id, undefined)
            : undefined
        }
      >
        <Control
          type={control}
          value$={theme.resolvedValue$(variable.id)}
          value={theme.resolvedValue(variable.id)}
          onChange={(value: any) => {
            theme.setValue(variable.id, value);
          }}
          map={editorControlMap}
        />
      </FullControlEntry>
    );
  } else {
    return (
      <FullControlEntry label={name}>
        <div className="el-h-7 el-bg-fg/5 el-rounded-md el-px-2 el-flex el-items-center el-text-fg-400">
          {datatype ? `No control for datatype: ${datatype}` : "No datatype"}
        </div>
      </FullControlEntry>
    );
  }
}

function ThemeValueEntryGroup({
  group,
  theme,
}: {
  group: VariableGroup;
  theme: ElllTheme;
}) {
  const name = useObservable(group.name$, group.name);
  const variables = useObservable(group.variables$, group.variables);
  const [open, setOpen] = useWorkspaceState(
    ["modals", "theme-values", "group", group.id],
    true,
  );

  return (
    <div className="el-space-y-2">
      <div
        className="el-flex el-items-center el-space-x-2 hover:el-bg-bg-100 el-h-7 el-rounded el-cursor-pointer el-px-1"
        onClick={() => setOpen(!open)}
      >
        <button className="el-h-5 el-w-5 el-flex el-items-center el-justify-center hover:el-bg-fg/5 el-rounded">
          <Icon
            name={elllIcons16.chevron}
            className={cx("el-transition-transform", {
              "el-rotate-90": open,
            })}
            onClick={() => setOpen(!open)}
          />
        </button>
        <div className="el-font-semibold">{name}</div>
      </div>
      {open ? (
        <div className="el-space-y-2 el-pl-6">
          {variables.map((variable) => (
            <ThemeValueEntry
              key={variable.id}
              variable={variable}
              theme={theme}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function ThemeValuesView({ theme }: { theme: ElllTheme }): JSX.Element {
  const project = useElllProject();
  const groups = useObservable(
    project.variableStore.groups$,
    project.variableStore.groups,
  );
  const { openMenu } = useControlMenu();

  return (
    <div
      className="el-h-full el-w-full el-flex el-flex-col el-gap-2"
      style={{
        width: 320,
      }}
    >
      <div className="el-grow el-overflow-hidden">
        <ControlMenuAffinityProvider affinity="side">
          <ScrollArea scrollY containerClassName="el-space-y-3">
            {groups.map((group) => (
              <ThemeValueEntryGroup
                key={group.key}
                group={group}
                theme={theme}
              />
            ))}
          </ScrollArea>
        </ControlMenuAffinityProvider>
      </div>

      <div>
        <button
          className="el-w-full el-py-2 el-bg-fg/5 hover:el-bg-fg/10 el-rounded-md el-text-fg"
          onClick={(e) =>
            openMenu({
              title: "All Variables",
              anchor: e.currentTarget,
              viewId: modalViews.variables.id,
            })
          }
        >
          All variables
        </button>
      </div>
    </div>
  );
}
