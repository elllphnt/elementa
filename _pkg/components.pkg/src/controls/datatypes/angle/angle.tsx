import { DimensionData } from "@elllphnt/elll-element";
import { AngleUnit, angleUnits } from "../../_";
import { ControlProps } from "../../_type";
import { DimensionControl } from "../dimension/dimension";

export function AngleControl({
  value,
  value$,
  onChange,
}: ControlProps<DimensionData<AngleUnit> | number | string>) {
  return (
    <DimensionControl
      value$={value$}
      value={value}
      onChange={onChange}
      settings={{
        defaultUnit: "deg",
        units: [...angleUnits],
      }}
    />
  );
}
