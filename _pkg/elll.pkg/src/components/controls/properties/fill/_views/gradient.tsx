import {
  ColorControlMenu,
  FullControlEntry,
  SelectControl,
  SpinnerControl,
} from "@repo/components";
import { ColorData, GradientData } from "@elllphnt/elll-element";
import { useState } from "react";
import { default as tinycolor, default as tnc } from "tinycolor2";

function StopHandle({
  color,
  position,
  onChange,
  active,
  onClick,
  onDoubleClick,
}: {
  color: ColorData;
  position: number;
  onChange: (position: number) => void;
  active?: boolean;
  onClick?: () => void;
  onDoubleClick?: () => void;
}) {
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    onClick?.();

    const parent = e.currentTarget.parentElement;
    if (!parent) return;

    const parentRect = parent.getBoundingClientRect();
    const rect = e.currentTarget.getBoundingClientRect();

    const onMouseMove = (e: MouseEvent) => {
      const x = e.clientX - parentRect.left + rect.width / 2;
      const position = Math.max(0, Math.min(1, x / parentRect.width));
      onChange(position);
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
        background: tinycolor(color).toHex8String(),
        position: "absolute",
        top: "50%",
        left: `${position * 100}%`,
        transform: "translate(-50%, -50%)",
        borderWidth: active ? 2 : 1,
        borderColor: active ? "white" : "#fff8",
        boxShadow: "0 0 0 2px rgba(0, 0, 0, 0.1)",
      }}
      onMouseDown={handleMouseDown}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={onDoubleClick}
    />
  );
}

function GradientBar({
  stops,
  onChange,
  activeStopIndex,
  onStopClick,
  onStopDoubleClick,
}: {
  stops: Array<{ color: ColorData; position: number }>;
  onChange: (stops: Array<{ color: ColorData; position: number }>) => void;
  activeStopIndex?: number;
  onStopClick?: (index: number) => void;
  onStopDoubleClick?: (index: number) => void;
}) {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();

    const x = e.clientX - rect.x;
    const position = Math.max(0, Math.min(1, x / rect.width));

    let previousStopIndex = -1;
    stops.forEach((stop, index) => {
      if (stop.position > position) {
        return;
      }
      previousStopIndex = index;
    });
    const nextStopIndex = previousStopIndex + 1;

    const previousStop = stops[previousStopIndex] ??
      stops[0] ?? { color: "#000000", position: 0 };
    const nextStop = stops[nextStopIndex] ??
      stops[stops.length - 1] ?? { color: "#ffffff", position: 1 };

    const color = tnc
      .mix(
        previousStop.color,
        nextStop.color,
        (position - previousStop.position) /
          (nextStop.position - previousStop.position),
      )
      .toRgb();

    onChange([
      ...stops,
      {
        color,
        position,
      },
    ]);

    onStopClick?.(stops.length);
  };

  return (
    <div
      style={{
        position: "relative",
        height: 24,
        borderRadius: 6,
        background: `linear-gradient(to right, ${stops.map((stop) => `${stop.color} ${stop.position * 100}%`).join(", ")})`,
      }}
      onMouseDown={handleClick}
    >
      {stops.map((stop, index) => (
        <StopHandle
          key={index}
          color={stop.color}
          position={stop.position}
          onChange={(position) => {
            onChange(
              stops.map((s, i) => (i === index ? { ...s, position } : s)),
            );
          }}
          active={index === activeStopIndex}
          onClick={() => onStopClick?.(index)}
          onDoubleClick={() => onStopDoubleClick?.(index)}
        />
      ))}
    </div>
  );
}

const defaultGradient: GradientData = {
  variant: "linear",
  stops: [
    {
      color: {
        r: 0,
        g: 0,
        b: 0,
        a: 1,
      },
      position: 0,
    },
    {
      color: {
        r: 255,
        g: 255,
        b: 255,
        a: 1,
      },
      position: 1,
    },
  ],
};

export function GradientMenu({
  value: providedValue,
  onChange: onChangeRaw,
}: {
  value?: GradientData;
  onChange?: (gradient: GradientData) => void;
}) {
  const value = providedValue ?? defaultGradient;
  const [activeStopIndex, setActiveStopIndex] = useState<number>(0);

  const activeStop = value.stops?.[activeStopIndex];

  const onChange = (value: GradientData) => {
    // ensure stops are sorted
    onChangeRaw?.({
      ...value,
      stops: value.stops?.sort((a, b) => a.position - b.position),
    });
  };

  return (
    <div className="el-space-y-2">
      <FullControlEntry label="Type">
        <SelectControl
          value={value.variant}
          onChange={(variant) => {
            onChange?.({
              ...value,
              variant: variant as GradientData["variant"],
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

      {value.variant === "radial" && (
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
      />

      <hr />
    </div>
  );
}
