import {
  AngleData,
  ColorData,
  GradientBackgroundLayerData,
  isVarRef,
  LinearGradientData,
  LinearGradientStopData,
  linearGradientToCss,
  PercentData,
  stringifyPercent,
  Variable,
} from "@elllphnt/elll-element";
import {
  colorDataFromRgb,
  colorDataToRgb,
  FullControlEntry,
  SelectControl,
} from "@repo/components";
import { useState } from "react";
import { HexAlphaColorPicker, HexColorInput } from "react-colorful";
import tinycolor from "tinycolor2";
import { elllControlTypes } from "~/src/components/ui/controls/_types";
import { DynamicControlEntry } from "~/src/components/ui/controls/dynamic";
import { DynamicType } from "../dynamics/_dynamics";

const defaultColor: ColorData = {
  model: "rgb",
  value: [0, 0, 0],
  alpha: 1,
};

function useResolvedVariableValue<T>(value: Variable<T> | T): T | undefined {
  if (isVarRef(value)) {
    return undefined;
  } else {
    return value;
  }
}
function resolveVariableValue<T>(value: Variable<T> | T): T | undefined {
  if (isVarRef(value)) {
    return undefined;
  } else {
    return value;
  }
}

function StopHandle({
  color,
  position,
  onPositionChange,
  active,
  onSelect,
  onRemove,
}: {
  color: Variable<ColorData>;
  position: PercentData;
  onPositionChange: (position: PercentData) => void;
  active?: boolean;
  onSelect?: () => void;
  onRemove?: () => void;
}) {
  const resolvedColor = useResolvedVariableValue(color) || {
    model: "rgb",
    value: [0, 0, 0],
    alpha: 1,
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    onSelect?.();

    const parent = e.currentTarget.parentElement;
    if (!parent) return;

    const parentRect = parent.getBoundingClientRect();
    const rect = e.currentTarget.getBoundingClientRect();

    const onMouseMove = (e: MouseEvent) => {
      const x = e.clientX - parentRect.left + rect.width / 2;
      const position = Math.max(0, Math.min(1, x / parentRect.width));
      onPositionChange({
        value: position * 100,
        unit: "%",
      });
    };
    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  return (
    <div
      style={{
        height: 20,
        width: 20,
        borderRadius: "50%",
        background: tinycolor(colorDataToRgb(resolvedColor)).toHex8String(),
        position: "absolute",
        top: "50%",
        left: stringifyPercent(position),
        transform: "translate(-50%, -50%)",
        borderWidth: active ? 2 : 1,
        borderColor: active ? "white" : "#fff8",
        boxShadow: "0 0 0 2px rgba(0, 0, 0, 0.1)",
      }}
      onMouseDown={handleMouseDown}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onRemove?.();
      }}
    />
  );
}

function GradientBar({
  stops = [],
  onStopsChange,
  activeStop,
  onActiveStopChange,
}: {
  stops?: LinearGradientStopData[];
  activeStop?: number;
  onStopsChange?: (stops: LinearGradientStopData[]) => void;
  onActiveStopChange?: (index: number) => void;
}) {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();

    const x = e.clientX - rect.x;
    const position = Math.max(0, Math.min(1, x / rect.width)) * 100;

    let previousStopIndex = -1;
    stops.forEach((stop, index) => {
      if (stop.position.value > position) {
        return;
      }
      previousStopIndex = index;
    });
    const nextStopIndex = previousStopIndex + 1;

    const previousStop: LinearGradientStopData = stops[previousStopIndex] ??
      stops[0] ?? {
        color: defaultColor,
        position: {
          value: 0,
          unit: "%",
        },
      };
    const nextStop: LinearGradientStopData = stops[nextStopIndex] ??
      stops[stops.length - 1] ?? {
        color: defaultColor,
        position: {
          value: 100,
          unit: "%",
        },
      };

    const color = tinycolor
      .mix(
        colorDataToRgb(
          resolveVariableValue(previousStop.color) ?? defaultColor,
        ),
        colorDataToRgb(resolveVariableValue(nextStop.color) ?? defaultColor),
        (position - previousStop.position.value) /
          (nextStop.position.value - previousStop.position.value),
      )
      .toRgb();

    const newStop = [...stops];
    newStop.splice(nextStopIndex, 0, {
      color: colorDataFromRgb(color),
      position: {
        value: position,
        unit: "%",
      },
    });

    onStopsChange?.(newStop);
    onActiveStopChange?.(nextStopIndex);
  };

  const gradient = linearGradientToCss({
    type: "linear",
    angle: { value: 90, unit: "deg" },
    stops,
  });

  return (
    <div
      style={{
        position: "relative",
        height: 24,
        borderRadius: 6,
        background: gradient,
      }}
      onMouseDown={handleClick}
    >
      {stops.map((stop, index) => (
        <StopHandle
          key={index}
          color={stop.color}
          position={stop.position}
          onPositionChange={(position) => {
            onStopsChange?.(
              stops.map((s, i) => (i === index ? { ...s, position } : s)),
            );
          }}
          active={index === activeStop}
          onSelect={() => onActiveStopChange?.(index)}
          onRemove={() => {
            onStopsChange?.(stops.filter((_, i) => i !== index));
          }}
        />
      ))}
    </div>
  );
}

function ColorControl({
  value,
  onChange,
}: {
  value?: Variable<ColorData>;
  onChange?: (color: Variable<ColorData>) => void;
}) {
  const resolvedValue = useResolvedVariableValue(value) || {
    model: "rgb",
    value: [0, 0, 0],
    alpha: 1,
  };
  const color = tinycolor(colorDataToRgb(resolvedValue)).toHex8String();
  const onChangeColor = (color: string) => {
    const rgb = tinycolor(color).toRgb();
    onChange?.(colorDataFromRgb(rgb));
  };

  return (
    <div className="color_picker el-space-y-4">
      <HexAlphaColorPicker color={color} onChange={onChangeColor} />

      <FullControlEntry label="Hex">
        <HexColorInput
          className="el-h-7 el-px-2 el-border el-rounded-md"
          style={{
            width: "100%",
            outline: "none",
            textTransform: "uppercase",
          }}
          prefixed
          alpha
          color={color}
          onChange={onChangeColor}
        />
      </FullControlEntry>
    </div>
  );
}

function GradientStopsControl({
  value,
  onChange,
}: {
  value?: LinearGradientStopData[];
  onChange?: (value: LinearGradientStopData[]) => void;
}) {
  const [activeStopIndex, setActiveStopIndex] = useState<number>(0);
  const activeStop = value?.[activeStopIndex];
  const activeStopColor = activeStop?.color;

  const setActiveStopColor = (color: Variable<ColorData>) => {
    const stops =
      value?.map((stop, index) =>
        index === activeStopIndex ? { ...stop, color } : stop,
      ) ?? [];
    onChange?.(stops);
  };

  return (
    <>
      <GradientBar
        stops={value}
        onStopsChange={onChange}
        activeStop={activeStopIndex}
        onActiveStopChange={setActiveStopIndex}
      />
      <ColorControl value={activeStopColor} onChange={setActiveStopColor} />
    </>
  );
}
function LinearGradientControl({
  value,
  onChange,
}: {
  value?: LinearGradientData;
  onChange?: (value: LinearGradientData) => void;
}) {
  return (
    <>
      <div className="el-pl-2">
        <DynamicControlEntry
          label="Angle"
          value={value?.angle}
          onChange={(angle) => {
            onChange?.({
              ...value,
              angle: angle as Variable<AngleData>,
            });
          }}
          dynamics={{
            [DynamicType.StyleVariable]: {},
          }}
          control={elllControlTypes.Angle}
          onRemove={() => {
            onChange?.({
              ...value,
              angle: undefined,
            });
          }}
        />
      </div>
      <GradientStopsControl
        value={value?.stops}
        onChange={(stops) => {
          onChange?.({
            ...value,
            stops,
          });
        }}
      />
    </>
  );
}
function RadialGradientControl() {
  return (
    <>
      {/* {value.variant === "radial" && (
        <>
          <FullControlEntry label="Center X">
            <SpinnerControl
              value={value.position?.x ? value.position.x * 100 : 50}
              onChange={(x) => {
                onChange?.({
                  ...value,
                  position: {
                    y: 0.5,
                    ...value.position,
                    x: x ? x / 100 : 0.5,
                  },
                });
              }}
              settings={{
                suffix: "%",
              }}
            />
          </FullControlEntry>
          <FullControlEntry label="Center Y">
            <SpinnerControl
              value={value.position?.y ? value.position.y * 100 : 50}
              onChange={(y) => {
                onChange?.({
                  ...value,
                  position: {
                    x: 0.5,
                    ...value.position,
                    y: y ? y / 100 : 0.5,
                  },
                });
              }}
              settings={{
                suffix: "%",
              }}
            />
          </FullControlEntry>
        </>
      )}

      {value.variant === "linear" && (
        <FullControlEntry label="Angle">
          <SpinnerControl
            value={value.angle ?? 0}
            onChange={(angle) => {
              onChange?.({
                ...value,
                angle,
              });
            }}
            settings={{
              suffix: "deg",
            }}
          />
        </FullControlEntry>
      )}

      <GradientBar
        stops={(value.stops as any) ?? []} // to fix
        onChange={(stops) => {
          onChange?.({
            ...value,
            stops,
          });
        }}
        activeStopIndex={activeStopIndex}
        onStopClick={(index) => setActiveStopIndex(index)}
        onStopDoubleClick={(index) => {
          const stops = value.stops ?? [];
          onChange?.({
            ...value,
            stops: stops.filter((_, i) => i !== index),
          });
        }}
      />
      <ColorControlMenu
        value={activeStop?.color as any}
        onChange={(color) => {
          onChange?.({
            ...value,
            stops: value.stops?.map((stop, index) =>
              index === activeStopIndex ? { ...stop, color } : stop,
            ),
          });
        }}
      /> */}
    </>
  );
}
function ConicGradientControl() {
  return (
    <>
      {/* {value.variant === "radial" && (
        <>
          <FullControlEntry label="Center X">
            <SpinnerControl
              value={value.position?.x ? value.position.x * 100 : 50}
              onChange={(x) => {
                onChange?.({
                  ...value,
                  position: {
                    y: 0.5,
                    ...value.position,
                    x: x ? x / 100 : 0.5,
                  },
                });
              }}
              settings={{
                suffix: "%",
              }}
            />
          </FullControlEntry>
          <FullControlEntry label="Center Y">
            <SpinnerControl
              value={value.position?.y ? value.position.y * 100 : 50}
              onChange={(y) => {
                onChange?.({
                  ...value,
                  position: {
                    x: 0.5,
                    ...value.position,
                    y: y ? y / 100 : 0.5,
                  },
                });
              }}
              settings={{
                suffix: "%",
              }}
            />
          </FullControlEntry>
        </>
      )}

      {value.variant === "linear" && (
        <FullControlEntry label="Angle">
          <SpinnerControl
            value={value.angle ?? 0}
            onChange={(angle) => {
              onChange?.({
                ...value,
                angle,
              });
            }}
            settings={{
              suffix: "deg",
            }}
          />
        </FullControlEntry>
      )}

      <GradientBar
        stops={(value.stops as any) ?? []} // to fix
        onChange={(stops) => {
          onChange?.({
            ...value,
            stops,
          });
        }}
        activeStopIndex={activeStopIndex}
        onStopClick={(index) => setActiveStopIndex(index)}
        onStopDoubleClick={(index) => {
          const stops = value.stops ?? [];
          onChange?.({
            ...value,
            stops: stops.filter((_, i) => i !== index),
          });
        }}
      />
      <ColorControlMenu
        value={activeStop?.color as any}
        onChange={(color) => {
          onChange?.({
            ...value,
            stops: value.stops?.map((stop, index) =>
              index === activeStopIndex ? { ...stop, color } : stop,
            ),
          });
        }}
      /> */}
    </>
  );
}

export function GradientBackgroundLayerControl({
  value,
  onChange,
}: {
  value: GradientBackgroundLayerData;
  onChange: (value: GradientBackgroundLayerData) => void;
}) {
  let type = value.gradient?.type;
  if (!type || !["linear", "radial"].includes(type)) {
    type = "linear";
  }
  let control = <></>;

  switch (type) {
    case "linear":
      control = (
        <LinearGradientControl
          value={value.gradient as LinearGradientData}
          onChange={(gradient) => {
            onChange({
              ...value,
              gradient,
            });
          }}
        />
      );
      break;
    case "radial":
      control = <RadialGradientControl />;
      break;
  }

  return (
    <div className="el-space-y-2 el-px-3 el-pb-3 el-pt-1">
      <div className="el-pl-2">
        <FullControlEntry label="Type">
          <SelectControl
            value={type}
            onChange={(type) => {
              onChange({
                ...value,
                gradient: {
                  ...value?.gradient,
                  type,
                } as any,
              });
            }}
            settings={{
              options: [
                { value: "linear", label: "Linear" },
                { value: "radial", label: "Radial" },
              ],
            }}
          />
        </FullControlEntry>
      </div>

      {control}
    </div>
  );
}
