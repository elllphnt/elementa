import {
  ColumnControlContainer,
  Control,
  FullControlEntry,
  SelectControl,
  TextControl,
} from "@repo/components";
import { Variable } from "@repo/elementa";
import { useObservable } from "@repo/utils";
import { useProjectThemes } from "../../../../hooks/project/themes";
import {
  Datatype,
  datatypeControlMap,
  datatypeNames,
} from "../../../../libs/datatypes";
import { editorControlMap } from "../../control_map";

export function VariableEditor({ variable }: { variable: Variable }) {
  const datatype = useObservable(variable.datatype$, variable.datatype);
  const controlType = datatype
    ? datatypeControlMap[datatype as Datatype]
    : undefined;
  const themes = useProjectThemes();

  return (
    <div
      className="el-space-y-2"
      style={{
        width: 240,
      }}
    >
      <FullControlEntry label="Name">
        <TextControl
          value={variable.name}
          value$={variable.name$}
          onChange={(value) => variable.setName(value)}
        />
      </FullControlEntry>
      <FullControlEntry label="Datatype">
        <SelectControl
          value={datatype}
          onChange={(value) => variable.setDatatype(value)}
          settings={{
            options: Object.entries(datatypeNames).map(([value, label]) => ({
              value,
              label,
            })),
          }}
        />
      </FullControlEntry>

      {controlType ? (
        <ColumnControlContainer title="Theme Values" noPadding>
          {themes?.map((theme) => (
            <FullControlEntry key={theme.id} label={theme.name}>
              <Control
                type={controlType}
                value={theme.value(variable.id)}
                value$={theme.value$(variable.id)}
                onChange={(value: any) => theme.setValue(variable.id, value)}
                map={editorControlMap}
              />
            </FullControlEntry>
          ))}
        </ColumnControlContainer>
      ) : (
        <></>
      )}
    </div>
  );
}
