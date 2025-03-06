import { Icon, useAction } from "@repo/components";
import { Style } from "@repo/elementa";
import {
  combineLatestOrEmpty,
  useManyObservables,
  useObservable,
} from "@repo/utils";
import { PropsWithChildren, useMemo } from "react";
import { map, Observable } from "rxjs";
import { StyleControlEntry } from "../../../../components/controls/infrastructure/style/style";
import {
  StylePropertyConfig,
  StylePropertyGroupConfig,
} from "../../../../components/controls/styles/properties";
import { useCommonReactivePair } from "../../../../hooks/utils/reactivity";

function Conditional({
  condition,
  condition$,
  children,
}: PropsWithChildren<{
  condition$: Observable<boolean>;
  condition: boolean;
}>) {
  const _condition = useObservable(condition$, condition);
  return _condition ? <>{children}</> : <></>;
}

function initProperty(property: StylePropertyConfig, styles: Style[]) {
  styles.forEach((style) => {
    style.setProperty(property.name, property.initialValue ?? "unset");

    property.groups?.forEach((group) => {
      group.properties?.forEach((prop) => {
        if (prop.autoInitialize) {
          initProperty(prop, styles);
        }
      });
    });
  });
}
function clearProperty(property: StylePropertyConfig, styles: Style[]) {
  styles.forEach((style) => {
    style.setProperty(property.name, undefined);

    property.groups?.forEach((group) => {
      group.properties?.forEach((prop) => {
        clearProperty(prop, styles);
      });
    });
  });
}

function StyleAction({
  index,
  styles,
  properties,
  name,
  icon,
  variant,
}: {
  index?: number;
  styles: Style[];
  properties: StylePropertyConfig[];
  name: string;
  icon: string;
  variant?: "single" | "multiple";
}) {
  useAction(
    {
      index,
      title: name,
      icon: icon,
      handler:
        variant === "single"
          ? () => {
              styles.forEach((style) => {
                properties?.forEach((property) => {
                  initProperty(property, styles);
                });
              });
            }
          : undefined,
      options:
        variant === "multiple"
          ? properties.map((property) => ({
              label: property.displayName ?? property.name,
              icon: <Icon name={property.icon} />,
              onClick: () => {
                initProperty(property, styles);
              },
            }))
          : undefined,
    },
    [index, styles.map((style) => style.key).join(","), properties.join(",")],
  );

  return <></>;
}

function addDigitToLowestRank(n: number, d: number) {
  // Check if n is an integer or a float
  if (Number.isInteger(n)) {
    // For integers, simply append the digit as the fractional part
    return parseFloat(`${n}.${d}`);
  } else {
    // For floats, append the digit to the string representation
    return parseFloat(n.toString() + d.toString());
  }
}

function StylePropertiesControlEntry({
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
      <StyleControlEntry
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

function CompoundStylePropertyGroupControlEntry({
  index,
  styles,
  group,
}: {
  index?: number;
  styles: Style[];
  group: StylePropertyGroupConfig;
}) {
  const propsKey = group.properties?.map((p) => p.name).join(",") ?? "";
  const stylesKey = styles.map((style) => style.key).join(",");
  const key = `${propsKey}:${stylesKey}`;

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
      <StyleControlEntry
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
  const propsKey = group.properties?.map((p) => p.name).join(",") ?? "";
  const stylesKey = styles.map((style) => style.key).join(",");
  const key = `${propsKey}:${stylesKey}`;

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

  const defineds = useManyObservables(_defineds$, _defineds, key);

  let action: JSX.Element | undefined = undefined;
  const entries: JSX.Element[] = [];
  const undefinedProperties: StylePropertyConfig[] = [];

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

function StylePropertyGroupControlEntry({
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

export function StylePropertiesControlSheet({
  styles,
  properties,
}: {
  styles: Style[];
  properties: StylePropertyGroupConfig[];
}): JSX.Element {
  return (
    <>
      {properties.map((entry, index) => {
        return (
          <StylePropertyGroupControlEntry
            key={index}
            index={index}
            styles={styles}
            group={entry}
          />
        );
      })}
    </>
  );
}
