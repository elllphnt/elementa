import {
  backgroundLayerToCss,
  ImageBackgroundLayerData,
} from "@elllphnt/elll-element";
import {
  ControlEntryVariant,
  lengthUnits,
  percentUnits,
} from "@repo/components";
import { elllControlTypes } from "~/src/components/ui/controls/_types";
import { DynamicControlEntry } from "~/src/components/ui/controls/dynamic";
import { DynamicType } from "../dynamics/_dynamics";

export function ImageControl({
  value,
  onChange,
}: {
  value: ImageBackgroundLayerData;
  onChange: (value: ImageBackgroundLayerData) => void;
}) {
  return (
    <div className="el-space-y-2 el-px-3 el-pb-3 el-pt-1">
      <div
        className="el-bg-bg-200 el-rounded-md"
        style={{
          width: "100%",
          aspectRatio: "16/9",
          background: `${backgroundLayerToCss(value)}, #8881`,
        }}
      />

      <div className="el-pl-2 el-space-y-2">
        <DynamicControlEntry
          label="Image URL"
          control={elllControlTypes.Text}
          value={value.url}
          onChange={(url) => onChange({ ...value, url: url as string })}
          onRemove={() => onChange({ ...value, url: undefined })}
          dynamics={{
            [DynamicType.DriveFile]: {},
          }}
        />
        <div
          style={{
            display: "flex",
            columnGap: "24px",
            rowGap: "8px",
            flexWrap: "wrap",
          }}
        >
          <DynamicControlEntry
            label="X"
            control={elllControlTypes.Dimension}
            controlSettings={{
              defaultUnit: "%",
              units: [...lengthUnits, ...percentUnits],
            }}
            value={value.position?.x}
            onChange={(x) =>
              onChange({
                ...value,
                position: {
                  y: {
                    value: 50,
                    unit: "%",
                  },
                  ...value.position,
                  x: x as any,
                },
              })
            }
            variant={ControlEntryVariant.Mini}
          />
          <DynamicControlEntry
            label="Y"
            value={value.position?.y}
            control={elllControlTypes.Dimension}
            controlSettings={{
              defaultUnit: "%",
              units: [...lengthUnits, ...percentUnits],
            }}
            onChange={(y) =>
              onChange({
                ...value,
                position: {
                  x: {
                    value: 50,
                    unit: "%",
                  },
                  ...value.position,
                  y: y as any,
                },
              })
            }
            variant={ControlEntryVariant.Mini}
          />
        </div>

        <DynamicControlEntry
          label="Size"
          control={elllControlTypes.Select}
          value={value.size}
          onChange={(size) => onChange({ ...value, size: size as any })}
          onRemove={() => onChange({ ...value, size: undefined })}
          controlSettings={{
            options: [
              { label: "Cover", value: "cover" },
              { label: "Contain", value: "contain" },
            ],
          }}
        />
        <DynamicControlEntry
          label="Repeat"
          control={elllControlTypes.Select}
          value={value.repeat}
          onChange={(repeat) => onChange({ ...value, repeat: repeat as any })}
          onRemove={() => onChange({ ...value, repeat: undefined })}
          controlSettings={{
            options: [
              { label: "No Repeat", value: "no-repeat" },
              { label: "Repeat", value: "repeat" },
              { label: "Repeat X", value: "repeat-x" },
              { label: "Repeat Y", value: "repeat-y" },
            ],
          }}
        />
      </div>
    </div>
  );
}
