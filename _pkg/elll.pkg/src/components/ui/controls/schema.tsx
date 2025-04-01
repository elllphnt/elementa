import {
  BooleanControl,
  ControlProps,
  ExpressionControl,
  NumberControl,
  StringControl,
} from "@repo/components";

export function TypedControl({
  value,
  value$,
  onChange,
  settings,
}: ControlProps<
  any,
  {
    type?: string;
  }
>) {
  switch (settings?.type) {
    case "number": {
      return (
        <NumberControl value$={value$} value={value} onChange={onChange} />
      );
    }
    case "string": {
      return (
        <StringControl value$={value$} value={value} onChange={onChange} />
      );
    }
    case "boolean": {
      return (
        <BooleanControl value$={value$} value={value} onChange={onChange} />
      );
    }
    default: {
      return (
        <ExpressionControl value$={value$} value={value} onChange={onChange} />
      );
    }
  }
}
