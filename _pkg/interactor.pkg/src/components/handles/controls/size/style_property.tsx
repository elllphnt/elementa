import {
  DimensionData,
  FlexData,
  LengthData,
  PercentData,
  isExpression,
  isVarRef,
  parseDimension,
  parseNumber,
  stringifyDimension,
} from "@elllphnt/elll-element";
import { useManyObservables } from "@repo/utils";
import { useMemo } from "react";
import { Observable } from "rxjs";
import { mixed, resolveCommonValue } from "~/src/_lib/utils";
import { RawSizeInput } from "./raw_input";

function parseSize(
  text: string,
): LengthData | PercentData | FlexData | "fit" | undefined {
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

  // number
  const [parsedNumber] = parseNumber(text);
  if (parsedNumber !== undefined) {
    return {
      value: parsedNumber ?? 0,
      unit: "px",
    };
  }

  const [parsedDimension] = parseDimension(text);
  if (parsedDimension !== undefined) {
    const { unit, value } = parsedDimension;
    if (!["px", "%", "vh", "vw", "fr", "fit"].includes(unit)) return undefined;

    return { value, unit } as LengthData | PercentData | FlexData;
  }
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
    value: LengthData | PercentData | FlexData | "fit" | undefined,
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
        return stringifyDimension(commonValue);
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
