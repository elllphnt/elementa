import { DimensionData } from "@elllphnt/elll-element";
import { PercentUnit, percentUnits } from "../../_";
import { ControlProps } from "../../_type";
import { DimensionControl } from "../dimension/dimension";

export function PercentControl({
  value,
  value$,
  onChange,
}: ControlProps<DimensionData<PercentUnit> | number | string>) {
  return (
    <DimensionControl
      value$={value$}
      value={value}
      onChange={onChange}
      settings={{
        defaultUnit: "%",
        units: [...percentUnits],
      }}
    />
  );
}
