import { FocusEventHandler, ReactNode } from "react";
import { useControlValue } from "../../_hooks/value";
import { ControlProps } from "../../_type";
import { useTextFieldControl } from "./_hook";
import { RawTextFieldControl } from "./raw";

export function TextControl({
  value,
  value$,
  onChange,
  settings,
}: ControlProps<
  string,
  {
    suffix?: ReactNode;
    autofocus?: boolean;
    onFocus?: FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
    onBlur?: FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
    placeholder?: string;
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
  } = useTextFieldControl({ value: currentValue, onChange });

  return (
    <RawTextFieldControl
      value={inputValue}
      isMixed={isMixed}
      isUndefined={isUndefined}
      onChange={handleChange}
      onFocus={(e) => {
        handleFocus(e);
        settings?.onFocus?.(e);
      }}
      onBlur={(e) => {
        handleBlur(e);
        settings?.onBlur?.(e);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.currentTarget.blur();
        }
      }}
      autofocus={settings?.autofocus}
      placeholder={settings?.placeholder}
      suffix={settings?.suffix}
    />
  );
}
