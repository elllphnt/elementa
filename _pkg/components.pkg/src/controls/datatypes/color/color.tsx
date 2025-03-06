import { ColorData } from "@elllphnt/elll-element";
import { HexColorInput } from "react-colorful";
import tinycolor from "tinycolor2";
import { useControlMenu } from "~/src/control_menu/_hooks";
import { colorControlViews, SpinnerControl } from "../../_";
import { useControlValue } from "../../_hooks/value";
import { ControlProps } from "../../_type";

const checker = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 18 18"
    style={{
      height: "100%",
      width: "100%",
      opacity: 0.05,
    }}
  >
    <defs>
      <pattern
        id="checker-pattern"
        patternUnits="userSpaceOnUse"
        width="12"
        height="12"
      >
        <rect width="6" height="6" fill="currentColor" />
        <rect x="6" y="6" width="6" height="6" fill="currentColor" />
      </pattern>
    </defs>
    <rect width="18" height="18" fill="url(#checker-pattern)" />
  </svg>
);

export function ColorControl({
  value,
  value$,
  onChange,
  settings,
}: ControlProps<
  ColorData | undefined,
  {
    title?: string;
  }
>) {
  let currentValue = useControlValue(value$, value);
  let color =
    typeof currentValue === "object"
      ? tinycolor(currentValue)
      : tinycolor("transparent");
  const alpha = color.getAlpha() * 100;
  const { openMenu } = useControlMenu();

  return (
    <>
      <div className="el-flex el-gap-1">
        <div className="el-flex el-h-7 el-border el-rounded-md el-items-center el-gap-1">
          <button
            style={{
              height: "100%",
              aspectRatio: "1/1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={(e) => {
              openMenu({
                title: settings?.title ?? "Color",
                viewId: colorControlViews.menu.id,
                anchor: e.currentTarget,
                props: {
                  value,
                  value$,
                  onChange,
                },
              });
            }}
          >
            <div
              className="el-rounded el-outline el-outline-1 el-outline-fg/10 -el-outline-offset-1"
              style={{
                height: 18,
                width: 18,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {checker}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundColor: color.toHex8String(),
                }}
              />
            </div>
          </button>

          <div
            style={{
              flexGrow: 1,
            }}
          >
            <HexColorInput
              className="el-h-full el-w-full"
              style={{
                width: "100%",
                outline: "none",
                textTransform: "uppercase",
              }}
              color={color.toHex()}
              onChange={(value) => {
                const newColor = tinycolor(value).toRgb();
                onChange?.(newColor);
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>

        <div
          style={{
            width: 56,
            flexShrink: 0,
          }}
        >
          <SpinnerControl
            value={Math.round(alpha)}
            onChange={(value) => {
              if (typeof value === "number") {
                const newColor = tinycolor(color)
                  .setAlpha(value / 100)
                  .toRgb();
                onChange?.(newColor);
              }
            }}
            settings={{
              min: 0,
              max: 100,
              suffix: "%",
            }}
          />
        </div>
      </div>
    </>
  );
}
