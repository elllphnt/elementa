import { ReactNode } from "react";
import { useControlValue } from "../../_hooks/value";
import { ControlProps } from "../../_type";
import { StatelessSpinnerControl } from "./stateless_spinner";
import { useSpinnerControl } from "./use_spinner";

export function SpinnerControl({
  value,
  value$,
  onChange,
  settings,
}: ControlProps<
  number,
  {
    suffix?: ReactNode;
    step?: number;
    min?: number;
    max?: number;
    round?: number;
    showIncrementors?: boolean;
  }
>) {
  const currentValue = useControlValue(value$, value);

  const {
    inputValue,
    isMixed,
    isUndefined,
    handleChange,
    handleFocus,
    handleBlur,
    increment,
    decrement,
    startLongIncrement,
    startLongDecrement,
  } = useSpinnerControl({
    value: currentValue,
    onChange,
    step: settings?.step,
    min: settings?.min,
    max: settings?.max,
    round: settings?.round,
  });

  return (
    <StatelessSpinnerControl
      value={inputValue}
      isMixed={isMixed}
      isUndefined={isUndefined}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      suffix={settings?.suffix}
      increment={increment}
      decrement={decrement}
      startLongIncrement={startLongIncrement}
      startLongDecrement={startLongDecrement}
      step={settings?.step}
      min={settings?.min}
      max={settings?.max}
      showIncrementors={settings?.showIncrementors}
    />
  );
}
