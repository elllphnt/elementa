import { elllIcons16 } from "@repo/components";
import { Style } from "@repo/elementa-models";
import { elllControlTypes } from "~/src/components/ui/controls/_types";
import { StylePropertyGroupControlEntry } from "./style_properties/group_control_entry";

export function BackgroundControlSheet({ styles }: { styles: Style[] }) {
  return (
    <>
      <StylePropertyGroupControlEntry
        index={0}
        styles={styles}
        group={{
          name: "Background Color",
          icon: elllIcons16.color,
          properties: [
            {
              name: "background-color",
              displayName: "Background Color",
              icon: elllIcons16.color,
              initialValue: 1,
              control: elllControlTypes.Color,
            },
          ],
        }}
      />
    </>
  );
}
