import { ColorData } from "@elllphnt/elll-element";
import { HexAlphaColorPicker, HexColorInput } from "react-colorful";
import { Observable } from "rxjs";
import tinycolor from "tinycolor2";
import { useControlValue } from "../../_hooks/value";
import { FullControlEntry } from "../../entries/full_control_entry";
import { colorDataFromRgb, colorDataToRgb } from "./_utils";

export function ColorControlMenu({
  value,
  value$,
  onChange,
}: {
  value?: ColorData;
  value$?: Observable<ColorData>;
  onChange?: (color: ColorData) => void;
}) {
  let currentValue = useControlValue(value$, value);
  const color = tinycolor(
    currentValue ? colorDataToRgb(currentValue) : undefined,
  );

  return (
    <div className="color_picker el-space-y-4 el-p-3">
      <HexAlphaColorPicker
        color={color.toHex8String()}
        onChange={(value) => {
          onChange?.(colorDataFromRgb(tinycolor(value).toRgb()));
        }}
      />

      <FullControlEntry label="Hex">
        <HexColorInput
          className="el-h-7 el-px-2 el-border el-rounded-md"
          style={{
            width: "100%",
            outline: "none",
            textTransform: "uppercase",
          }}
          color={color.toHex8String()}
          onChange={(value) => {
            onChange?.(colorDataFromRgb(tinycolor(value).toRgb()));
          }}
          prefixed
          alpha
        />
      </FullControlEntry>
    </div>
  );
}
