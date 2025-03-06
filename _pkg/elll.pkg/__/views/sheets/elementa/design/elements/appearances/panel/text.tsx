import { BaseControlType } from "@repo/components";
import { AppearanceControlEntry } from "../../../../../../../components/controls/infrastructure/appearance/appearance";

export function ElementTextAppearanceSheet({
  appearances,
}: {
  appearances: Appearance[];
}): JSX.Element {
  const styles = appearances.map((a) => a.style);

  return (
    <>
      <AppearanceControlEntry
        styles={styles}
        name="Color"
        property="color"
        control={BaseControlType.Color}
      />
      <AppearanceControlEntry
        styles={styles}
        name="Decoration"
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
