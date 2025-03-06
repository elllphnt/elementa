import {
  ColorControlMenu,
  mixed,
  MixedType,
  SwitchControl,
  useControlValue,
} from "@repo/components";
import { ColorData, FillData, GradientData, isVarRef } from "@repo/elementa";
import { useCallback } from "react";
import { Observable } from "rxjs";
import { GradientMenu } from "./gradient";
import { ImageControl } from "./image";

export function FillMenu({
  value,
  value$,
  onChange,
}: {
  value?: FillData | MixedType | undefined;
  value$?: Observable<FillData | MixedType | undefined>;
  onChange?: (expression: FillData) => void;
}) {
  const currentValue = useControlValue(value$, value);

  let type: "color" | "gradient" | "image";
  let color: ColorData = {
    r: 0,
    g: 0,
    b: 0,
    a: 1,
  };
  let gradient: GradientData = {
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
          r: 1,
          g: 1,
          b: 1,
          a: 1,
        },
        position: 1,
      },
    ],
  };
  let image: string = "https://via.placeholder.com/150";

  if (currentValue === mixed || currentValue === undefined) {
    type = "color";
  } else if ("r" in currentValue) {
    type = "color";
    color = currentValue;
  } else {
    type = currentValue?.type ?? "color";
    color = isVarRef(currentValue.color)
      ? {
          r: 0,
          g: 0,
          b: 0,
          a: 1,
        }
      : (currentValue.color ?? color);
    gradient = currentValue?.gradient ?? gradient;
    image = currentValue?.image ?? image;
  }

  let picker = <></>;

  const handleChange = useCallback(
    (type: "color" | "gradient" | "image", value: any) => {
      if (typeof currentValue === "object") {
        onChange?.({
          ...currentValue,
          type,
          [type]: value,
        });
      } else {
        onChange?.({
          type,
          [type]: value,
        });
      }
    },
    [currentValue],
  );

  switch (type) {
    case "color":
      picker = (
        <ColorControlMenu
          key="color"
          value={color}
          onChange={(color) => {
            handleChange("color", color);
          }}
        />
      );
      break;
    case "gradient":
      picker = (
        <GradientMenu
          key="gradient"
          value={gradient}
          onChange={(value) => {
            handleChange("gradient", value);
          }}
        />
      );
      break;
    case "image":
      picker = (
        <ImageControl
          value={image}
          onChange={(value) => {
            handleChange("image", value);
          }}
        />
      );
      break;
  }

  return (
    <div
      className="el-space-y-2"
      style={{
        width: 240,
      }}
    >
      <SwitchControl
        value={type}
        onChange={(value) => {
          switch (value) {
            case "color":
              handleChange("color", color);
              break;
            case "gradient":
              handleChange("gradient", gradient);
              break;
            case "image":
              handleChange("image", image);
              break;
          }
        }}
        settings={{
          options: [
            { value: "color", label: "Color" },
            { value: "gradient", label: "Gradient" },
            { value: "image", label: "Image" },
          ],
        }}
      />
      <div>{picker}</div>
    </div>
  );
}
