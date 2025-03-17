import { isVarRef, StylePropertyName } from "@elllphnt/elll-element";
import {
  Control,
  ControlEntry,
  ControlEntryVariant,
  elllIcons16,
  ResolvedControlProps,
  useControlMenu,
} from "@repo/components";
import { Style } from "@repo/elementa-models";
import { useObservable } from "@repo/utils";
import { ReactNode, useRef } from "react";
import { map, Observable } from "rxjs";
import { useCommonReactivePair } from "../../../hooks/utils/reactivity";
import { EditorControlMap, elllControlMap, ElllControlType } from "./_types";
import { VariableControl } from "./style_variable";

export function useStyleControlEntry(
  styles: Style[],
  properties: StylePropertyName[],
  key: string,
) {
  return useCommonReactivePair(
    properties.flatMap((property) =>
      styles.flatMap((style) => style.propertyValueWithoutUnset$(property)),
    ),
    properties.flatMap((property) =>
      styles.flatMap(
        (style) => style.provertyValueWithoutUnset(property) as any,
      ),
    ) as any,
    key,
  ) as [Observable<any>, any];
}

export function handlePropertyChange(
  properties: StylePropertyName[],
  styles: Style[],
  value: any,
) {
  properties.forEach((property) => {
    styles.forEach((style) => {
      style.setProperty(property as any, value);
    });
  });
}

export function StylePropertyControlEntry<
  P extends StylePropertyName,
  T extends ElllControlType,
>({
  styles,
  property,
  properties,
  name,
  icon,
  control,
  controlSettings,
  variant,
  menus,
  action,
}: {
  styles: Style[];
  property?: P;
  properties?: P[];
  name: string;
  control: T;
  icon?: ReactNode;
  controlSettings?: ResolvedControlProps<EditorControlMap, T>["settings"];
  variant?: ControlEntryVariant;
  menus?: Array<{
    key?: string;
    title: string;
    viewId: string;
  }>;
  action?: {
    icon: string;
    label: string;
    handler: () => void;
    active?: boolean;
  };
}) {
  const { openMenu } = useControlMenu();
  const ref = useRef<HTMLDivElement>(null);
  const _properties = [property, ...(properties ?? [])].filter(Boolean) as P[];
  const key = [_properties, styles.map((style) => "st-" + style.key)].join(":");
  const [_value$, _value] = useStyleControlEntry(styles, _properties, key);
  const value = useObservable(_value$, _value);

  const isVar = isVarRef(value);
  const controlElement = isVar ? (
    <VariableControl
      value={value}
      value$={_value$.pipe(map((value) => (isVar ? value : undefined)))}
      onChange={(value) => handlePropertyChange(_properties, styles, value)}
      settings={{ title: name }}
    />
  ) : (
    <Control
      value={_value}
      value$={_value$}
      onChange={(value: any) =>
        handlePropertyChange(
          _properties,
          styles,
          value === undefined ? "unset" : value,
        )
      }
      type={control as any}
      settings={controlSettings}
      map={elllControlMap}
    />
  );

  return (
    <ControlEntry
      ref={ref}
      icon={icon}
      variant={variant}
      label={name}
      active={value !== "unset" && value !== undefined}
      menu={{
        title: name,
        viewId: "styleControlViews.menu.id",
        props: { styles, properties: _properties, menus },
      }}
      onRemove={() => handlePropertyChange(_properties, styles, undefined)}
      action={action}
      quickAction={
        !isVar
          ? {
              icon: elllIcons16.variable,
              label: "Variable",
              handler: () => {
                openMenu({
                  viewId: "styleControlViews.menu.id",
                  anchor: ref.current ?? undefined,
                  title: name,
                  props: {
                    styles,
                    properties: _properties,
                    menus,
                    initialPath: "variable",
                  },
                });
              },
            }
          : undefined
      }
    >
      {controlElement}
    </ControlEntry>
  );
}
