import { DimensionData } from "@elllphnt/elll-element";
import { useRef, useState } from "react";
import Popper from "~/src/popper/popper";
import { PopperMenu } from "~/src/popper/popper_menu";
import { useControlValue } from "../../_hooks/value";
import { ControlProps } from "../../_type";
import { mixed } from "../../_utils/mixed";
import { ControlButton } from "../../ui/button/button";
import { StatelessSpinnerControl } from "../../ui/spinner/stateless_spinner";
import { useSpinnerControl } from "../../ui/spinner/use_spinner";

export type DimensionControlProps<U extends string = string> = ControlProps<
  DimensionData<U> | number | string,
  {
    units: {
      label: string;
      unit: U;
      step?: number;
      min?: number;
      max?: number;
    }[];
    keywords?: { label: string; value: U }[];
    defaultUnit: U;
  }
>;

export function DimensionControl<U extends string>({
  value,
  value$,
  onChange,
  settings,
}: DimensionControlProps<U>) {
  const {
    units,
    defaultUnit,
    keywords = [],
  } = settings ?? {
    units: [],
  };
  const ref = useRef<HTMLDivElement>(null);
  const _value = useControlValue(value$, value);

  let numberValue: number | undefined;
  let unit: U | undefined;

  if (_value === mixed) {
    unit = defaultUnit;
  } else if (typeof _value === "number") {
    numberValue = _value;
    unit = defaultUnit;
  } else if (typeof _value === "string") {
    unit = defaultUnit;
  } else {
    numberValue = _value?.value;
    unit = _value?.unit ?? defaultUnit;
  }

  const {
    inputValue,
    isMixed,
    isUndefined,
    handleChange,
    handleFocus,
    handleBlur,
    increment,
    decrement,
    startLongDecrement,
    startLongIncrement,
  } = useSpinnerControl({
    value: numberValue,
    onChange: (value: number | undefined) => {
      if (value === undefined) {
        onChange?.(undefined);
      } else if (unit) {
        onChange?.({
          value,
          unit,
        });
      }
    },
  });

  const isKeyWord = typeof _value === "string";
  const keywordData = isKeyWord
    ? keywords.find((keyword) => keyword.value === _value)
    : undefined;

  const unitDatum = units.find((datum) => datum.unit === unit);

  const [showUnits, setShowUnits] = useState(false);

  return (
    <div ref={ref} className="el-w-full">
      {keywordData ? (
        <ControlButton
          onClick={() => {
            setShowUnits(true);
          }}
          label={keywordData.label}
        />
      ) : (
        <StatelessSpinnerControl
          value={inputValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          isMixed={isMixed}
          isUndefined={isUndefined}
          increment={increment}
          decrement={decrement}
          startLongDecrement={startLongDecrement}
          startLongIncrement={startLongIncrement}
          min={unitDatum?.min}
          max={unitDatum?.max}
          step={unitDatum?.step}
          suffix={
            <div
              className="hover:el-text-fg-500"
              style={{
                cursor: "pointer",
              }}
              onClick={() => {
                setShowUnits(true);
              }}
            >
              {unitDatum?.unit}
            </div>
          }
        />
      )}
      <Popper
        anchor={showUnits ? ref.current ?? undefined : undefined}
        align="center"
        offset={4}
        exclusive
        filled
        border
        onClose={() => setShowUnits(false)}
      >
        <PopperMenu
          options={[
            ...units.map((unitDatum) => ({
              label: (
                <div className="flex el-gap-3">
                  <span className="grow">{unitDatum.label}</span>
                  <span className="el-text-fg-400"> {unitDatum.unit}</span>
                </div>
              ),
              onClick: () => {
                setShowUnits(false);
                let value = Number(inputValue);
                if (isNaN(value)) {
                  value = 0;
                }
                onChange?.({
                  value,
                  unit: unitDatum.unit as any,
                });
              },
            })),

            ...keywords.map((keyword) => ({
              label: keyword.label,
              onClick: () => {
                setShowUnits(false);
                onChange?.(keyword.value);
              },
            })),
          ]}
        />
      </Popper>
    </div>
  );
}
