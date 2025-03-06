import { BaseControlType, lengthUnits } from "@repo/components";
import { Appearance } from "@repo/elementa";
import { AppearanceControlEntry } from "../../../../../../../components/controls/infrastructure/appearance/appearance";

export function ElementTransformAppearanceSheet({
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
      <AppearanceControlEntry
        styles={styles}
        name="Translate Y"
        property="translate-y"
        control={BaseControlType.Dimension}
        controlSettings={{
          units: [...lengthUnits],
          defaultUnit: "px",
        }}
      />
      <AppearanceControlEntry
        styles={styles}
        name="Scale"
        properties={["scale-x", "scale-y"]}
        control={BaseControlType.Number}
        controlSettings={{
          min: 0,
          step: 0.01,
        }}
      />
      <AppearanceControlEntry
        styles={styles}
        name="Rotate"
        property="rotate-z"
        control={BaseControlType.Dimension}
        controlSettings={{
          units: [
            {
              unit: "deg",
              label: "Degrees",
            },
          ],
          defaultUnit: "deg",
        }}
      />
    </>
  );
}
