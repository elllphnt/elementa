import {
  BaseControlType,
  ColumnControlContainer,
  Control,
  FullControlEntry,
  SelectControl,
  TextControl,
} from "@repo/components";
import { Prop } from "@repo/elementa";
import { useObservable } from "@repo/utils";
import { Datatype, datatypeControlMap } from "../../../libs/datatypes";

export function ComponentPropView({ prop }: { prop: Prop }) {
  const name = useObservable(prop.name$, prop.name);
  const type = useObservable(prop.datatype$, prop.datatype);
  const required = useObservable(prop.required$, prop.required);

  return (
    <div>
      <ColumnControlContainer noPadding>
        <FullControlEntry label="Name">
          <TextControl value={name} onChange={(value) => prop.setName(value)} />
        </FullControlEntry>
        <FullControlEntry label="Type">
          <SelectControl
            value={type}
            onChange={(value) => prop.setDatetype(value)}
            settings={{
              options: [
                {
                  value: "string",
                  label: "String",
                },
                {
                  value: "number",
                  label: "Number",
                },
                {
                  value: "boolean",
                  label: "Boolean",
                },
                {
                  value: "vector",
                  label: "Vector",
                },
                {
                  value: "expression",
                  label: "Expression",
                },
              ],
            }}
          />
        </FullControlEntry>
        <FullControlEntry label="Required">
          <SelectControl
            value={required ? "true" : "false"}
            onChange={(value) => prop.setRequired(value === "true")}
            settings={{
              options: [
                {
                  value: "true",
                  label: "True",
                },
                {
                  value: "false",
                  label: "False",
                },
              ],
            }}
          />
        </FullControlEntry>
        <FullControlEntry label="Default">
          <Control
            type={
              datatypeControlMap[type as Datatype] || BaseControlType.Expression
            }
            value={prop.default}
            value$={prop.default$}
            onChange={(value) => prop.setDefault(value)}
          />
        </FullControlEntry>
      </ColumnControlContainer>
    </div>
  );
}
