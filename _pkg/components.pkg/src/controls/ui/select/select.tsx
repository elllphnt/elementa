import cx from "classnames";
import { useRef, useState } from "react";
import { useHover } from "~/src/_hooks/use_hover";
import { elllIcons16 } from "~/src/icons/elll_icons";
import Icon from "~/src/icons/icon";
import Popper from "~/src/popper/popper";
import { PopperMenu } from "~/src/popper/popper_menu";
import { useControlValue } from "../../_";
import { ControlProps } from "../../_type";
import { mixed } from "../../_utils/mixed";
import { ControlButton } from "../button/button";

export function SelectControl<T>({
  value,
  value$,
  onChange,
  settings,
}: ControlProps<
  T,
  {
    options: { label: string; value: T; disabled?: boolean }[];
    placeholder?: string;
  }
>) {
  const currentValue = useControlValue(value$, value);
  const ref = useRef<HTMLDivElement>(null);
  const { options } = settings ?? {
    options: [],
  };
  const [anchor, setAnchor] = useState<HTMLElement>();
  const hover = useHover(ref);

  const option = options.find((o) => o.value === currentValue);
  const isUnset = option === undefined;
  const isMixed = currentValue === mixed;
  const unsetLabel = settings?.placeholder ?? "unset";
  let label = option?.label;

  if (isUnset) {
    label = unsetLabel;
  } else if (isMixed) {
    label = "mixed";
  }

  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        width: "100%",
      }}
    >
      <ControlButton
        onClick={(e) => {
          setAnchor(e.currentTarget);
        }}
        dimmed={isUnset || isMixed}
        label={label}
        suffix={
          <Icon
            className={cx("el-h-4 el-w-4", {
              "el-text-fg-500": isUnset || isMixed || !hover,
            })}
            style={{
              transform: "rotate(90deg)",
              flexShrink: 0,
            }}
            name={elllIcons16.chevron}
          />
        }
      />

      <Popper
        anchor={anchor}
        offset={4}
        align="stretch"
        exclusive
        onClose={() => setAnchor(undefined)}
        filled
        border
        shadow
      >
        <PopperMenu
          options={options.map((o) => ({
            label: o.label,
            value: o.value,
            disabled: o.disabled,
            onClick: () => {
              setAnchor(undefined);
              onChange?.(o.value);
            },
          }))}
        />
      </Popper>
    </div>
  );
}
