import { BaseControlType } from "@repo/components";
import { Appearance } from "@repo/elementa";
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
        styles={styles}
        name="Opacity"
        property="opacity"
        control={BaseControlType.Number}
        controlSettings={{
          min: 0,
          max: 1,
        }}
      />
      <AppearanceControlEntry
        styles={styles}
        name="Background Color"
        property="background"
        control={EditorOwnControlType.Fill}
      />
    </>
  );
}
