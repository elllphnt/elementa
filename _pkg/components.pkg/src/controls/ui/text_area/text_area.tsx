import TextArea from "react-textarea-autosize";
import { useControlValue } from "../../_hooks/value";
import { ControlProps } from "../../_type";
import { useTextFieldControl } from "../text/_hook";

export function TextAreaControl({
  value,
  value$,
  onChange,
  settings,
}: ControlProps<
  string,
  {
    placeholder?: string;
    minRows?: number;
    maxRows?: number;
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
    <TextArea
      className="el-border el-rounded-md el-w-full"
      style={{
        width: "100%",
        outline: "none",
        resize: "none",
        background: "transparent",
        padding: "5px 8px",
        display: "block",
      }}
      value={inputValue}
      placeholder={
        isMixed
          ? "mixed"
          : isUndefined
            ? settings?.placeholder || "unset"
            : settings?.placeholder || ""
      }
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      minRows={settings?.minRows}
      maxRows={settings?.maxRows}
    />
  );
}
