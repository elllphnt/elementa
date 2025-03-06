import { ControlProps } from "../../_type";
import { SpinnerControl } from "../../ui/spinner/spinner";

export function NumberControl({
  value,
  value$,
  onChange,
  settings,
}: ControlProps<
  number,
  {
    min?: number;
    max?: number;
    step?: number;
  }
>) {
  return (
    <SpinnerControl
      value={value}
      value$={value$}
      onChange={onChange}
      settings={{
        min: settings?.min,
        max: settings?.max,
        step: settings?.step,
      }}
    />
  );
}
