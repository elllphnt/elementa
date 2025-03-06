import { ControlProps } from "../../_type";
import { TextControl } from "../../ui/text/text";

export function StringControl({
  value,
  value$,
  onChange,
  settings,
}: ControlProps<
  string,
  {
    min?: number;
    max?: number;
    step?: number;
  }
>) {
  return <TextControl value={value} value$={value$} onChange={onChange} />;
}
