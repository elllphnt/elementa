import { ColorData } from "@elllphnt/elll-element";
import { HexAlphaColorPicker, HexColorInput } from "react-colorful";
import { Observable } from "rxjs";
import tinycolor from "tinycolor2";
import { useControlValue } from "../../_hooks/value";
import { FullControlEntry } from "../../entries/full_control_entry";

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
  const color = tinycolor(currentValue);

  return (
    <div className="color_picker el-space-y-4">
      <HexAlphaColorPicker
        color={color.toHex8String()}
        onChange={(value) => {
          onChange?.(tinycolor(value).toRgb());
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
            onChange?.(tinycolor(value).toRgb());
          }}
          prefixed
          alpha
        />
      </FullControlEntry>
    </div>
  );
}
