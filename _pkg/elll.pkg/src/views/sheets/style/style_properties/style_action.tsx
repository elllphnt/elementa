import { Icon, useAction } from "@repo/components";
import { Style } from "@repo/elementa-models";
import { StylePropertyConfig } from "~/src/modules/elementa/style/properties";
import { initializeProperties } from "./utils";

export function StyleAction({
  index,
  styles,
  properties,
  name,
  icon,
  variant,
}: {
  index?: number;
  styles: Style[];
  properties: StylePropertyConfig[];
  name: string;
  icon: string;
  variant?: "single" | "multiple";
}) {
  useAction(
    {
      index,
      title: name,
      icon: icon,
      handler:
        variant === "single"
          ? () => initializeProperties(properties, styles)
          : undefined,
      options:
        variant === "multiple"
          ? properties.map((property) => ({
              label: property.displayName ?? property.name,
              icon: <Icon name={property.icon} />,
              onClick: () => {
                initializeProperties([property], styles);
              },
            }))
          : undefined,
    },
    [index, styles.map((style) => style.key).join(","), properties.join(",")],
  );

  return <></>;
}
