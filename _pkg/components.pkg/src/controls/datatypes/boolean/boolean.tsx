import { ReactNode } from "react";
import { ControlProps } from "../../_type";
import SwitchControl from "../../ui/switch/switch";

export function BooleanControl({
  value,
  value$,
  onChange,
  settings,
}: ControlProps<
  boolean,
  {
    variant: "full" | "icon";
    options: Record<
      "true" | "false",
      {
        label: ReactNode;
      }
    >;
  }
>): JSX.Element {
  const { options, variant } = settings ?? {};

  return (
    <SwitchControl
      value={value}
      value$={value$}
      onChange={onChange}
      settings={{
        variant: variant,
        options: [
          { label: options?.false?.label ?? "false", value: false },
          { label: options?.true?.label ?? "true", value: true },
        ],
      }}
    />
  );
}
