import TextareaAutosize from "react-textarea-autosize";
import { useControlValue } from "../../_hooks/value";
import { ControlProps } from "../../_type";
import { mixed } from "../../_utils/mixed";

export function ScriptControl({
  value,
  value$,
  onChange,
  settings,
}: ControlProps<
  string,
  {
    placeholder?: string;
  }
>) {
  const currentValue = useControlValue(value$, value);

  let script = "";
  let placeholder = "Enter script here.";
  let isMixed = false;

  if (currentValue === mixed) {
    script = "";
    isMixed = true;
    placeholder =
      "Mixed values. Enter script here to override the existing values.";
  } else if (currentValue) {
    script = currentValue;
  }

  return (
    <TextareaAutosize
      style={{
        resize: "none",
        display: "block",
        background: "transparent",
      }}
      maxRows={10}
      className="el-w-full el-p-2 el-outline-none el-border el-rounded-md el-font-mono"
      value={script}
      placeholder={settings?.placeholder ?? placeholder}
      onChange={(e) => {
        onChange?.(e.target.value);
      }}
      minRows={3}
      spellCheck={false}
    />
  );
}
