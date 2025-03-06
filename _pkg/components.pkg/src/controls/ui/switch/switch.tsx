import cx from "classnames";
import { ReactNode } from "react";
import { useControlValue } from "../../_hooks/value";
import { ControlProps } from "../../_type";

export function SwitchControl<T>({
  value,
  value$,
  onChange,
  settings,
}: ControlProps<
  T,
  {
    variant?: "full" | "icon";
    options?: Array<{
      label: ReactNode;
      value: T;
    }>;
  }
>): JSX.Element {
  const currentValue = useControlValue(value$, value);
  const { options, variant } = settings ?? {};

  const _variant = variant ?? "full";

  return (
    <div
      className={cx("el-h-7 el-border", {})}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        padding: 2,
        borderRadius: 6,
        width: _variant === "full" ? "100%" : "fit-content",
      }}
    >
      {options?.map((option, index) => {
        return (
          <button
            key={`${option.value}`}
            onClick={() => onChange?.(option.value)}
            className={cx("el-transition-colors", {
              "el-border el-bg-pm/20 el-border-pm/30 hover:el-bg-pm/30 el-text-pm-contrast ":
                option.value === currentValue,
              "el-text-fg-500 hover:el-bg-bg-200/50 hover:el-text-fg-500":
                option.value !== currentValue,
            })}
            style={{
              height: "100%",
              width: _variant === "icon" ? 28 : `${100 / options.length}%`,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 4,
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export default SwitchControl;
