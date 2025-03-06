import { DimensionData } from "@elllphnt/elll-element";
import { ControlProps } from "../../_type";
import { DimensionControl } from "../dimension/dimension";

export type DurationUnit = "s" | "ms";

export function DurationControl({
  value,
  value$,
  onChange,
}: ControlProps<DimensionData<DurationUnit> | number | string>) {
  return (
    <DimensionControl
      value$={value$}
      value={value}
      onChange={onChange}
      settings={{
        defaultUnit: "s",
        units: [
          {
            unit: "s",
            label: "s",
            step: 1,
          },
          {
            unit: "ms",
            label: "ms",
            step: 1,
          },
        ],
      }}
    />
  );
}
