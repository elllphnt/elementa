import { mixed, MixedType, SwitchControl } from "@repo/components";
import { FillData, GradientData } from "@repo/elementa";
import { useObservable } from "@repo/utils";
import { useCallback } from "react";
import { Observable } from "rxjs";

export function FillMenu({
  value,
  value$,
  onChange,
}: {
  value?: FillData | MixedType | undefined;
  value$?: Observable<FillData | MixedType | undefined>;
  onChange?: (expression: FillData) => void;
}) {
  const currentValue = useObservable(value$, value);

  let type: "color" | "gradient" | "image";
  let color: string = "#fafafa";
  let gradient: GradientData = {
    variant: "linear",
    stops: [
      { color: "#000000", position: 0 },
      { color: "#ffffff", position: 1 },
    ],
  };
  let image: string = "https://via.placeholder.com/150";

  if (currentValue === mixed) {
    type = "color";
  } else if (typeof currentValue === "string") {
    type = "color";
    color = currentValue;
  } else {
    type = currentValue?.type ?? "color";
    color = currentValue?.color ?? color;
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
        <InlineColorControl
          value={color}
          onChange={(color) => {
            handleChange("color", color);
          }}
        />
      );
      break;
    case "gradient":
      picker = (
        <GradientGradient
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
    <div className="el-space-y-2">
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
