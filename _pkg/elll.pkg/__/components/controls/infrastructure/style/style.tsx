import {
  Control,
  ControlEntry,
  ControlEntryVariant,
  ResolvedControlProps,
} from "@repo/components";
import { isVarRef, Style, StylePropertyName } from "@repo/elementa";
import { useObservable } from "@repo/utils";
import { ReactNode, useRef } from "react";
import { map, Observable } from "rxjs";
import { useCommonReactivePair } from "../../../../hooks/utils/reactivity";
import {
  editorControlMap,
  EditorControlMap,
  EditorControlType,
} from "../../control_map";
import { VariableControl } from "../../datatypes/variable/variable";
import { styleControlViews } from "./_views/_";

export function StyleControlEntry<
  P extends StylePropertyName,
  T extends EditorControlType,
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
  };
}) {
  const ref = useRef<HTMLDivElement>(null);

  const _properties = [property, ...(properties ?? [])].filter(Boolean) as P[];

  const key = [_properties, styles.map((style) => "st-" + style.key)].join(":");
  const [_value$, _value] = useCommonReactivePair(
    _properties.flatMap((property) =>
      styles.flatMap((style) => style.propertyValueWithoutUnset$(property)),
    ),
    _properties.flatMap((property) =>
      styles.flatMap(
        (style) => style.provertyValueWithoutUnset(property) as any,
      ),
    ) as any,
    key,
  ) as [Observable<any>, any];
  const value = useObservable(_value$, _value);

  let controlElement = <></>;
  const isVar = isVarRef(value);

  if (isVar) {
    controlElement = (
      <VariableControl
        value={value}
        value$={_value$.pipe(
          map((value) => {
            if (isVarRef(value)) {
              return value;
            }
            return undefined;
          }),
        )}
        onChange={(value) => {
          _properties.forEach((property) => {
            styles.forEach((style) => {
              style.setProperty(property as any, value);
            });
          });
        }}
        settings={{
          title: name,
        }}
      />
    );
  } else {
    controlElement = (
      <Control
        value={_value}
        value$={_value$}
        onChange={(value: any) => {
          _properties.forEach((property) => {
            styles.forEach((style) => {
              style.setProperty(
                property as any,
                value === undefined ? "unset" : value,
              );
            });
          });
        }}
        type={control as any}
        settings={controlSettings}
        map={editorControlMap}
      />
    );
  }

  return (
    <>
      <ControlEntry
        ref={ref}
        icon={icon}
        variant={variant}
        label={name}
        active={value !== "unset" && value !== undefined}
        menu={{
          title: name,
          viewId: styleControlViews.menu.id,
          props: {
            styles,
            properties: _properties,
            menus,
          },
        }}
        onRemove={() => {
          _properties.forEach((property) => {
            styles.forEach((style) => {
              style.setProperty(property as any, undefined);
            });
          });
        }}
        action={action}
      >
        {controlElement}
      </ControlEntry>
    </>
  );
}
