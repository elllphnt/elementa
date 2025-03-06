import { mixed, MixedType, useControlValue } from "@repo/components";
import { FillData, isVarRef } from "@repo/elementa";
import { Observable } from "rxjs";
import tinycolor from "tinycolor2";

export function FillLabel({
  value,
  value$,
}: {
  value$?: Observable<FillData | MixedType | undefined>;
  value?: FillData | MixedType | undefined;
}) {
  const fill = useControlValue(value$, value);

  if (fill === undefined) {
    return <span className="el-text-fg-400">unset</span>;
  } else if (fill === mixed) {
    return "mixed";
  } else if ("r" in fill) {
    return tinycolor(fill).toRgbString();
  } else {
    switch (fill?.type) {
      case "color":
        return fill.color ? (
          isVarRef(fill.color) ? (
            "Variable"
          ) : (
            tinycolor(fill.color).toRgbString()
          )
        ) : (
          <span className="el-text-fg-400">unset</span>
        );
      case "gradient":
        return "Gradient";
      case "image":
        return "Image";
      default:
        return "mixed";
    }
  }
}
