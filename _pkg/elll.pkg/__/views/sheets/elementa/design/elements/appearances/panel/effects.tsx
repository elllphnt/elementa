import { BaseControlType, lengthUnits } from "@repo/components";
import { AppearanceControlEntry } from "../../../../../../../components/controls/infrastructure/appearance/appearance";

export function ElementEffectsAppearanceSheet({
  appearances,
}: {
  appearances: Appearance[];
}): JSX.Element {
  const styles = appearances.map((a) => a.style);

  return (
    <>
      <AppearanceControlEntry
        styles={styles}
        name="Translate X"
        property="translate-x"
        control={BaseControlType.Dimension}
        controlSettings={{
          units: [...lengthUnits],
          defaultUnit: "px",
        }}
      />
    </>
  );
}
