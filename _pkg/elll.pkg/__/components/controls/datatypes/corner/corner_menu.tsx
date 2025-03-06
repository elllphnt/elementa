import {
  BaseControlType,
  ControlEntryVariant,
  elllIcons16,
  Icon,
  RowControlContainer,
} from "@repo/components";
import { Style, StyleData } from "@repo/elementa";
import { InstanceStyleControlEntry } from "../../infrastructure/style/instance_style";

export function CornerControlMenu({
  styles,
}: {
  styles: Style<StyleData>[];
}): JSX.Element {
  return (
    <>
      <RowControlContainer>
        <InstanceStyleControlEntry
          variant={ControlEntryVariant.Mini}
          icon={<Icon name={elllIcons16.corner} />}
          property="corner-top-left"
          name="Top Left Corner"
          styles={styles}
          control={BaseControlType.Length}
          controlSettings={{
            min: 0,
          }}
        />
        <InstanceStyleControlEntry
          variant={ControlEntryVariant.Mini}
          icon={
            <Icon
              name={elllIcons16.corner}
              style={{ transform: "rotate(90deg)" }}
            />
          }
          property="corner-top-right"
          name="Top Right Corner"
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
          icon={
            <Icon
              name={elllIcons16.corner}
              style={{ transform: "rotate(-90deg)" }}
            />
          }
          property="corner-bottom-left"
          name="Bottom Left Corner"
          styles={styles}
          control={BaseControlType.Length}
          controlSettings={{
            min: 0,
          }}
        />
        <InstanceStyleControlEntry
          variant={ControlEntryVariant.Mini}
          icon={
            <Icon
              name={elllIcons16.corner}
              style={{ transform: "rotate(180deg)" }}
            />
          }
          property="corner-bottom-right"
          name="Bottom Right Corner"
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
