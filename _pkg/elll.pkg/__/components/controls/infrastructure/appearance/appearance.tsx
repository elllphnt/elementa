import {
  Control,
  ControlEntry,
  ControlEntryVariant,
  ResolvedControlProps,
} from "@repo/components";
import { isVarRef, Style, StyleData, StylePropertyName } from "@repo/elementa";
import { useObservable } from "@repo/utils";
import { ReactNode, useRef } from "react";
import { map } from "rxjs";
import { useCommonReactivePair } from "../../../../hooks/utils/reactivity";
import {
  editorControlMap,
  EditorControlMap,
  EditorControlType,
} from "../../control_map";
import { VariableControl } from "../../datatypes/variable/variable";
import { styleControlViews } from "../style/_views/_";

export function AppearanceControlEntry<
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
}: {
  styles: Style<StyleData>[];
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
}) {
  const ref = useRef<HTMLDivElement>(null);

  const _properties = [property, ...(properties ?? [])].filter(Boolean) as P[];

  const key = [_properties, styles.map((style) => "st-" + style.key)].join(":");
  const [_value$, _value] = useCommonReactivePair(
    _properties.flatMap((property) =>
      styles.flatMap((style) => style.propertyValue$(property)),
    ),
    _properties.flatMap((property) =>
      styles.flatMap((style) => style.propertyValue(property) as any),
    ) as any,
    key,
  ) as any;
  const [_resolvedValue$, _resolvedValue] = useCommonReactivePair(
    _properties.flatMap((property) =>
      styles.flatMap((style) => style.resolvedCascadePropertyValues$(property)),
    ),
    _properties.flatMap((property) =>
      styles.flatMap(
        (style) => style.resolvedCascadePropertyValues(property) as any,
      ),
    ) as any,
    key,
  ) as any;
  const value = useObservable(_value$, _value);
  const resolvedValue = useObservable(_resolvedValue$, _resolvedValue);
  const isOwn = value !== undefined;

  let controlElement = <></>;
  const isVar = isVarRef(resolvedValue);

  if (isVar) {
    controlElement = (
      <VariableControl
        value={resolvedValue}
        value$={_resolvedValue$.pipe(
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
        value={_resolvedValue}
        value$={_resolvedValue$}
        onChange={(value: any) => {
          _properties.forEach((property) => {
            styles.forEach((style) => {
              style.setProperty(property as any, value);
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
        menu={{
          title: name,
          viewId: styleControlViews.menu.id,
          props: {
            styles,
            properties: _properties,
            menus,
          },
        }}
        active={isOwn}
        onRemove={
          isOwn
            ? () => {
                _properties.forEach((property) => {
                  styles.forEach((style) => {
                    style.setProperty(property as any, undefined);
                  });
                });
              }
            : undefined
        }
      >
        {controlElement}
      </ControlEntry>
    </>
  );
}
