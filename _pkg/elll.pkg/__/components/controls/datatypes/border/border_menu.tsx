import { BaseControlType, ColumnControlContainer } from "@repo/components";
import { Style, StyleData } from "@repo/elementa";
import { InstanceStyleControlEntry } from "../../infrastructure/style/instance_style";

export function BorderMenu({
  styles,
  indent,
}: {
  styles: Style<StyleData>[];
  indent?: boolean;
}) {
  const content = (
    <>
      <InstanceStyleControlEntry
        styles={styles}
        properties={[
          "border-bottom-style",
          "border-top-style",
          "border-left-style",
          "border-right-style",
        ]}
        name="Style"
        control={BaseControlType.Select}
        controlSettings={{
          options: [
            { label: "Solid", value: "solid" },
            { label: "Dotted", value: "dotted" },
            { label: "Dashed", value: "dashed" },
          ],
        }}
      />

      <InstanceStyleControlEntry
        styles={styles}
        properties={[
          "border-bottom-color",
          "border-top-color",
          "border-left-color",
          "border-right-color",
        ]}
        name="Color"
        control={BaseControlType.Color}
      />

      <InstanceStyleControlEntry
        styles={styles}
        properties={[
          "border-bottom-width",
          "border-top-width",
          "border-left-width",
          "border-right-width",
        ]}
        name="Width"
        control={BaseControlType.Length}
      />
    </>
  );

  if (indent) {
    return (
      <ColumnControlContainer noPadding indent>
        {content}
      </ColumnControlContainer>
    );
  } else {
    return content;
  }
}
