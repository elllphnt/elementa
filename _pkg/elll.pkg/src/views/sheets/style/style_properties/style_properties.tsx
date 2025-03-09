import { Style } from "@repo/elementa-models";
import { StylePropertyGroupConfig } from "~/src/components/controls/styles/properties";
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
