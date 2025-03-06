import {
  DimensionData,
  FractionData,
  LengthData,
  PercentData,
  dimensionStringRegex,
  dimensionToString,
  isExpression,
  isVarRef,
} from "@elllphnt/elll-element";
import { useManyObservables } from "@repo/utils";
import { useMemo } from "react";
import { Observable } from "rxjs";
import { RawSizeInput } from "./raw_input";
import { mixed, resolveCommonValue } from "~/src/_lib/utils";

function parseSize(
  text: string,
): LengthData | PercentData | FractionData | "fit" | undefined {
  switch (text) {
    case "": {
      return undefined;
    }
    case "fit":
      return "fit";
    case "fill":
      return { value: 1, unit: "fr" };
    case "grow":
      return { value: 1, unit: "fr" };
    case "full":
      return { value: 100, unit: "%" };
    case "auto":
      return undefined;
  }

  const _value = text.match(dimensionStringRegex)?.[0] ?? "";
  const _unit = text.slice(_value.length).trim();

  const value = parseFloat(_value);
  if (isNaN(value)) return undefined;

  if (!_unit) return { value, unit: "px" };
  if (!["px", "%", "vh", "vw", "fr", "fit"].includes(_unit)) return undefined;

  return { value, unit: _unit } as LengthData | PercentData | FractionData;
}
export function StylePropertySizeInput({
  values,
  values$,
  vKey,
  onChange,
}: {
  values: Array<number | DimensionData<string> | string | undefined>;
  values$: Array<
    Observable<number | DimensionData<string> | string | undefined>
  >;
  vKey?: string;
  onChange?: (
    value: LengthData | PercentData | FractionData | "fit" | undefined,
  ) => void;
}) {
  const _values = useManyObservables(values$, values, vKey);

  const isOwn = true; //isOwns.every(Boolean);
  const commonValue = resolveCommonValue(_values);
  const isMixed = commonValue === mixed;
  const isExp = isExpression(commonValue);
  const isVar = isVarRef(commonValue);

  const textValue = useMemo(() => {
    if (commonValue === undefined) return "";
    if (commonValue === mixed) return "";

    if (isExpression(commonValue)) {
      return "";
    } else if (isVarRef(commonValue)) {
      return "";
    } else {
      if (!commonValue) {
        return "";
      } else if (typeof commonValue === "number") {
        return `${commonValue}px`;
      } else if (typeof commonValue === "string") {
        return commonValue;
      } else {
        return dimensionToString(commonValue);
      }
    }
  }, [commonValue]);

  return (
    <RawSizeInput
      value={textValue}
      isOwn={isOwn}
      isExpression={isExp}
      isVarRef={isVar}
      isMixed={isMixed}
      onChange={(v) => {
        const parsed = parseSize(v);
        onChange?.(parsed);
      }}
    />
  );
}
