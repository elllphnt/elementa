import {
  ControlButton,
  ControlProps,
  elllIcons16,
  Icon,
  IconButton,
  mixed,
  Popper,
  PopperMenu,
  useControlMenu,
  useControlValue,
} from "@repo/components";
import { Schema } from "@repo/elementa-models";
import { useObservable } from "@repo/utils";
import cx from "classnames";
import _ from "lodash";
import { ReactNode, useRef, useState } from "react";

const schemaTypes = {
  string: {
    name: "String",
  },
  number: {
    name: "Number",
  },
  boolean: {
    name: "Boolean",
  },
  object: {
    name: "Object",
  },
  array: {
    name: "Array",
  },
  function: {
    name: "Function",
  },
  tupple: {
    name: "Tupple",
  },
};

function SchemaControlLabel({ value }: { value: Schema | undefined }) {
  const type = useObservable(value?.type$, value?.type);

  return <span>{_.capitalize(type)}</span>;
}

export function SchemaControl({
  value,
  value$,
  onChange,
  settings,
}: ControlProps<
  Schema | undefined,
  {
    title?: string;
  }
>) {
  const { openMenu } = useControlMenu();
  const currentValue = useControlValue(value$, value);
  const ref = useRef<HTMLDivElement>(null);
  const [anchor, setAnchor] = useState<HTMLElement>();

  const isUnset = currentValue === undefined;
  const isMixed = currentValue === mixed;
  let label: ReactNode = "unset";

  if (isUnset) {
    label = "unset";
  } else if (isMixed) {
    label = "mixed";
  } else {
    label = <SchemaControlLabel value={currentValue} />;
  }

  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        width: "100%",
      }}
    >
      <ControlButton
        onClick={(e) => {
          setAnchor(e.currentTarget);
        }}
        dimmed={isUnset || isMixed}
        label={label}
        suffix={
          <div className="el-flex el-items-center el-gap-1">
            <IconButton
              icon={elllIcons16.properties}
              onClick={(e) => {
                e.stopPropagation();
                openMenu({
                  viewId: "schema-menu",
                });
              }}
            />
            <Icon
              className={cx("el-h-4 el-w-4 el-shrink-0", {
                "el-text-fg-500": isUnset || isMixed,
              })}
              style={{
                transform: "rotate(90deg)",
                flexShrink: 0,
              }}
              name={elllIcons16.chevron}
            />
          </div>
        }
      />

      <Popper
        anchor={anchor}
        offset={4}
        align="stretch"
        exclusive
        onClose={() => setAnchor(undefined)}
        filled
        border
        shadow
      >
        <PopperMenu
          options={Object.entries(schemaTypes).map(([type, schema]) => ({
            label: schema.name,
            value: type,
            onClick: () => {
              setAnchor(undefined);
              if (currentValue instanceof Schema) {
                currentValue.setType(type);
              } else {
                const schema = new Schema();
                schema.setType(type);
                onChange?.(schema);
              }
            },
          }))}
        />
      </Popper>
    </div>
  );
}
