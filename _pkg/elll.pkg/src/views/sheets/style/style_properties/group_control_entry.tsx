import { Icon } from "@repo/components";
import { Style } from "@repo/elementa-models";
import { combineLatestOrEmpty, useManyObservables } from "@repo/utils";
import { useMemo } from "react";
import { map } from "rxjs";
import { StylePropertyControlEntry } from "~/src/components/ui/controls/style_property";
import {
  StylePropertyConfig,
  StylePropertyGroupConfig,
} from "~/src/modules/elementa/style/properties";
import { StylePropertiesControlEntry } from "./control_entry";
import { StyleAction } from "./style_action";
import { addDigitToLowestRank } from "./utils";

function CompoundStylePropertyGroupControlEntry({
  index,
  styles,
  group,
}: {
  index?: number;
  styles: Style[];
  group: StylePropertyGroupConfig;
}) {
  // Generate a unique key based on properties and styles
  const propsKey = group.properties?.map((p) => p.name).join(",") ?? "";
  const stylesKey = styles.map((style) => style.key).join(",");
  const key = `${propsKey}:${stylesKey}`;

  // Memoize the defined properties and their observables
  const [_defineds$, _defineds] = useMemo(() => {
    const defineds =
      group.properties?.map((prop) =>
        styles.some((style) => style.propertyDefined(prop.name)),
      ) ?? [];
    const defineds$ =
      group.properties?.map((prop) =>
        combineLatestOrEmpty(
          styles.map((style) => style.propertyDefined$(prop.name)),
        ).pipe(map((defineds) => defineds.some((d) => d))),
      ) ?? [];
    return [defineds$, defineds];
  }, [key]);

  // Use observables to track defined properties
  const defineds = useManyObservables(_defineds$, _defineds, key);
  const defined = defineds.some((d) => d);
  const compounds = useManyObservables(
    styles.map((style) => style.setting$(group.compound!.key)),
    styles.map((style) => style.setting(group.compound!.key)),
    key,
  );
  const compound = compounds.every((c) => c ?? true);

  let action: JSX.Element | undefined = undefined;
  const entries: JSX.Element[] = [];
  const undefinedProperties: StylePropertyConfig[] = [];

  // Handle compound properties
  if (compound) {
    if (!defined) {
      action = (
        <StyleAction
          index={index}
          styles={styles}
          properties={group.properties ?? []}
          name={group.name}
          icon={group.icon}
          variant="single"
        />
      );
    }
  } else {
    for (let i = 0; i < defineds.length; i++) {
      const property = group.properties![i];
      const isDefined = defineds[i];

      if (isDefined) {
        entries.push(
          <StylePropertiesControlEntry
            key={property.name}
            index={addDigitToLowestRank(index || 0, i)}
            styles={styles}
            property={property}
          />,
        );
      } else {
        undefinedProperties.push(property);
      }
    }

    if (undefinedProperties.length > 0) {
      action = (
        <StyleAction
          index={index}
          styles={styles}
          properties={undefinedProperties}
          name={group.name}
          icon={group.icon}
          variant="multiple"
        />
      );
    }
  }

  if (!defined) {
    return <>{action}</>;
  }

  return (
    <>
      {action}
      <StylePropertyControlEntry
        styles={styles}
        properties={group.properties?.map((p) => p.name) ?? []}
        name={group.name}
        icon={group.icon ? <Icon name={group.icon} /> : undefined}
        control={group.compound!.control}
        controlSettings={group.compound!.controlSettings}
        action={{
          icon: group.compound!.icon,
          label: group.compound!.label,
          handler: () => {
            styles.forEach((style) => {
              style.setSetting(group.compound!.key, !compound);
            });
          },
          active: !compound,
        }}
      />
      {entries.length ? (
        <div
          style={{
            display: "flex",
            columnGap: "24px",
            rowGap: "8px",
            flexWrap: "wrap",
          }}
        >
          {entries}
        </div>
      ) : (
        <></>
      )}
    </>
  );
}

function FlatStylePropertyGroupControlEntry({
  index,
  styles,
  group,
}: {
  index?: number;
  styles: Style[];
  group: StylePropertyGroupConfig;
}) {
  // Generate a unique key based on properties and styles
  const propsKey = group.properties?.map((p) => p.name).join(",") ?? "";
  const stylesKey = styles.map((style) => style.key).join(",");
  const key = `${propsKey}:${stylesKey}`;

  // Memoize the defined properties and their observables
  const [_defineds$, _defineds] = useMemo(() => {
    const defineds =
      group.properties?.map((prop) =>
        styles.some((style) => style.propertyDefined(prop.name)),
      ) ?? [];
    const defineds$ =
      group.properties?.map((prop) =>
        combineLatestOrEmpty(
          styles.map((style) => style.propertyDefined$(prop.name)),
        ).pipe(map((defineds) => defineds.some((d) => d))),
      ) ?? [];
    return [defineds$, defineds];
  }, [key]);

  // Use observables to track defined properties
  const defineds = useManyObservables(_defineds$, _defineds, key);

  let action: JSX.Element | undefined = undefined;
  const entries: JSX.Element[] = [];
  const undefinedProperties: StylePropertyConfig[] = [];

  // Handle flat properties
  for (let i = 0; i < defineds.length; i++) {
    const property = group.properties![i];
    const isDefined = defineds[i];

    if (isDefined) {
      entries.push(
        <StylePropertiesControlEntry
          key={property.name}
          index={addDigitToLowestRank(index || 0, i)}
          styles={styles}
          property={property}
        />,
      );
    } else {
      undefinedProperties.push(property);
    }
  }
  if (undefinedProperties.length > 0) {
    action = (
      <StyleAction
        index={index}
        styles={styles}
        properties={undefinedProperties}
        name={group.name}
        icon={group.icon}
        variant={(group.properties?.length ?? 0) > 1 ? "multiple" : "single"}
      />
    );
  }

  return (
    <>
      {action}
      {entries}
    </>
  );
}

// Main component to handle style property group control entry
export function StylePropertyGroupControlEntry({
  index,
  styles,
  group,
}: {
  index?: number;
  styles: Style[];
  group: StylePropertyGroupConfig;
}) {
  if (group.compound) {
    return (
      <CompoundStylePropertyGroupControlEntry
        index={index}
        styles={styles}
        group={group}
      />
    );
  } else {
    return (
      <FlatStylePropertyGroupControlEntry
        index={index}
        styles={styles}
        group={group}
      />
    );
  }
}
