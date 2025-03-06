import { BaseControlType } from "@repo/components";
import { EditorOwnControlType } from "../../../../../../../components/controls/control_map";
import { AppearanceControlEntry } from "../../../../../../../components/controls/infrastructure/appearance/appearance";

export function ElementStyleAppearanceSheet({
  appearances,
}: {
  appearances: Appearance[];
}): JSX.Element {
  const styles = appearances.map((a) => a.style);

  return (
    <>
      <AppearanceControlEntry
        property="opacity"
        name="Opacity"
        styles={styles}
        control={BaseControlType.Slider}
        controlSettings={{
          min: 0,
          max: 1,
          step: 0.05,
          suffix: "%",
          scale: 100,
        }}
      />
      <AppearanceControlEntry
        styles={styles}
        name="Background Color"
        property="background"
        control={EditorOwnControlType.Fill}
      />
      <AppearanceControlEntry
        styles={styles}
        name="Text Color"
        property="color"
        control={BaseControlType.Color}
      />
      <AppearanceControlEntry
        styles={styles}
        name="Text Decoration"
        property="text-decoration"
        control={BaseControlType.Select}
        controlSettings={{
          options: [
            { value: "none", label: "None" },
            { value: "underline", label: "Underline" },
            { value: "overline", label: "Overline" },
            { value: "line-through", label: "Line Through" },
          ],
        }}
      />
    </>
  );
}
