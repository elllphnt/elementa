import {
  elllIcons16,
  Icon,
  mixed,
  MixedType,
  useControlValue,
} from "@repo/components";
import { FillData } from "@repo/elementa";
import { Observable } from "rxjs";
import { ColorIcon } from "./color_icon";
import { GradientIcon } from "./gradient_icon";

export function FillIcon({
  value,
  value$,
}: {
  value?: FillData | MixedType | undefined;
  value$?: Observable<FillData | MixedType | undefined>;
}) {
  const fill = useControlValue(value$, value);

  if (fill === undefined) {
    return <Icon name={elllIcons16.container} />;
  } else if (fill === mixed) {
    return <Icon name={elllIcons16.containerFilled} />;
  } else if ("r" in fill) {
    return <ColorIcon color={fill} />;
  } else {
    switch (fill?.type) {
      case "color":
        return <ColorIcon color={fill.color as any} />;
      case "gradient":
        return (
          <GradientIcon
            gradient={fill.gradient ?? { variant: "linear", stops: [] }}
          />
        );
      case "image":
        return <Icon name={elllIcons16.image} />;
      default:
        return <Icon name={elllIcons16.containerFilled} />;
    }
  }
}
