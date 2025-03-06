import { PropsWithChildren, useContext } from "react";
import { useObservable } from "@repo/utils";
import { IconData } from "./_types";
import { IconElement } from "./elll_icons";
import { IconStoreContext } from "./store/context";

const DEFAULT_ICON: IconData = {
  name: "default",
  viewBox: "0 0 24 24",
  stroke: true,
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  data: "M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z",
};

export type IconProps = PropsWithChildren<
  {
    color?: string;
    name?: string;
  } & JSX.IntrinsicElements["svg"]
>;

export function Icon({ name, color, ...svgProps }: IconProps) {
  const store = useContext(IconStoreContext);
  const icon = useObservable(store.icon$(name ?? ""), store.icon(name ?? ""));

  const _svgProps = {
    ...svgProps,
    style: {
      ...svgProps.style,
      fill: color,
    },
  };

  if (!icon) {
    return <IconElement data={DEFAULT_ICON} svgProps={_svgProps} />;
  }
  return <IconElement data={icon} svgProps={_svgProps} />;
}

export default Icon;
