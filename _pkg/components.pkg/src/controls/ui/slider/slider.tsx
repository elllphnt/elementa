import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { ReactNode } from "react";
import { mixed, SpinnerControl } from "../../_";
import { useControlValue } from "../../_hooks/value";
import { ControlProps } from "../../_type";

export function SliderControl({
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
    scale?: number;
  }
>) {
  const currentValue = useControlValue(value$, value);
  const scale = settings?.scale || 1;
  const min = settings?.min !== undefined ? settings?.min * scale : undefined;
  const max = settings?.max !== undefined ? settings?.max * scale : undefined;
  const step =
    settings?.step !== undefined ? settings?.step * scale : undefined;

  return (
    <div className="el-h-7 el-w-full el-flex el-items-center el-gap-2 el-pr-1.5">
      <div
        style={{
          width: 54,
          flexShrink: 0,
        }}
      >
        <SpinnerControl
          value={(currentValue === mixed ? 0 : currentValue || 0) * scale}
          onChange={(value) => {
            onChange?.((value as number) / scale);
          }}
          settings={{
            min,
            max,
            step,
            suffix: settings?.suffix,
            round: settings?.round,
          }}
        />
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        className="elll-slider"
        value={(currentValue === mixed ? 0 : currentValue || 0) * scale}
        onChange={(value) => {
          onChange?.((value as number) / scale);
        }}
      />
    </div>
  );
}
