import { Style } from "@repo/elementa-models";
import { StylePropertyGroupConfig } from "~/src/modules/elementa/style/properties";
import { StylePropertyGroupControlEntry } from "./group_control_entry";

export function StylePropertiesControlSheet({
  styles,
  properties,
}: {
  styles: Style[];
  properties: StylePropertyGroupConfig[];
}): JSX.Element {
  return (
    <>
      {properties.map((entry, index) => (
        <StylePropertyGroupControlEntry
          key={index}
          index={index}
          styles={styles}
          group={entry}
        />
      ))}
    </>
  );
}
