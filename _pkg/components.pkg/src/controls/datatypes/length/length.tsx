import { DimensionData } from "@elllphnt/elll-element";
import { LengthUnit, lengthUnits } from "../../_";
import { ControlProps } from "../../_type";
import { DimensionControl } from "../dimension/dimension";

export function LengthControl({
  value,
  value$,
  onChange,
}: ControlProps<DimensionData<LengthUnit> | number | string>) {
  return (
    <DimensionControl
      value$={value$}
      value={value}
      onChange={onChange}
      settings={{
        defaultUnit: "px",
        units: [...lengthUnits],
      }}
    />
  );
}
