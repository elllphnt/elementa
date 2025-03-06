import { DimensionData } from "@elllphnt/elll-element";
import { FractionUnit, fractionUnits } from "../../_";
import { ControlProps } from "../../_type";
import { DimensionControl } from "../dimension/dimension";

export function FractionControl({
  value,
  value$,
  onChange,
}: ControlProps<DimensionData<FractionUnit> | number | string>) {
  return (
    <DimensionControl
      value$={value$}
      value={value}
      onChange={onChange}
      settings={{
        defaultUnit: "fr",
        units: [...fractionUnits],
      }}
    />
  );
}
