import _ from "lodash";
import { ReactNode, useState } from "react";
import { elllIcons16 } from "~/src/icons/elll_icons";
import Icon from "~/src/icons/icon";

export type RawSpinnerControlProps = {
  value?: string | number;
  isMixed?: boolean;
  isUndefined?: boolean;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  suffix?: ReactNode;
  increment?: () => void;
  decrement?: () => void;
  startLongIncrement?: () => void;
  startLongDecrement?: () => void;
  step?: number;
  min?: number;
  max?: number;
  showIncrementors?: boolean;
};

export function RawSpinnerControl({
  value,
  isMixed,
  isUndefined,
  onChange,
  onFocus,
  onBlur,
  suffix,
  increment,
  decrement,
  startLongIncrement,
  startLongDecrement,
  step,
  min,
  max,
  showIncrementors,
}: RawSpinnerControlProps) {
  const [mode, setMode] = useState<"edit" | "view">("view");

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();

    let initialValue = Number(value);
    if (Number.isNaN(initialValue)) {
      initialValue = 0;
    }

    let delta = 0;
    let initialized = false;
    const target = e.currentTarget as HTMLElement;
    let eventCount = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!e.movementX && !e.movementY) {
        return;
      }

      if (!initialized) {
        initialized = true;
        onFocus?.();
        target.requestPointerLock();
        return;
      }

      // prevent initial jump
      eventCount++;
      if (eventCount < 3 && Math.abs(e.movementX) > 10) {
        return;
      }

      let _step = step ?? 1;
      delta += e.movementX;
      const newValue = initialValue + delta * _step;
      const clamped = _.clamp(newValue, min ?? -Infinity, max ?? Infinity);
      onChange?.(clamped.toString());
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousemove", handleMouseMove);
      if (initialized) {
        initialized = false;
        document.exitPointerLock();
        onBlur?.();
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <>
      <div
        className="el-h-full el-w-full"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
        }}
      >
        <input
          className="el-w-full"
          style={{
            width: "100%",
            outline: "none",
            cursor: mode === "view" ? "ew-resize" : "text",
          }}
          type="number"
          value={value}
          placeholder={isMixed ? "mixed" : isUndefined ? "unset" : ""}
          onChange={(e) => {
            onChange?.(e.target.value);
          }}
          onFocus={onFocus}
          onBlur={(e) => {
            onBlur?.();
            setMode("view");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.currentTarget.blur();
            }
          }}
          step={step}
          min={min}
          max={max}
          onMouseDown={mode === "view" ? handleResizeStart : undefined}
          onClick={(e) => {
            if (mode === "view") setMode("edit");
            e.currentTarget.focus();
          }}
        />

        {suffix ? (
          <div
            className="el-text-fg-400"
            style={{
              flexShrink: 0,
            }}
          >
            {suffix}
          </div>
        ) : null}

        {showIncrementors ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Icon
              className="el-opacity-50 hover:el-opacity-100 el-cursor-pointer"
              name={elllIcons16.minus}
              onClick={decrement}
              onMouseDown={startLongDecrement}
            />
            <Icon
              className="el-opacity-50 hover:el-opacity-100 el-cursor-pointer"
              name={elllIcons16.plus}
              onClick={increment}
              onMouseDown={startLongIncrement}
            />
          </div>
        ) : (
          <></>
        )}
      </div>
    </>
  );
}
