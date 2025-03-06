import {
  BaseControlType,
  ControlEntryVariant,
  elllIcons16,
  Icon,
  RowControlContainer,
} from "@repo/components";
import { Style, StyleData } from "@repo/elementa";
import { InstanceStyleControlEntry } from "../../infrastructure/style/instance_style";

export function PaddingControlMenu({
  styles,
}: {
  styles: Style<StyleData>[];
}): JSX.Element {
  return (
    <>
      <RowControlContainer>
        <InstanceStyleControlEntry
          variant={ControlEntryVariant.Mini}
          icon={<Icon name={elllIcons16.top} />}
          property="padding-top"
          name="Top Padding"
          styles={styles}
          control={BaseControlType.Length}
          controlSettings={{
            min: 0,
          }}
        />
        <InstanceStyleControlEntry
          variant={ControlEntryVariant.Mini}
          icon={<Icon name={elllIcons16.right} />}
          property="padding-right"
          name="Right Padding"
          styles={styles}
          control={BaseControlType.Length}
          controlSettings={{
            min: 0,
          }}
        />
      </RowControlContainer>

      <RowControlContainer>
        <InstanceStyleControlEntry
          variant={ControlEntryVariant.Mini}
          icon={<Icon name={elllIcons16.left} />}
          property="padding-left"
          name="Left Padding"
          styles={styles}
          control={BaseControlType.Length}
          controlSettings={{
            min: 0,
          }}
        />
        <InstanceStyleControlEntry
          variant={ControlEntryVariant.Mini}
          icon={<Icon name={elllIcons16.bottom} />}
          property="padding-bottom"
          name="Bottom Padding"
          styles={styles}
          control={BaseControlType.Length}
          controlSettings={{
            min: 0,
          }}
        />
      </RowControlContainer>
    </>
  );
}
