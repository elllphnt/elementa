import { Icon } from "@repo/components";
import { Style } from "@repo/elementa-models";
import { map } from "rxjs";
import { StylePropertyControlEntry } from "~/src/components/ui/controls/style_property";
import { useCommonReactivePair } from "~/src/hooks/utils/reactivity";
import { StylePropertyConfig } from "~/src/modules/elementa/style/properties";
import { Conditional } from "./conditional";
import { StylePropertyGroupControlEntry } from "./group_control_entry";
import { addDigitToLowestRank } from "./utils";

export function StylePropertiesControlEntry({
  index,
  styles,
  property,
}: {
  index?: number;
  styles: Style[];
  property: StylePropertyConfig;
}) {
  const [_value$, _value] = useCommonReactivePair(
    styles.map((style) => style.propertyValue$(property.name)),
    styles.map((style) => style.propertyValue(property.name)),
    styles.map((style) => style.key).join(",") + ":" + property.name,
  );
  return (
    <>
      <StylePropertyControlEntry
        styles={styles}
        property={property.name}
        name={property.displayName ?? property.name}
        control={property.control}
        icon={property.icon ? <Icon name={property.icon} /> : undefined}
        controlSettings={property.controlSettings}
        variant={property.variant}
      />

      {property.groups?.map((group, _index) => {
        if (group.enabled) {
          return (
            <Conditional
              condition$={_value$.pipe(map(group.enabled))}
              condition={group.enabled(_value)}
            >
              <StylePropertyGroupControlEntry
                key={_index}
                index={addDigitToLowestRank(index || 0, _index)}
                styles={styles}
                group={group}
              />
            </Conditional>
          );
        } else {
          return (
            <StylePropertyGroupControlEntry
              key={_index}
              index={addDigitToLowestRank(index || 0, _index)}
              styles={styles}
              group={group}
            />
          );
        }
      })}
    </>
  );
}
